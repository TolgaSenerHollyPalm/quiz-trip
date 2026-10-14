import { describe, expect, it } from 'vitest'
import { newTrip } from '../game/trip.ts'
import type { TripState } from '../game/types.ts'
import {
  addedText,
  defaultPacks,
  matchesDestination,
  orphanPacks,
  packOfferOnCreate,
  packsOfTrip,
  shortPackTitle,
  wantedByTrips,
} from './packMatch.ts'

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

  it('stops wanting a declined trip’s destination, but keeps the packs it still plays with', () => {
    expect(wantedByTrips(antalya, [trip({ country: 'TR', cityId: 'antalya', packOffer: 'declined' })])).toBe(false)
    expect(wantedByTrips(antalya, [trip({ country: 'TR', cityId: 'antalya', packIds: ['nick'], packOffer: 'declined' })])).toBe(true)
  })
})

// The three packs published today (public/packs/index.json).
const published = [
  { id: 'eg-sharm-el-sheikh', country: 'EG', cityId: 'sharm-el-sheikh' },
  { id: 'nick-land-of-legends', country: 'TR', cityId: 'antalya' },
  { id: 'tr-mardin', country: 'TR', cityId: 'mardin' },
]

describe('defaultPacks', () => {
  it('checks the chosen city’s pack', () => {
    expect(defaultPacks({ country: 'TR', cityId: 'mardin' }, published)).toEqual(['tr-mardin'])
  })

  it('checks a whole country’s pack only when it has exactly one', () => {
    expect(defaultPacks({ country: 'EG' }, published)).toEqual(['eg-sharm-el-sheikh'])
    expect(defaultPacks({ country: 'TR' }, published)).toEqual([])
  })

  it('checks nothing without a country or for a city without its own pack', () => {
    expect(defaultPacks({}, published)).toEqual([])
    expect(defaultPacks({ country: 'TR', cityId: 'istanbul' }, published)).toEqual([])
  })

  it('counts a pack known twice (on the phone and in the list) once', () => {
    expect(defaultPacks({ country: 'EG' }, [...published, published[0]])).toEqual(['eg-sharm-el-sheikh'])
  })
})

describe('shortPackTitle', () => {
  it('drops the country the player already chose', () => {
    expect(shortPackTitle('Türkiye — Mardin', 'Türkiye')).toBe('Mardin')
    expect(shortPackTitle('Land of Legends — Nickelodeon', 'Türkiye')).toBe('Land of Legends — Nickelodeon')
    expect(shortPackTitle('Türkiye — Mardin', undefined)).toBe('Türkiye — Mardin')
  })
})

describe('packOfferOnCreate', () => {
  it('declines when the player unchecked a pack the rule checked', () => {
    expect(packOfferOnCreate({ defaults: ['tr-mardin'], chosen: [], listRead: true, country: 'TR' })).toBe('declined')
  })

  it('waits when the list could not be read and nothing was chosen', () => {
    expect(packOfferOnCreate({ defaults: [], chosen: [], listRead: false, country: 'TR' })).toBe('waiting')
  })

  it('settles otherwise: the pack came along, the list said there is none, or there is no place to look up', () => {
    expect(packOfferOnCreate({ defaults: ['tr-mardin'], chosen: ['tr-mardin'], listRead: true, country: 'TR' })).toBeUndefined()
    expect(packOfferOnCreate({ defaults: ['eg-sharm-el-sheikh'], chosen: ['eg-sharm-el-sheikh'], listRead: false, country: 'EG' })).toBeUndefined()
    expect(packOfferOnCreate({ defaults: [], chosen: [], listRead: true, country: 'TR' })).toBeUndefined()
    expect(packOfferOnCreate({ defaults: [], chosen: [], listRead: false })).toBeUndefined()
  })
})

describe('addedText', () => {
  const questions = (n: number) => Array.from({ length: n }, () => ({}))

  it('names one pack by its short title and counts the questions', () => {
    expect(addedText([{ title: 'Türkiye — Mardin', questions: questions(49) }], 'Türkiye')).toBe('Mardin paketi eklendi: 49 soru')
  })

  it('counts several packs', () => {
    const packs = [
      { title: 'Türkiye — Mardin', questions: questions(49) },
      { title: 'Land of Legends — Nickelodeon', questions: questions(70) },
    ]
    expect(addedText(packs, 'Türkiye')).toBe('2 paket eklendi: 119 soru')
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
