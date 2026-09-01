import { useEffect, useState } from 'react'
import { loadSavedRecipe } from '../api'
import RecipePage from './RecipePage'

export default function SharedRecipe({ id, onLeave }) {
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })

    loadSavedRecipe(id)
      .then((entry) => {
        if (!cancelled) setState({ status: 'ready', entry })
      })
      .catch((err) => {
        if (!cancelled) setState({ status: 'error', message: err.message })
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <div className="app started">
      <header className="topbar">
        <span className="mark" aria-hidden="true">
          ☕
        </span>
        <span className="wordmark">Barista Buddy</span>
        <button type="button" className="reset" onClick={onLeave}>
          Make your own
        </button>
      </header>

      <main className="book">
        {state.status === 'loading' && (
          <article className="page pending-page" aria-busy="true">
            <p className="eyebrow">Recipe</p>
            <div className="ornament" aria-hidden="true">
              ✦
            </div>
            <div className="page-body" role="status">
              <div className="ruled-lines" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p className="writing">Finding that page…</p>
            </div>
          </article>
        )}

        {state.status === 'error' && (
          <article className="page note">
            <p>{state.message}</p>
          </article>
        )}

        {state.status === 'ready' && <RecipePage entry={state.entry} />}
      </main>
    </div>
  )
}
