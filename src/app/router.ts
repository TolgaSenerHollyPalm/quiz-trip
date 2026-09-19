import { useSyncExternalStore } from 'react'

// Routes live in the URL hash, so GitHub Pages only ever serves index.html from the /quiz-trip/ folder.
export type Route =
  | { screen: 'home' }
  | { screen: 'trip'; packId: string }
  | { screen: 'players'; packId: string; next?: 'quiz' }
  | { screen: 'quiz'; packId: string }
  | { screen: 'play'; packId: string }
  | { screen: 'result'; packId: string; roundId: string }
  | { screen: 'scores'; packId: string }

export function href(route: Route): string {
  if (route.screen === 'home') return '#/'
  const trip = `#/trip/${encodeURIComponent(route.packId)}`
  switch (route.screen) {
    case 'trip':
      return trip
    case 'players':
      return `${trip}/players${route.next ? `?next=${route.next}` : ''}`
    case 'quiz':
      return `${trip}/quiz`
    case 'play':
      return `${trip}/play`
    case 'result':
      return `${trip}/result/${encodeURIComponent(route.roundId)}`
    case 'scores':
      return `${trip}/scores`
  }
}

export function parseRoute(hash: string): Route {
  const [path, query = ''] = hash.replace(/^#/, '').split('?')
  let parts: string[]
  try {
    parts = path.split('/').filter(Boolean).map(decodeURIComponent)
  } catch {
    return { screen: 'home' }
  }
  const [section, packId, page, id] = parts
  if (section !== 'trip' || !packId) return { screen: 'home' }

  switch (page) {
    case 'players':
      return new URLSearchParams(query).get('next') === 'quiz'
        ? { screen: 'players', packId, next: 'quiz' }
        : { screen: 'players', packId }
    case 'quiz':
    case 'play':
    case 'scores':
      return { screen: page, packId }
    case 'result':
      return id ? { screen: 'result', packId, roundId: id } : { screen: 'trip', packId }
    default:
      return { screen: 'trip', packId }
  }
}

/** Goes to a route. `replace` swaps the current history entry, so the back button skips it. */
export function navigate(route: Route, { replace = false } = {}): void {
  if (replace) location.replace(href(route))
  else location.hash = href(route)
}

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function useRoute(): Route {
  return parseRoute(useSyncExternalStore(subscribe, () => location.hash))
}
