import Markdown from 'react-markdown'
import ShareButton from './ShareButton'

// The model names the drink itself, so it often differs from what was typed.
// Show the original order too, unless it's essentially the same words.
function sameWords(a = '', b = '') {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  return norm(a) === norm(b)
}

export default function RecipePage({ entry, shareable = false }) {
  const { order, drinkName, prepTime, recipe, error } = entry

  if (error) {
    return (
      <article className="page note">
        <p className="note-order">“{order}”</p>
        <p>{error}</p>
      </article>
    )
  }

  const title = drinkName || order

  return (
    <article className="page">
      <p className="eyebrow">Recipe</p>
      <h2 className="page-title">{title}</h2>
      {!sameWords(title, order) && <p className="page-order">“{order}”</p>}
      {prepTime && <p className="prep-time">{prepTime}</p>}
      <div className="ornament" aria-hidden="true">
        ✦
      </div>
      <div className="page-body">
        <Markdown>{recipe}</Markdown>
      </div>
      {shareable && <ShareButton entry={entry} />}
    </article>
  )
}
