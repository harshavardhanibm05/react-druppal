import { useEffect, useState } from 'react'
import ArticleCard from './ArticleCard'

// The JSON:API endpoint with the image file included via the relationship chain:
//   field_image (media entity) -> field_media_image (actual file entity)
const API_URL =
  '/api/jsonapi/node/articles?include=field_image.field_media_image'

/**
 * Build a map of { fileEntityId -> absoluteUrl } from the `included` array
 * so each article card can resolve its image URL without extra fetches.
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

function Articles() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(API_URL, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((json) => {
        const mediaImageUrlById = buildImageMap(json.included)

        const parsed = (json.data ?? []).map((node) => {
          const mediaId = node.relationships?.field_image?.data?.id ?? null
          const imageUrl = mediaId ? mediaImageUrlById[mediaId] : null

          return {
            id: node.id,
            title: node.attributes?.title ?? '',
            content: node.attributes?.field_content_ ?? '',
            // Drupal serves relative file paths like /sites/default/files/...
            // We prefix with the Drupal origin so the image resolves correctly.
            imageUrl: imageUrl
              ? `http://my-druppal-test.ddev.site${imageUrl}`
              : null,
            imageAlt: node.attributes?.title ?? '',
          }
        })

        setArticles(parsed)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="articles-status">
        <p>Loading articles…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="articles-status articles-status--error">
        <p>Failed to load articles: {error}</p>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="articles-status">
        <p>No articles found.</p>
      </div>
    )
  }

  return (
    <main className="articles-page">
      <header className="articles-header">
        <h1>Articles</h1>
      </header>
      <div className="articles-grid">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            title={article.title}
            content={article.content}
            imageUrl={article.imageUrl}
            imageAlt={article.imageAlt}
          />
        ))}
      </div>
    </main>
  )
}

export default Articles
