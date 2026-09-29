import type { RestoreCount, RestoreMode } from 'kitshelf-ui/backup/format.ts'
import { mergeById } from 'kitshelf-ui/backup/merge.ts'
import type { TripState } from '../game/types.ts'
import type { Pack } from '../packs/types.ts'

/** What a TripKit backup carries. */
export interface TripkitData {
  trips: TripState[]
  packs: Pack[]
}

export interface RestorePlan {
  clear: boolean // replace: both stores are emptied first
  trips: TripState[] // to write
  packs: Pack[]
  counts: RestoreCount[]
}

const count = (key: string, label: string, added: number, updated: number, total: number): RestoreCount => ({
  key,
  label,
  added,
  updated,
  total,
})

/** What a restore writes, worked out in one go so the transaction never waits between its reads and writes. */
export function planRestore(local: TripkitData, incoming: TripkitData, mode: RestoreMode): RestorePlan {
  if (mode === 'replace') {
    return {
      clear: true,
      trips: incoming.trips,
      packs: incoming.packs,
      counts: [
        count('trips', 'seyahat', incoming.trips.length, 0, incoming.trips.length),
        count('packs', 'soru paketi', incoming.packs.length, 0, incoming.packs.length),
      ],
    }
  }
  const trips = mergeById(local.trips, incoming.trips)
  // A pack only ever gives way to a higher version, as when it is synced.
  const packs = mergeById(local.packs, incoming.packs, { newer: (candidate, current) => candidate.version > current.version })
  const changed = <T,>(items: T[], before: readonly T[]) => {
    const kept = new Set(before)
    return items.filter((item) => !kept.has(item))
  }
  return {
    clear: false,
    trips: changed(trips.items, local.trips),
    packs: changed(packs.items, local.packs),
    counts: [
      count('trips', 'seyahat', trips.added, trips.updated, trips.items.length),
      count('packs', 'soru paketi', packs.added, packs.updated, packs.items.length),
    ],
  }
}
