import { useState } from 'react'
import { saveRecipe } from '../api'

const LABELS = {
  idle: 'Save & share',
  saving: 'Saving…',
  saved: 'Copy link again',
  copied: 'Link copied ✓',
}

export default function ShareButton({ entry }) {
  const [status, setStatus] = useState('idle')
  const [url, setUrl] = useState(null)
  const [error, setError] = useState(null)
  // Set when the clipboard is unavailable (Safari permissions, an insecure
  // origin) so the reader can copy the link by hand instead.
  const [manual, setManual] = useState(false)

  async function copy(link) {
    try {
      await navigator.clipboard.writeText(link)
      setStatus('copied')
      setTimeout(() => setStatus('saved'), 2500)
    } catch {
      setManual(true)
      setStatus('saved')
    }
  }

  async function handleClick() {
    setError(null)

    // Already saved — the link is stable, so just put it back on the clipboard.
    if (url) {
      copy(url)
      return
    }

    setStatus('saving')
    try {
      const id = await saveRecipe(entry)
      const link = `${window.location.origin}/r/${id}`
      setUrl(link)
      await copy(link)
    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }

  return (
    <div className="share">
      <button
        type="button"
        className={`share-button${status === 'copied' ? ' is-copied' : ''}`}
        onClick={handleClick}
        disabled={status === 'saving'}
      >
        {LABELS[status]}
      </button>

      {manual && url && (
        <input
          className="share-url"
          value={url}
          readOnly
          onFocus={(e) => e.target.select()}
          aria-label="Share link"
        />
      )}

      {error && <p className="share-error">{error}</p>}
    </div>
  )
}
