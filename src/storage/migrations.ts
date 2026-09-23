import type { TripState } from '../game/types.ts'

/** A trip as the first version stored it: keyed by its pack, with no plan of its own. */
export interface LegacyTrip extends Omit<TripState, 'id' | 'name' | 'packId' | 'checklist'> {
  packId: string
}

/** Turns a pack-keyed trip into a trip of its own. The pack stays linked and every score is kept. */
export function migrateTrip(legacy: LegacyTrip, packTitle?: string): TripState {
  return {
    ...legacy,
    id: legacy.packId,
    packId: legacy.packId,
    name: packTitle ?? 'Gezi',
    checklist: [],
  }
}
