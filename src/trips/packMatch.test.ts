import { describe, expect, it } from 'vitest'
import { newTrip } from '../game/trip.ts'
import type { TripState } from '../game/types.ts'
import { matchesDestination, orphanPacks, packsOfTrip, wantedByTrips } from './packMatch.ts'

const trip = (destination: Partial<TripState>): TripState => ({ ...newTrip('t', 'Gezi'), ...destination })

const antalya = { id: 'nick', country: 'TR', cityId: 'antalya' }
const istanbul = { id: 'ist', country: 'TR', cityId: 'istanbul' }
const sharm = { id: 'eg', country: 'EG', cityId: 'sharm-el-sheikh' }

describe('matchesDestination', () => {
  it('gives a country trip every pack of that country', () => {
    const turkey = { country: 'TR' }
    expect(matchesDestination(antalya, turkey)).toBe(true)
    expect(matchesDestination(istanbul, turkey)).toBe(true)
    expect(matchesDestination(sharm, turkey)).toBe(false)
  })

  it('gives a city trip only that city’s packs', () => {
    const trip = { country: 'TR', cityId: 'antalya' }
    expect(matchesDestination(antalya, trip)).toBe(true)
    expect(matchesDestination(istanbul, trip)).toBe(false)
  })

  it('counts a pack with no city for its whole country', () => {
    const countryWide = { id: 'tr-general', country: 'TR' }
    expect(matchesDestination(countryWide, { country: 'TR', cityId: 'antalya' })).toBe(true)
    expect(matchesDestination(countryWide, { country: 'EG' })).toBe(false)
  })

  it('matches nothing for a trip with no destination', () => {
    expect(matchesDestination(antalya, {})).toBe(false)
  })
})

describe('wantedByTrips', () => {
  it('wants what a trip’s destination offers', () => {
    const trips = [trip({ country: 'TR', cityId: 'antalya' })]
    expect(wantedByTrips(antalya, trips)).toBe(true)
    expect(wantedByTrips(sharm, trips)).toBe(false)
  })

  it('keeps wanting a pack a trip already plays with, wherever it goes', () => {
    const trips = [trip({ country: 'TR', cityId: 'istanbul', packIds: ['eg'] })]
    expect(wantedByTrips(sharm, trips)).toBe(true)
  })

  it('wants nothing while there are no trips', () => {
    expect(wantedByTrips(antalya, [])).toBe(false)
  })
})

describe('packsOfTrip', () => {
  it('returns the trip’s packs, in the trip’s own order', () => {
    const packs = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    expect(packsOfTrip(packs, { packIds: ['c', 'a'] })).toEqual([{ id: 'c' }, { id: 'a' }])
  })

  it('skips a pack that is not on the device', () => {
    expect(packsOfTrip([{ id: 'a' }], { packIds: ['a', 'gone'] })).toEqual([{ id: 'a' }])
  })
})

describe('orphanPacks', () => {
  const withPacks = (id: string, packIds: string[]): TripState => ({ ...newTrip(id, id), packIds })

  it('names the packs only this trip plays with', () => {
    const mine = withPacks('a', ['eg', 'nick'])
    const other = withPacks('b', ['nick'])
    expect(orphanPacks(mine, [mine, other])).toEqual(['eg'])
  })

  it('keeps nothing back when the trip is the only one left', () => {
    const only = withPacks('a', ['eg', 'nick'])
    expect(orphanPacks(only, [only])).toEqual(['eg', 'nick'])
  })

  it('has nothing to clean up for a trip without packs', () => {
    expect(orphanPacks(withPacks('a', []), [])).toEqual([])
  })
})
