import { describe, expect, it } from 'vitest'
import { href, parseRoute, type Route } from './router.ts'

describe('routes', () => {
  it.each<Route>([
    { screen: 'home' },
    { screen: 'trip', packId: 'eg-sharm-el-sheikh' },
    { screen: 'players', packId: 'eg-sharm-el-sheikh' },
    { screen: 'players', packId: 'eg-sharm-el-sheikh', next: 'quiz' },
    { screen: 'quiz', packId: 'eg-sharm-el-sheikh' },
    { screen: 'play', packId: 'eg-sharm-el-sheikh' },
    { screen: 'result', packId: 'eg-sharm-el-sheikh', roundId: 'a1b2' },
    { screen: 'scores', packId: 'eg-sharm-el-sheikh' },
  ])('survive a round trip through the URL: %o', (route) => {
    expect(parseRoute(href(route))).toEqual(route)
  })

  it('falls back to the home screen for unknown or broken addresses', () => {
    expect(parseRoute('')).toEqual({ screen: 'home' })
    expect(parseRoute('#/nowhere')).toEqual({ screen: 'home' })
    expect(parseRoute('#/trip/%E0%A4%A')).toEqual({ screen: 'home' })
  })

  it('falls back to the trip screen for an unknown page of a trip', () => {
    expect(parseRoute('#/trip/x/unknown')).toEqual({ screen: 'trip', packId: 'x' })
  })
})
