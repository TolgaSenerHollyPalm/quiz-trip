import bundled from '../../public/destinations.json'

export interface City {
  id: string // kebab-case, the id packs are pinned to
  name: string
}

export interface Country {
  code: string // ISO 3166-1 alpha-2
  name: string
  cities: City[]
}

/**
 * Where trips can go. The list is published next to the packs so a new city does not need a new app version;
 * the copy built into the app is what a first, offline launch uses.
 */
export const BUNDLED_DESTINATIONS: Country[] = bundled.countries

export function findCountry(countries: readonly Country[], code: string | undefined): Country | undefined {
  return code === undefined ? undefined : countries.find((country) => country.code === code)
}

export function findCity(countries: readonly Country[], code: string | undefined, cityId: string | undefined): City | undefined {
  return cityId === undefined ? undefined : findCountry(countries, code)?.cities.find((city) => city.id === cityId)
}

/** "Mısır — Sharm el-Sheikh", or just the country when no city is chosen. */
export function destinationName(countries: readonly Country[], code: string | undefined, cityId?: string): string {
  const country = findCountry(countries, code)
  if (!country) return ''
  const city = findCity(countries, code, cityId)
  return city ? `${country.name} — ${city.name}` : country.name
}
