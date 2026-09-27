export const TRANSPORTS = ['plane', 'car', 'bus', 'ferry', 'other'] as const
export type Transport = (typeof TRANSPORTS)[number]

export const TRIP_KINDS = ['beach', 'fun', 'winter', 'city', 'nature', 'business', 'other'] as const
export type TripKind = (typeof TRIP_KINDS)[number]

export interface ChecklistItem {
  id: string
  text: string
  group: 'pack' | 'do' // things to take with you / things to do before leaving
  source?: string // the suggestion list it came from; absent when a player wrote it
  done: boolean
}

/** An item of a list the user writes alone: something to buy, or to taste, before coming home. */
export interface NoteItem {
  id: string
  text: string
  note?: string // e.g. "Eski Pazar'da bakılacak"
  done: boolean
}
