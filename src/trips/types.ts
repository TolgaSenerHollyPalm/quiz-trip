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

/** Something to buy, or to taste, before coming home: written by a player or suggested for the place. */
export interface NoteItem {
  id: string
  text: string
  note?: string // e.g. "Eski Pazar'da bakılacak"
  source?: string // the place list it came from: "EG" or "TR/mardin"; absent when a player wrote or edited it
  done: boolean
}
