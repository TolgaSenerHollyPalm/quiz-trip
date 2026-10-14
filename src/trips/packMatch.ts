import type { TripState } from '../game/types.ts'

/** Where a trip goes; both parts are optional because a trip made before the wizard may have neither. */
export interface Destination {
  country?: string
  cityId?: string
}

/** A pack's pin, as it stands in index.json or in the pack itself. */
export interface PackPin {
  id: string
  country?: string
  cityId?: string
}

/**
 * A trip wants the packs of its city; a trip that names only a country wants every pack of that country.
 * A pack without a city counts for its whole country, which also keeps an index written by an older deploy
 * from dropping out of sight.
 */
export function matchesDestination(pin: PackPin, trip: Destination): boolean {
  if (trip.country === undefined || pin.country !== trip.country) return false
  return trip.cityId === undefined || pin.cityId === undefined || pin.cityId === trip.cityId
}

/** The packs worth downloading and keeping up to date: what the trips already play with, plus what fits where they go. */
export function wantedByTrips(pin: PackPin, trips: readonly TripState[]): boolean {
  // A trip whose player turned its packs down only keeps what it still plays with.
  return trips.some((trip) => trip.packIds.includes(pin.id) || (trip.packOffer !== 'declined' && matchesDestination(pin, trip)))
}

/**
 * The packs a trip gets without asking (plan 10): every pack of its city, or a country's only pack. A country
 * with several packs, or no country at all, gets none: the player picks.
 */
export function defaultPacks(destination: Destination, candidates: readonly PackPin[]): string[] {
  if (destination.country === undefined) return []
  const ids = (pins: readonly PackPin[]) => [...new Set(pins.map((pin) => pin.id))]
  if (destination.cityId !== undefined) {
    return ids(candidates.filter((pin) => pin.country === destination.country && pin.cityId === destination.cityId))
  }
  const fitting = ids(candidates.filter((pin) => matchesDestination(pin, destination)))
  return fitting.length === 1 ? fitting : []
}

/** "Türkiye — Mardin" read as "Mardin" once the country is known; any other title stays as it is. */
export function shortPackTitle(title: string, countryName: string | undefined): string {
  return countryName && title.startsWith(`${countryName} — `) ? title.slice(countryName.length + 3) : title
}

/** The packs on the device that belong to this trip, in the order the trip lists them. */
export function packsOfTrip<T extends { id: string }>(packs: readonly T[], trip: Pick<TripState, 'packIds'>): T[] {
  return trip.packIds.flatMap((packId) => packs.filter((pack) => pack.id === packId))
}

/** The trip's packs that no other trip plays with: when the trip goes, these have nothing left to serve. */
export function orphanPacks(trip: Pick<TripState, 'id' | 'packIds'>, trips: readonly TripState[]): string[] {
  return trip.packIds.filter(
    (packId) => !trips.some((other) => other.id !== trip.id && other.packIds.includes(packId)),
  )
}

/**
 * What the new trip remembers about its packs (plan 10): declined when a pack the rule chose was taken off,
 * waiting when no list could be read and nothing was chosen, so the pack can come down by itself later.
 */
export function packOfferOnCreate({ defaults, chosen, listRead, country }: { defaults: readonly string[]; chosen: readonly string[]; listRead: boolean; country?: string }): TripState['packOffer'] {
  if (defaults.some((id) => !chosen.includes(id))) return 'declined'
  if (!listRead && chosen.length === 0 && country !== undefined) return 'waiting'
  return undefined
}

/** "Mardin paketi eklendi: 49 soru", or "2 paket eklendi: 119 soru". */
export function addedText(packs: readonly { title: string; questions: readonly unknown[] }[], countryName: string | undefined): string {
  const questions = packs.reduce((sum, pack) => sum + pack.questions.length, 0)
  return packs.length === 1 ? `${shortPackTitle(packs[0].title, countryName)} paketi eklendi: ${questions} soru` : `${packs.length} paket eklendi: ${questions} soru`
}
