import { BUNDLED_DESTINATIONS, type City, type Country, type PlaceSuggestion } from './destinations.ts'

const CACHE_KEY = 'tripkit-destinations-2'
// Written before places had suggestion lists; read now, it would hide the lists the app carries.
const OLD_CACHE_KEY = 'tripkit-destinations'
const CITY_ID = /^[a-z0-9][a-z0-9-]*$/
const SUGGESTION_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isText = (value: unknown): value is string => typeof value === 'string' && value.trim() !== ''

type PlaceLists = Pick<Country, 'souvenirs' | 'tastes'>

/** A place's souvenirs and tastes, both optional; undefined when either is broken. */
function readPlaceLists(place: Record<string, unknown>, seen: Set<string>): PlaceLists | undefined {
  const lists: PlaceLists = {}
  for (const key of ['souvenirs', 'tastes'] as const) {
    const raw = place[key]
    if (raw === undefined) continue
    if (!Array.isArray(raw)) return undefined
    const items: PlaceSuggestion[] = []
    for (const item of raw) {
      if (!isObject(item) || !isText(item.id) || !SUGGESTION_ID.test(item.id) || seen.has(item.id) || !isText(item.text)) {
        return undefined
      }
      if (item.note !== undefined && !isText(item.note)) return undefined
      seen.add(item.id)
      items.push({ id: item.id, text: item.text, ...(item.note !== undefined && { note: item.note }) })
    }
    lists[key] = items
  }
  return lists
}

/** Reads the published file, keeping only what is well formed; anything odd and the list is refused whole. */
export function readDestinations(data: unknown): Country[] | undefined {
  if (!isObject(data) || data.schemaVersion !== 1 || !Array.isArray(data.countries)) return undefined
  const countries: Country[] = []
  const seen = new Set<string>() // suggestion ids, unique across the whole file
  for (const raw of data.countries) {
    if (!isObject(raw) || !isText(raw.code) || !/^[A-Z]{2}$/.test(raw.code) || !isText(raw.name)) return undefined
    if (!Array.isArray(raw.cities)) return undefined
    const lists = readPlaceLists(raw, seen)
    if (!lists) return undefined
    const cities: City[] = []
    for (const city of raw.cities) {
      if (!isObject(city) || !isText(city.id) || !CITY_ID.test(city.id) || !isText(city.name)) return undefined
      const cityLists = readPlaceLists(city, seen)
      if (!cityLists) return undefined
      cities.push({ id: city.id, name: city.name, ...cityLists })
    }
    countries.push({ code: raw.code, name: raw.name, ...lists, cities })
  }
  return countries.length > 0 ? countries : undefined
}

/** The newest list this device has seen, or the one built into the app. Never throws. */
export function cachedDestinations(): Country[] {
  try {
    localStorage.removeItem(OLD_CACHE_KEY)
  } catch {
    // Blocked storage holds no old copy to clear either.
  }
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
