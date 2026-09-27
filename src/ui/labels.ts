import type { DifficultyChoice } from '../game/types.ts'
import type { Transport, TripKind } from '../trips/types.ts'

export const DIFFICULTY_LABELS: Record<DifficultyChoice, string> = {
  mixed: 'Karışık',
  easy: 'Kolay',
  medium: 'Orta',
  hard: 'Zor',
}

export const OPTION_LETTERS = ['A', 'B', 'C', 'D']

export const TRANSPORT_LABELS: Record<Transport, string> = {
  plane: 'Uçak',
  car: 'Araba',
  bus: 'Otobüs',
  ferry: 'Vapur',
  other: 'Diğer',
}

export const TRIP_KIND_LABELS: Record<TripKind, string> = {
  beach: 'Deniz',
  fun: 'Eğlence',
  winter: 'Kış',
  city: 'Şehir',
  nature: 'Doğa',
  business: 'İş',
  other: 'Diğer',
}

const JOURNEY: Partial<Record<Transport, string>> = { plane: 'Uçak', car: 'Araba', bus: 'Otobüs', ferry: 'Vapur' }

// The holiday type as the object of "göre": deniz tatiline, şehir gezisine…
const HOLIDAY_DATIVE: Partial<Record<TripKind, string>> = {
  beach: 'deniz tatiline',
  fun: 'eğlence tatiline',
  winter: 'kış tatiline',
  city: 'şehir gezisine',
  nature: 'doğa tatiline',
  business: 'iş seyahatine',
}

/** The line under the packing list's title: what the suggestions were made for. "Diğer" counts as no choice. */
export function checklistBasis(transport?: Transport, kind?: TripKind): string {
  const vehicle = transport && JOURNEY[transport]
  const holiday = kind && HOLIDAY_DATIVE[kind]
  if (vehicle && holiday) return `${vehicle} ve ${holiday} göre önerildi`
  if (vehicle) return `${vehicle} yolculuğuna göre önerildi`
  if (holiday) return `${holiday.charAt(0).toLocaleUpperCase('tr')}${holiday.slice(1)} göre önerildi`
  return 'Kendi listen'
}

/** Where a suggested item came from, shown under it; the player's own items have none. */
export function sourceLabel(source?: string): string | undefined {
  if (!source) return undefined
  if (source === 'common') return 'Genel'
  return TRANSPORT_LABELS[source as Transport] ?? TRIP_KIND_LABELS[source as TripKind]
}
