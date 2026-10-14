import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── Drupal credentials ───────────────────────────────────────────────────────
// Drupal's JSON:API write endpoints require Basic Auth (or OAuth).
// Store credentials in environment variables — never hard-code them.
// Add a .env file at react-druppal/app/ with:
//   VITE_DRUPAL_USER=your_admin_username
//   VITE_DRUPAL_PASS=your_admin_password
const DRUPAL_USER = import.meta.env.VITE_DRUPAL_USER ?? ''
const DRUPAL_PASS = import.meta.env.VITE_DRUPAL_PASS ?? ''
const basicAuth = `Basic ${btoa(`${DRUPAL_USER}:${DRUPAL_PASS}`)}`

// ─── Step 1: Upload binary file, get file--file entity id ────────────────────
async function uploadFile(file) {
  const res = await fetch(
    `/api/jsonapi/media/image/field_media_image`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `file; filename="${file.name}"`,
        Authorization: basicAuth,
      },
      body: file,
      cache: 'no-store',
    },
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`File upload failed (${res.status}): ${text}`)
  }
  const json = await res.json()
  return json.data.id // file--file uuid
}

// ─── Step 2: Create media--image entity referencing the uploaded file ─────────
async function createMediaImage(fileId, filename) {
  const res = await fetch(`/api/jsonapi/media/image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
      Authorization: basicAuth,
    },
    body: JSON.stringify({
      data: {
        type: 'media--image',
        attributes: { name: filename },
        relationships: {
          field_media_image: {
            data: { type: 'file--file', id: fileId },
          },
        },
      },
    }),
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Media creation failed (${res.status}): ${text}`)
  }
  const json = await res.json()
  return json.data.id // media--image uuid
}

// ─── Step 3: Create node--articles referencing the media entity ───────────────
async function createArticleNode(title, content, mediaId) {
  const body = {
    data: {
      type: 'node--articles',
      attributes: {
        title,
        field_content_: content,
        status: true,
        moderation_state: 'published',
      },
    },
  }
  if (mediaId) {
    body.data.relationships = {
      field_image: { data: { type: 'media--image', id: mediaId } },
    }
  }

  const res = await fetch(`/api/jsonapi/node/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
      Authorization: basicAuth,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Article creation failed (${res.status}): ${text}`)
  }
  return res.json()
}

// ─── Component ────────────────────────────────────────────────────────────────
function CreateArticle() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(null)

  const [step, setStep] = useState('') // progress label shown during submit
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function handleImageChange(e) {
    const file = e.target.files?.[0] ?? null
    setImageFile(file)
    if (file) {
      setPreview(URL.createObjectURL(file))
    } else {
      setPreview(null)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      let mediaId = null

      if (imageFile) {
        setStep('Uploading image…')
        const fileId = await uploadFile(imageFile)

        setStep('Creating media entity…')
        mediaId = await createMediaImage(fileId, imageFile.name)
      }

      setStep('Creating article…')
      await createArticleNode(title.trim(), content.trim(), mediaId)

      // Go back to the articles list — it will re-fetch with no-store
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
      setStep('')
    }
  }

  return (
    <main className="create-page">
      <header className="create-header">
        <h1>New Article</h1>
      </header>

      <form className="create-form" onSubmit={handleSubmit} noValidate>
        {/* Title */}
        <div className="form-field">
          <label htmlFor="article-title" className="form-label">
            Title <span className="form-required">*</span>
          </label>
          <input
            id="article-title"
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter article title"
            required
            disabled={submitting}
          />
        </div>

        {/* Content */}
        <div className="form-field">
          <label htmlFor="article-content" className="form-label">
            Content
          </label>
          <textarea
            id="article-content"
            className="form-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your article content here…"
            rows={10}
            disabled={submitting}
          />
        </div>

        {/* Image */}
        <div className="form-field">
          <label htmlFor="article-image" className="form-label">
            Image
          </label>
          <input
            id="article-image"
            ref={fileInputRef}
            type="file"
            className="form-file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={submitting}
          />
          {preview && (
            <div className="form-preview">
              <img src={preview} alt="Preview" />
            </div>
          )}
        </div>

        {/* Progress / error */}
        {submitting && step && (
          <p className="form-status">{step}</p>
        )}
        {error && (
          <p className="form-status form-status--error">{error}</p>
        )}

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => navigate('/')}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting || !title.trim()}
          >
            {submitting ? 'Publishing…' : 'Publish Article'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default CreateArticle
