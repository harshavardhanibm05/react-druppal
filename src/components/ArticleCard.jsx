import { Link } from 'react-router-dom'

function ArticleCard({ id, title, content, imageUrl, imageAlt }) {
  return (
    <article className="article-card">
      {imageUrl && (
        <Link to={`/articles/${id}`} className="article-card__image-link">
          <div className="article-card__image-wrap">
            <img
              src={imageUrl}
              alt={imageAlt || title}
              className="article-card__image"
            />
          </div>
        </Link>
      )}
      <div className="article-card__body">
        <h2 className="article-card__title">
          <Link to={`/articles/${id}`} className="article-card__title-link">
            {title}
          </Link>
        </h2>
        {content && <p className="article-card__content">{content}</p>}
        <div className="article-card__footer">
          <Link to={`/articles/${id}`} className="article-card__read-more">
            Read article &rarr;
          </Link>
        </div>
      </div>
    </article>
  )
}

export default ArticleCard
