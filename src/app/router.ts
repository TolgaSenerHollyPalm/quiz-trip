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
  | { screen: 'settings'; packId: string; add?: string } // add: template to add once its settings are saved
  | { screen: 'predictions'; packId: string }
  | { screen: 'prediction-new'; packId: string }
  | { screen: 'prediction'; packId: string; predictionId: string }
  | { screen: 'guess'; packId: string; predictionId: string; playerId?: string } // playerId: change one guess
  | { screen: 'prediction-result'; packId: string; predictionId: string }

const query = (params: Record<string, string | undefined>) => {
  const entries = Object.entries(params).filter((entry): entry is [string, string] => entry[1] !== undefined)
  return entries.length > 0 ? `?${new URLSearchParams(entries)}` : ''
}

export function href(route: Route): string {
  if (route.screen === 'home') return '#/'
  const trip = `#/trip/${encodeURIComponent(route.packId)}`
  switch (route.screen) {
    case 'trip':
      return trip
    case 'players':
      return `${trip}/players${query({ next: route.next })}`
    case 'quiz':
    case 'play':
    case 'scores':
      return `${trip}/${route.screen}`
    case 'result':
      return `${trip}/result/${encodeURIComponent(route.roundId)}`
    case 'settings':
      return `${trip}/settings${query({ add: route.add })}`
    case 'predictions':
      return `${trip}/predictions`
    case 'prediction-new':
      return `${trip}/predictions/new`
  }
  const prediction = `${trip}/predictions/${encodeURIComponent(route.predictionId)}`
  switch (route.screen) {
    case 'prediction':
      return prediction
    case 'guess':
      return `${prediction}/guess${query({ player: route.playerId })}`
    case 'prediction-result':
      return `${prediction}/result`
  }
}

export function parseRoute(hash: string): Route {
  const [path, search = ''] = hash.replace(/^#/, '').split('?')
  const params = new URLSearchParams(search)
  let parts: string[]
  try {
    parts = path.split('/').filter(Boolean).map(decodeURIComponent)
  } catch {
    return { screen: 'home' }
  }
  const [section, packId, page, id, action] = parts
  if (section !== 'trip' || !packId) return { screen: 'home' }

  switch (page) {
    case 'players':
      return params.get('next') === 'quiz' ? { screen: 'players', packId, next: 'quiz' } : { screen: 'players', packId }
    case 'quiz':
    case 'play':
    case 'scores':
      return { screen: page, packId }
    case 'result':
      return id ? { screen: 'result', packId, roundId: id } : { screen: 'trip', packId }
    case 'settings': {
      const add = params.get('add')
      return add ? { screen: 'settings', packId, add } : { screen: 'settings', packId }
    }
    case 'predictions':
      return parsePredictionRoute(packId, id, action, params.get('player'))
    default:
      return { screen: 'trip', packId }
  }
}

function parsePredictionRoute(packId: string, id?: string, action?: string, playerId?: string | null): Route {
  if (!id) return { screen: 'predictions', packId }
  if (id === 'new') return { screen: 'prediction-new', packId }
  switch (action) {
    case undefined:
      return { screen: 'prediction', packId, predictionId: id }
    case 'guess':
      return playerId
        ? { screen: 'guess', packId, predictionId: id, playerId }
        : { screen: 'guess', packId, predictionId: id }
    case 'result':
      return { screen: 'prediction-result', packId, predictionId: id }
    default:
      return { screen: 'predictions', packId }
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
