import { describe, expect, it } from 'vitest'
import { BUNDLED_DESTINATIONS, destinationName, findCity, findCountry } from './destinations.ts'

describe('the destination list', () => {
  it('names every country once and every city once within its country', () => {
    const codes = BUNDLED_DESTINATIONS.map((country) => country.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const country of BUNDLED_DESTINATIONS) {
      expect(country.name.trim()).not.toBe('')
      const ids = country.cities.map((city) => city.id)
      expect(new Set(ids).size, country.code).toBe(ids.length)
      for (const id of ids) expect(id, country.code).toMatch(/^[a-z0-9][a-z0-9-]*$/)
    }
  })

  it('has the countries the app was opened with', () => {
    expect(findCountry(BUNDLED_DESTINATIONS, 'TR')?.name).toBe('Türkiye')
    expect(findCity(BUNDLED_DESTINATIONS, 'EG', 'sharm-el-sheikh')?.name).toBe('Sharm el-Sheikh')
  })

  it('looks up nothing for an unknown or missing code', () => {
    expect(findCountry(BUNDLED_DESTINATIONS, undefined)).toBeUndefined()
    expect(findCountry(BUNDLED_DESTINATIONS, 'DE')).toBeUndefined()
    expect(findCity(BUNDLED_DESTINATIONS, 'TR', 'izmir')).toBeUndefined()
  })

  it('writes the destination as country and city, or country alone', () => {
    expect(destinationName(BUNDLED_DESTINATIONS, 'TR', 'antalya')).toBe('Türkiye — Antalya')
    expect(destinationName(BUNDLED_DESTINATIONS, 'TR')).toBe('Türkiye')
    expect(destinationName(BUNDLED_DESTINATIONS, undefined)).toBe('')
  })
})
