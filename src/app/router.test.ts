import { describe, expect, it } from 'vitest'
import { href, parseRoute, type Route } from './router.ts'

const TRIP = 'eg-sharm-el-sheikh'

describe('routes', () => {
  it.each<Route>([
    { screen: 'home' },
    { screen: 'trip-new' },
    { screen: 'trip', tripId: TRIP },
    { screen: 'trip-edit', tripId: TRIP },
    { screen: 'checklist', tripId: TRIP },
    { screen: 'trip-packs', tripId: TRIP },
    { screen: 'players', tripId: TRIP },
    { screen: 'players', tripId: TRIP, next: 'quiz' },
    { screen: 'quiz', tripId: TRIP },
    { screen: 'play', tripId: TRIP },
    { screen: 'result', tripId: TRIP, roundId: 'a1b2' },
    { screen: 'scores', tripId: TRIP },
    { screen: 'settings', tripId: TRIP },
    { screen: 'settings', tripId: TRIP, add: 'hotel-floor' },
    { screen: 'predictions', tripId: TRIP },
    { screen: 'prediction-new', tripId: TRIP },
    { screen: 'prediction', tripId: TRIP, predictionId: 'p1' },
    { screen: 'guess', tripId: TRIP, predictionId: 'p1' },
    { screen: 'guess', tripId: TRIP, predictionId: 'p1', playerId: 'a' },
    { screen: 'prediction-result', tripId: TRIP, predictionId: 'p1' },
  ])('survive a round trip through the URL: %o', (route) => {
    expect(parseRoute(href(route))).toEqual(route)
  })

  it('falls back to the home screen for unknown or broken addresses', () => {
    expect(parseRoute('')).toEqual({ screen: 'home' })
    expect(parseRoute('#/nowhere')).toEqual({ screen: 'home' })
    expect(parseRoute('#/trips/olmayan')).toEqual({ screen: 'home' })
    expect(parseRoute('#/trip/%E0%A4%A')).toEqual({ screen: 'home' })
  })

  it('falls back to the trip screen for an unknown page of a trip', () => {
    expect(parseRoute('#/trip/x/unknown')).toEqual({ screen: 'trip', tripId: 'x' })
  })
})
