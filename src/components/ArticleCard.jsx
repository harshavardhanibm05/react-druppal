function ArticleCard({ title, content, imageUrl, imageAlt }) {
  return (
    <article className="article-card">
      {imageUrl && (
        <div className="article-card__image-wrap">
          <img src={imageUrl} alt={imageAlt || title} className="article-card__image" />
        </div>
      )}
      <div className="article-card__body">
        <h2 className="article-card__title">{title}</h2>
        {content && <p className="article-card__content">{content}</p>}
      </div>
    </article>
  )
}

export default ArticleCard
