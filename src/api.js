// In dev, requests go to /api and Vite proxies them to the FastAPI server
// (see vite.config.js). Set VITE_API_URL to point at a deployed backend.
const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export async function fetchRecipe({ drink, notes = null }) {
  const res = await fetch(`${API_BASE}/recipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ drink, notes }),
  })

  if (!res.ok) {
    let message = `The barista couldn't reach the kitchen (${res.status}).`
    try {
      const body = await res.json()
      if (body?.detail) {
        message =
          typeof body.detail === 'string'
            ? body.detail
            : JSON.stringify(body.detail)
      }
    } catch {
      // Response wasn't JSON — keep the generic message.
    }
    throw new Error(message)
  }

  const data = await res.json()
  return data.recipe
}
