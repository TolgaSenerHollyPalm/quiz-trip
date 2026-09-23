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
  return trips.some((trip) => trip.packIds.includes(pin.id) || matchesDestination(pin, trip))
}

/** The packs on the device that belong to this trip, in the order the trip lists them. */
export function packsOfTrip<T extends { id: string }>(packs: readonly T[], trip: Pick<TripState, 'packIds'>): T[] {
  return trip.packIds.flatMap((packId) => packs.filter((pack) => pack.id === packId))
}
