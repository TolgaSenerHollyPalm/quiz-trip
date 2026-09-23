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
