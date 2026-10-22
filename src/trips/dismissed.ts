import type { TripState } from '../game/types.ts'

/** The lists suggestions are put on. */
export type SuggestedList = 'checklist' | 'souvenirs' | 'tastes'

// The ids the app makes for a player's own items; any other id began as a suggestion.
const OWN_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Deletes an item; a deleted suggestion is remembered, so refreshing the suggestions does not bring it back. */
export function deleteItem(trip: TripState, list: SuggestedList, id: string): TripState {
  const items: readonly { id: string; source?: string }[] = trip[list]
  const item = items.find((candidate) => candidate.id === id)
  if (!item) return trip
  const remaining = { ...trip, [list]: items.filter((candidate) => candidate.id !== id) } as TripState
  if (item.source === undefined && OWN_ID.test(item.id)) return remaining
  const dismissed = trip.dismissed?.[list] ?? []
  return { ...remaining, dismissed: { ...trip.dismissed, [list]: dismissed.includes(id) ? dismissed : [...dismissed, id] } }
}

/** Asking for the suggested list on an empty list brings every suggestion back, the deleted ones too. */
export function forgetDismissed(trip: TripState, list: SuggestedList): TripState {
  if (!trip.dismissed?.[list]) return trip
  const { [list]: _forgotten, ...rest } = trip.dismissed
  const { dismissed: _all, ...withoutAny } = trip
  return Object.keys(rest).length === 0 ? withoutAny : { ...trip, dismissed: rest }
}
