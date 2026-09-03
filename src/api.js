// In dev, requests go to /api and Vite proxies them to the FastAPI server
// (see vite.config.js). Set VITE_API_URL to point at a deployed backend.
const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

async function failure(res, fallback) {
  let message = fallback
  try {
    const body = await res.json()
    if (body?.detail) {
      message =
        typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail)
    }
  } catch {
    // Response wasn't JSON — keep the generic message.
  }
  return new Error(message)
}

// `order` is freeform text — a drink name, a description, however it was typed.
export async function fetchRecipe(order) {
  const res = await fetch(`${API_BASE}/recipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order }),
  })

  if (!res.ok) {
    throw await failure(res, `The barista couldn't reach the kitchen (${res.status}).`)
  }

  const data = await res.json()
  return {
    drinkName: data.drink_name,
    prepTime: data.prep_time,
    recipe: data.recipe,
  }
}

// Store a recipe so it can be shared. Resolves to its share id.
export async function saveRecipe({ order, drinkName, prepTime, recipe }) {
  const res = await fetch(`${API_BASE}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order,
      drink_name: drinkName,
      prep_time: prepTime ?? null,
      recipe,
    }),
  })

  if (!res.ok) {
    throw await failure(res, `Couldn't save the recipe (${res.status}).`)
  }

  const data = await res.json()
  return data.id
}

// Fetch a recipe someone shared with us.
export async function loadSavedRecipe(id) {
  const res = await fetch(`${API_BASE}/recipes/${encodeURIComponent(id)}`)

  if (!res.ok) {
    throw await failure(res, `Couldn't open that recipe (${res.status}).`)
  }

  const data = await res.json()
  return {
    id: data.id,
    order: data.order,
    drinkName: data.drink_name,
    prepTime: data.prep_time,
    recipe: data.recipe,
  }
}
