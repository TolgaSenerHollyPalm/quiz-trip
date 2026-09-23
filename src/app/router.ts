import { useSyncExternalStore } from 'react'

// Routes live in the URL hash, so GitHub Pages only ever serves index.html from the app's folder.
export type Route =
  | { screen: 'home' }
  | { screen: 'packs' }
  | { screen: 'trip-new' }
  | { screen: 'trip'; tripId: string }
  | { screen: 'trip-edit'; tripId: string }
  | { screen: 'players'; tripId: string; next?: 'quiz' }
  | { screen: 'quiz'; tripId: string }
  | { screen: 'play'; tripId: string }
  | { screen: 'result'; tripId: string; roundId: string }
  | { screen: 'scores'; tripId: string }
  | { screen: 'settings'; tripId: string; add?: string } // add: template to add once its settings are saved
  | { screen: 'predictions'; tripId: string }
  | { screen: 'prediction-new'; tripId: string }
  | { screen: 'prediction'; tripId: string; predictionId: string }
  | { screen: 'guess'; tripId: string; predictionId: string; playerId?: string } // playerId: change one guess
  | { screen: 'prediction-result'; tripId: string; predictionId: string }

const query = (params: Record<string, string | undefined>) => {
  const entries = Object.entries(params).filter((entry): entry is [string, string] => entry[1] !== undefined)
  return entries.length > 0 ? `?${new URLSearchParams(entries)}` : ''
}

export function href(route: Route): string {
  if (route.screen === 'home') return '#/'
  if (route.screen === 'packs') return '#/packs'
  if (route.screen === 'trip-new') return '#/trips/new'

  const trip = `#/trip/${encodeURIComponent(route.tripId)}`
  switch (route.screen) {
    case 'trip':
      return trip
    case 'trip-edit':
      return `${trip}/edit`
    case 'quiz':
    case 'play':
    case 'scores':
      return `${trip}/${route.screen}`
    case 'players':
      return `${trip}/players${query({ next: route.next })}`
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
  const [section, tripId, page, id, action] = parts
  if (section === 'packs') return { screen: 'packs' }
  if (section === 'trips') return tripId === 'new' ? { screen: 'trip-new' } : { screen: 'home' }
  if (section !== 'trip' || !tripId) return { screen: 'home' }

  switch (page) {
    case 'players':
      return params.get('next') === 'quiz'
        ? { screen: 'players', tripId, next: 'quiz' }
        : { screen: 'players', tripId }
    case 'edit':
      return { screen: 'trip-edit', tripId }
    case 'quiz':
    case 'play':
    case 'scores':
      return { screen: page, tripId }
    case 'result':
      return id ? { screen: 'result', tripId, roundId: id } : { screen: 'trip', tripId }
    case 'settings': {
      const add = params.get('add')
      return add ? { screen: 'settings', tripId, add } : { screen: 'settings', tripId }
    }
    case 'predictions':
      return parsePredictionRoute(tripId, id, action, params.get('player'))
    default:
      return { screen: 'trip', tripId }
  }
}

function parsePredictionRoute(tripId: string, id?: string, action?: string, playerId?: string | null): Route {
  if (!id) return { screen: 'predictions', tripId }
  if (id === 'new') return { screen: 'prediction-new', tripId }
  switch (action) {
    case undefined:
      return { screen: 'prediction', tripId, predictionId: id }
    case 'guess':
      return playerId
        ? { screen: 'guess', tripId, predictionId: id, playerId }
        : { screen: 'guess', tripId, predictionId: id }
    case 'result':
      return { screen: 'prediction-result', tripId, predictionId: id }
    default:
      return { screen: 'predictions', tripId }
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
