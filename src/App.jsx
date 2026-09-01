import { useEffect, useRef, useState } from 'react'
import { fetchRecipe } from './api'
import RecipePage from './components/RecipePage'
import PendingPage from './components/PendingPage'
import './App.css'

const SUGGESTIONS = [
  'Iced brown sugar oat latte',
  'Classic cappuccino',
  'Matcha latte',
  'Cold brew with vanilla foam',
]

function App() {
  // Only one recipe is on screen at a time — a new order turns the page.
  const [entry, setEntry] = useState(null)
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(null)
  const [slow, setSlow] = useState(false)
  const nextId = useRef(0)
  const inputRef = useRef(null)

  const started = entry !== null || pending !== null

  // A fresh page starts at the top.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [entry, pending])

  // The backend sleeps on Render's free tier, so the first order of the day can
  // take a while. Say so rather than leaving the page blank.
  useEffect(() => {
    if (!pending) return
    const timer = setTimeout(() => setSlow(true), 6000)
    return () => clearTimeout(timer)
  }, [pending])

  // Grow the textarea with its content, up to the max-height set in CSS.
  useEffect(() => {
    const input = inputRef.current
    if (!input) return
    input.style.height = 'auto'
    input.style.height = `${input.scrollHeight}px`
  }, [draft, started])

  async function submitOrder(text) {
    const trimmed = text.trim()
    if (!trimmed || pending) return

    setDraft('')
    setSlow(false)
    setEntry(null) // clear the old recipe before the new one is written
    setPending(trimmed)

    const id = nextId.current++

    try {
      const { drinkName, prepTime, recipe } = await fetchRecipe(trimmed)
      setEntry({ id, order: trimmed, drinkName, prepTime, recipe })
    } catch (err) {
      setEntry({ id, order: trimmed, error: err.message })
    } finally {
      setPending(null)
      inputRef.current?.focus()
    }
  }

  function closeBook() {
    setEntry(null)
    nextId.current = 0
  }

  function handleSubmit(event) {
    event.preventDefault()
    submitOrder(draft)
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submitOrder(draft)
    }
  }

  const composer = (
    <form className="composer" onSubmit={handleSubmit}>
      <textarea
        ref={inputRef}
        className="composer-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="An oat milk latte with a shot of vanilla…"
        rows={1}
        aria-label="What drink would you like?"
        autoFocus
      />
      <button
        type="submit"
        className="send"
        disabled={pending !== null || !draft.trim()}
        aria-label="Look up recipe"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 12h13M12 5l7 7-7 7" />
        </svg>
      </button>
    </form>
  )

  return (
    <div className={`app${started ? ' started' : ''}`}>
      <header className="topbar">
        <span className="mark" aria-hidden="true">
          ☕
        </span>
        <span className="wordmark">Barista Buddy</span>
        {started && (
          <button
            type="button"
            className="reset"
            onClick={closeBook}
            disabled={pending !== null}
          >
            Close book
          </button>
        )}
      </header>

      {started ? (
        <main className="book">
          {pending ? (
            <PendingPage
              order={pending}
              hint={slow ? 'Warming up the espresso machine…' : null}
            />
          ) : (
            // Keying on the id remounts the article, so every new recipe
            // replays the page-turn animation.
            <RecipePage key={entry.id} entry={entry} shareable />
          )}
        </main>
      ) : (
        <main className="welcome">
          <h1>What can I make for you today?</h1>
          <p className="tagline">
            Name a drink and I'll write the recipe out for you, measurements and
            all.
          </p>
          {composer}
          <ul className="suggestions">
            {SUGGESTIONS.map((s) => (
              <li key={s}>
                <button type="button" onClick={() => submitOrder(s)}>
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </main>
      )}

      {started && <div className="composer-dock">{composer}</div>}
    </div>
  )
}

export default App
