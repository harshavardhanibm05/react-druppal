import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

/**
 * Build a map of { fileEntityId -> absoluteUrl } from the `included` array
 * so the article can resolve its image URL without extra fetches.
 */
function buildImageMap(included = []) {
  const fileUrlById = {}

  // First pass: collect file--file entities (they carry uri.url)
  included.forEach((item) => {
    if (item.type === 'file--file') {
      fileUrlById[item.id] = item.attributes?.uri?.url ?? null
    }
  })

  // Second pass: map media--image id -> resolved file URL via its relationship
  const mediaImageUrlById = {}
  included.forEach((item) => {
    if (item.type === 'media--image') {
      const fileRel = item.relationships?.field_media_image?.data
      if (fileRel) {
        mediaImageUrlById[item.id] = fileUrlById[fileRel.id] ?? null
      }
    }
  })

  return mediaImageUrlById
}

function SingleArticle() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false

    fetch(`/api/jsonapi/node/articles/${id}?include=field_image.field_media_image`, {
      cache: 'no-store',
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Article not found')
          }
          throw new Error(`HTTP ${res.status}`)
        }
        return res.json()
      })
      .then((json) => {
        if (ignore) return
        const mediaImageUrlById = buildImageMap(json.included ?? [])
        const node = json.data

        if (!node) {
          throw new Error('Article not found')
        }

        const mediaId = node.relationships?.field_image?.data?.id ?? null
        const imageUrl = mediaId ? mediaImageUrlById[mediaId] : null

        setArticle({
          id: node.id,
          title: node.attributes?.title ?? '',
          content: node.attributes?.field_content_ ?? '',
          imageUrl: imageUrl
            ? `http://my-druppal-test.ddev.site${imageUrl}`
            : null,
          imageAlt: node.attributes?.title ?? '',
        })
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message)
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="articles-status">
        <p>Loading article…</p>
      </div>
    )
  }

  if (error || !article) {
    return (
      <main className="single-article-page">
        <div className="single-article__nav">
          <Link to="/" className="back-link">
            &larr; Back to articles
          </Link>
        </div>
        <div className="articles-status articles-status--error">
          <p>{error || 'Article not found'}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="single-article-page">
      <div className="single-article__nav">
        <Link to="/" className="back-link">
          &larr; Back to articles
        </Link>
      </div>

      <article className="single-article">
        <header className="single-article__header">
          <h1 className="single-article__title">{article.title}</h1>
        </header>

        {article.imageUrl && (
          <div className="single-article__image-wrap">
            <img
              src={article.imageUrl}
              alt={article.imageAlt || article.title}
              className="single-article__image"
            />
          </div>
        )}

        <div className="single-article__content">
          {article.content ? (
            article.content
              .split('\n')
              .filter((paragraph) => paragraph.trim() !== '')
              .map((paragraph, index) => <p key={index}>{paragraph}</p>)
          ) : (
            <p className="single-article__empty">No content available.</p>
          )}
        </div>
      </article>
    </main>
  )
}

export default SingleArticle
