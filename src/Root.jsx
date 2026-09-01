import { useEffect, useState } from 'react'
import App from './App'
import SharedRecipe from './components/SharedRecipe'

// One route worth matching — /r/<share id> — so this is cheaper than pulling in
// a router. Netlify's SPA fallback serves index.html for these paths already.
const SHARE_PATH = /^\/r\/([A-Za-z0-9_-]{6,32})\/?$/

function shareIdFromLocation() {
  const match = window.location.pathname.match(SHARE_PATH)
  return match ? match[1] : null
}

export default function Root() {
  const [shareId, setShareId] = useState(shareIdFromLocation)

  // Keep the view in step with the back/forward buttons.
  useEffect(() => {
    const onPopState = () => setShareId(shareIdFromLocation())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  function leaveShared() {
    window.history.pushState({}, '', '/')
    setShareId(null)
  }

  return shareId ? (
    <SharedRecipe id={shareId} onLeave={leaveShared} />
  ) : (
    <App />
  )
}
