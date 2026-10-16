import type { TripState } from '../game/types.ts'
import { findCity, findCountry, type Country, type PlaceSuggestion } from './destinations.ts'
import type { Destination } from './packMatch.ts'
import type { NoteItem } from './types.ts'

export type PlaceList = 'souvenirs' | 'tastes'

/** One place's suggestions and the source its items carry: "EG" for a country, "TR/mardin" for a city. */
export interface PlaceSuggestions {
  source: string
  items: PlaceSuggestion[]
}

/** What the trip's place suggests for this list: the country's list, then the city's; empty lists are left out. */
export function placeSuggestions(countries: readonly Country[], destination: Destination, list: PlaceList): PlaceSuggestions[] {
  const country = findCountry(countries, destination.country)
  if (!country) return []
  const city = findCity(countries, country.code, destination.cityId)
  const lists: PlaceSuggestions[] = [{ source: country.code, items: country[list] ?? [] }]
  if (city) lists.push({ source: `${country.code}/${city.id}`, items: city[list] ?? [] })
  return lists.filter((place) => place.items.length > 0)
}

/** The names of the places the suggestions come from, in their order: "Mısır", "Mardin". */
export function placeNames(countries: readonly Country[], lists: readonly PlaceSuggestions[]): string[] {
  return lists.flatMap(({ source }) => {
    const [code, cityId] = source.split('/')
    const name = cityId === undefined ? findCountry(countries, code)?.name : findCity(countries, code, cityId)?.name
    return name ? [name] : []
  })
}

/**
 * Brings a list in line with the trip's place, as applySuggestions does for the checklist: what the player
 * wrote or ticked stays, untouched suggestions of a place no longer chosen go, and missing ones are added.
 */
export function applyPlaceSuggestions(items: NoteItem[], lists: readonly PlaceSuggestions[]): NoteItem[] {
  const active = new Set(lists.map((place) => place.source))
  const kept = items.filter((item) => item.source === undefined || item.done || active.has(item.source))
  const known = new Set(kept.map((item) => item.id))
  const added = lists.flatMap(({ source, items: suggestions }) =>
    suggestions
      .filter((suggestion) => !known.has(suggestion.id))
      .map((suggestion): NoteItem => ({
        id: suggestion.id,
        text: suggestion.text,
        ...(suggestion.note !== undefined && { note: suggestion.note }),
        source,
        done: false,
      })),
  )
  return [...kept, ...added]
}

type PlaceLists = Pick<TripState, 'souvenirs' | 'tastes'>

/** Both of a trip's place lists brought in line with where it goes now. */
export function applyPlaceLists(trip: Destination & PlaceLists, countries: readonly Country[]): PlaceLists {
  return {
    souvenirs: applyPlaceSuggestions(trip.souvenirs, placeSuggestions(countries, trip, 'souvenirs')),
    tastes: applyPlaceSuggestions(trip.tastes, placeSuggestions(countries, trip, 'tastes')),
  }
}
