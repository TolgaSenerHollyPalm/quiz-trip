import { BUNDLED_DESTINATIONS, type City, type Country } from './destinations.ts'

const CACHE_KEY = 'tripkit-destinations'
const CITY_ID = /^[a-z0-9][a-z0-9-]*$/

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isText = (value: unknown): value is string => typeof value === 'string' && value.trim() !== ''

/** Reads the published file, keeping only what is well formed; anything odd and the list is refused whole. */
export function readDestinations(data: unknown): Country[] | undefined {
  if (!isObject(data) || data.schemaVersion !== 1 || !Array.isArray(data.countries)) return undefined
  const countries: Country[] = []
  for (const raw of data.countries) {
    if (!isObject(raw) || !isText(raw.code) || !/^[A-Z]{2}$/.test(raw.code) || !isText(raw.name)) return undefined
    if (!Array.isArray(raw.cities)) return undefined
    const cities: City[] = []
    for (const city of raw.cities) {
      if (!isObject(city) || !isText(city.id) || !CITY_ID.test(city.id) || !isText(city.name)) return undefined
      cities.push({ id: city.id, name: city.name })
    }
    countries.push({ code: raw.code, name: raw.name, cities })
  }
  return countries.length > 0 ? countries : undefined
}

/** The newest list this device has seen, or the one built into the app. Never throws. */
export function cachedDestinations(): Country[] {
  try {
    const stored = localStorage.getItem(CACHE_KEY)
    const parsed = stored === null ? undefined : readDestinations(JSON.parse(stored))
    return parsed ?? BUNDLED_DESTINATIONS
  } catch {
    return BUNDLED_DESTINATIONS
  }
}

type Fetcher = (url: string) => Promise<Response>

/**
 * Fetches the published list so a new city does not need a new app version. A failure is not worth
 * reporting: the trip wizard simply goes on with the list it already has.
 */
export async function fetchDestinations(fetcher: Fetcher, baseUrl: string): Promise<Country[] | undefined> {
  try {
    const response = await fetcher(`${baseUrl}destinations.json`)
    if (!response.ok) return undefined
    const countries = readDestinations(await response.json())
    if (!countries) return undefined
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ schemaVersion: 1, countries }))
    } catch {
      // A full or blocked storage only costs us the cache.
    }
    return countries
  } catch {
    return undefined
  }
}
