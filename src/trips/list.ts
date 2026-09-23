import type { TripState } from '../game/types.ts'

/** Replaces a trip in the list, or adds it when it is new. */
export function withTrip(trips: readonly TripState[], trip: TripState): TripState[] {
  const known = trips.some((candidate) => candidate.id === trip.id)
  return known ? trips.map((candidate) => (candidate.id === trip.id ? trip : candidate)) : [...trips, trip]
}

/**
 * The order of the home screen: the trip happening or coming up next is first, then the rest by date,
 * then trips with no date, and finished trips at the end, most recent first.
 */
export function sortTrips(trips: readonly TripState[], today: string): TripState[] {
  const finished = (trip: TripState) => {
    const last = trip.endDate ?? trip.startDate
    return last !== undefined && last < today
  }
  return [...trips].sort((a, b) => {
    if (finished(a) !== finished(b)) return finished(a) ? 1 : -1
    if (finished(a)) return (b.endDate ?? b.startDate ?? '').localeCompare(a.endDate ?? a.startDate ?? '')
    if (!a.startDate || !b.startDate) return a.startDate ? -1 : b.startDate ? 1 : a.name.localeCompare(b.name, 'tr')
    return a.startDate.localeCompare(b.startDate) || a.name.localeCompare(b.name, 'tr')
  })
}
