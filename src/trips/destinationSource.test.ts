import { afterEach, describe, expect, it, vi } from 'vitest'
import published from '../../public/destinations.json'
import { cachedDestinations, readDestinations } from './destinationSource.ts'
import { BUNDLED_DESTINATIONS } from './destinations.ts'

const good = {
  schemaVersion: 1,
  countries: [
    { code: 'TR', name: 'Türkiye', cities: [{ id: 'antalya', name: 'Antalya' }] },
    { code: 'EG', name: 'Mısır', cities: [] },
  ],
}

const withLists = (souvenirs: unknown, tastes: unknown = []) => ({
  schemaVersion: 1,
  countries: [
    { code: 'EG', name: 'Mısır', souvenirs, cities: [] },
    { code: 'TR', name: 'Türkiye', cities: [{ id: 'mardin', name: 'Mardin', tastes }] },
  ],
})

describe('readDestinations', () => {
  it('reads a well formed list, cities and all', () => {
    expect(readDestinations(good)).toEqual(good.countries)
  })

  it('reads the published file with the suggestion lists of its places', () => {
    const countries = readDestinations(published)
    expect(countries).toEqual(published.countries)
    const egypt = countries?.find((country) => country.code === 'EG')
    const mardin = countries?.find((country) => country.code === 'TR')?.cities.find((city) => city.id === 'mardin')
    expect([egypt?.souvenirs?.length, egypt?.tastes?.length]).toEqual([7, 4])
    expect([mardin?.souvenirs?.length, mardin?.tastes?.length]).toEqual([5, 4])
  })

  it('keeps a suggestion without a note as it is', () => {
    const countries = readDestinations(withLists([{ id: 'eg-papyrus', text: 'Papirüs resmi' }]))
    expect(countries?.[0].souvenirs).toEqual([{ id: 'eg-papyrus', text: 'Papirüs resmi' }])
  })

  it.each([
    ['a newer schema', { ...good, schemaVersion: 2 }],
    ['no countries', { schemaVersion: 1, countries: [] }],
    ['a country without a name', { schemaVersion: 1, countries: [{ code: 'TR', cities: [] }] }],
    ['a lower-case country code', { schemaVersion: 1, countries: [{ code: 'tr', name: 'Türkiye', cities: [] }] }],
    ['a city id with spaces', { schemaVersion: 1, countries: [{ code: 'TR', name: 'Türkiye', cities: [{ id: 'iç anadolu', name: 'x' }] }] }],
    ['something that is not an object', 'nope'],
    ['a suggestion with empty text', withLists([{ id: 'eg-papyrus', text: '  ' }])],
    ['a suggestion with an empty note', withLists([{ id: 'eg-papyrus', text: 'Papirüs', note: '' }])],
    ['a suggestion id used twice', withLists([{ id: 'eg-papyrus', text: 'Papirüs' }], [{ id: 'eg-papyrus', text: 'Harire' }])],
    ['an upper-case suggestion id', withLists([{ id: 'EG-papyrus', text: 'Papirüs' }])],
    ['a suggestion list that is not a list', withLists({ id: 'eg-papyrus', text: 'Papirüs' })],
  ])('refuses %s rather than using half of it', (_case, data) => {
    expect(readDestinations(data)).toBeUndefined()
  })
})

describe('cachedDestinations', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('clears the copy cached before places had suggestions and does not read it', () => {
    const stored = new Map([['tripkit-destinations', JSON.stringify(good)]])
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => stored.get(key) ?? null,
      removeItem: (key: string) => stored.delete(key),
    })
    expect(cachedDestinations()).toBe(BUNDLED_DESTINATIONS)
    expect(stored.has('tripkit-destinations')).toBe(false)
  })

  it('falls back to the list in the app when storage is blocked', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    })
    expect(cachedDestinations()).toBe(BUNDLED_DESTINATIONS)
  })
})
