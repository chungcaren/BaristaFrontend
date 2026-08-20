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
  const [orders, setOrders] = useState([])
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(null)
  const [slow, setSlow] = useState(false)
  const nextId = useRef(0)
  const inputRef = useRef(null)
  const bottomRef = useRef(null)

  const started = orders.length > 0 || pending !== null

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [orders, pending])

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

  async function order(drink) {
    const trimmed = drink.trim()
    if (!trimmed || pending) return

    setDraft('')
    setSlow(false)
    setPending(trimmed)

    try {
      const recipe = await fetchRecipe({ drink: trimmed })
      setOrders((prev) => [...prev, { id: nextId.current++, drink: trimmed, recipe }])
    } catch (err) {
      setOrders((prev) => [
        ...prev,
        {
          id: nextId.current++,
          drink: trimmed,
          recipe: `That page came back blank — ${err.message}`,
          error: true,
        },
      ])
    } finally {
      setPending(null)
      inputRef.current?.focus()
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    order(draft)
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      order(draft)
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
        <span className="wordmark">The Barista's Book</span>
        {started && (
          <button
            type="button"
            className="reset"
            onClick={() => setOrders([])}
            disabled={pending !== null}
          >
            Close book
          </button>
        )}
      </header>

      {started ? (
        <main className="book">
          {orders.map((entry, i) => (
            <RecipePage key={entry.id} order={entry} number={i + 1} />
          ))}
          {pending && (
            <PendingPage
              drink={pending}
              hint={slow ? 'Warming up the espresso machine…' : null}
            />
          )}
          <div ref={bottomRef} />
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
                <button type="button" onClick={() => order(s)}>
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
