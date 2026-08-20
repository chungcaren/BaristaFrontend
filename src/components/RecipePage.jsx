import Markdown from 'react-markdown'

export default function RecipePage({ order, number }) {
  const { drink, recipe, error } = order

  if (error) {
    return (
      <article className="page note">
        <p>{recipe}</p>
      </article>
    )
  }

  return (
    <article className="page">
      <p className="eyebrow">Recipe</p>
      <h2 className="page-title">{drink}</h2>
      <div className="ornament" aria-hidden="true">
        ✦
      </div>
      <div className="page-body">
        <Markdown>{recipe}</Markdown>
      </div>
      <footer className="page-number">
        <span aria-hidden="true">№ {number}</span>
      </footer>
    </article>
  )
}
