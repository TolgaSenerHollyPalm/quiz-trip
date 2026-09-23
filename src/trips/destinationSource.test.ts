import { describe, expect, it } from 'vitest'
import { readDestinations } from './destinationSource.ts'

const good = {
  schemaVersion: 1,
  countries: [
    { code: 'TR', name: 'Türkiye', cities: [{ id: 'antalya', name: 'Antalya' }] },
    { code: 'EG', name: 'Mısır', cities: [] },
  ],
}

describe('readDestinations', () => {
  it('reads a well formed list, cities and all', () => {
    expect(readDestinations(good)).toEqual(good.countries)
  })

  it.each([
    ['a newer schema', { ...good, schemaVersion: 2 }],
    ['no countries', { schemaVersion: 1, countries: [] }],
    ['a country without a name', { schemaVersion: 1, countries: [{ code: 'TR', cities: [] }] }],
    ['a lower-case country code', { schemaVersion: 1, countries: [{ code: 'tr', name: 'Türkiye', cities: [] }] }],
    ['a city id with spaces', { schemaVersion: 1, countries: [{ code: 'TR', name: 'Türkiye', cities: [{ id: 'iç anadolu', name: 'x' }] }] }],
    ['something that is not an object', 'nope'],
  ])('refuses %s rather than using half of it', (_case, data) => {
    expect(readDestinations(data)).toBeUndefined()
  })
})
