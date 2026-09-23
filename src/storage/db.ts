import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { TripState } from '../game/types.ts'
import type { PackStore } from '../packs/sync.ts'
import type { Pack } from '../packs/types.ts'
import { migrateToMultiPack, migrateTrip, type LegacyTrip, type SinglePackTrip } from './migrations.ts'

interface QuizTripDB extends DBSchema {
  packs: { key: string; value: Pack }
  trips: { key: string; value: TripState }
}

let connection: Promise<IDBPDatabase<QuizTripDB>> | undefined
let waitingForAnotherTab = false

/** True while an upgrade is stuck behind an older copy of the app open in another tab or window. */
export const blockedByAnotherTab = () => waitingForAnotherTab

function database() {
  connection ??= openDB<QuizTripDB>('quiz-trip', 3, {
    async upgrade(db, oldVersion, _newVersion, tx) {
      // Packs and trips live in separate stores, so updating a pack can never touch a trip.
      if (oldVersion < 1) db.createObjectStore('packs', { keyPath: 'id' })
      if (oldVersion < 2) {
        // Trips used to be keyed by the pack they were played with; a trip is its own record now.
        const legacy = oldVersion < 1 ? [] : ((await tx.objectStore('trips').getAll()) as unknown as LegacyTrip[])
        const packs = oldVersion < 1 ? [] : await tx.objectStore('packs').getAll()
        if (oldVersion >= 1) db.deleteObjectStore('trips')
        const trips = db.createObjectStore('trips', { keyPath: 'id' })
        for (const trip of legacy) {
          const pack = packs.find((candidate) => candidate.id === trip.packId)
          trips.put(migrateToMultiPack(migrateTrip(trip, pack?.title), pack))
        }
      }
      if (oldVersion === 2) {
        // A trip can be played with several packs now, so its ids are qualified with the pack they came from.
        const store = tx.objectStore('trips')
        const packs = await tx.objectStore('packs').getAll()
        const stored = (await store.getAll()) as unknown as SinglePackTrip[]
        for (const trip of stored) {
          store.put(migrateToMultiPack(trip, packs.find((pack) => pack.id === trip.packId)))
        }
      }
    },
    // An upgrade cannot run while an older copy of the app still holds the database open.
    blocked() {
      waitingForAnotherTab = true
    },
    blocking() {
      // Another tab wants to upgrade: let go of the database so it can, and reopen on the next call.
      const open = connection
      connection = undefined
      open?.then((db) => db.close()).catch(() => undefined)
    },
    terminated() {
      connection = undefined
    },
  })
  return connection
}

export async function loadAll(): Promise<{ packs: Pack[]; trips: TripState[] }> {
  const db = await database()
  const [packs, trips] = await Promise.all([db.getAll('packs'), db.getAll('trips')])
  return { packs, trips }
}

/** Packs only: syncing never opens a transaction on the trips store. */
export const packStore: PackStore = {
  async versions() {
    const db = await database()
    return new Map((await db.getAll('packs')).map((pack) => [pack.id, pack.version]))
  },
  // Checked and written in one transaction, so a pack is never replaced by an older version.
  async saveIfNewer(pack) {
    const db = await database()
    const tx = db.transaction('packs', 'readwrite')
    const stored = await tx.store.get(pack.id)
    const newer = !stored || stored.version < pack.version
    if (newer) await tx.store.put(pack)
    await tx.done
    return newer
  },
}

/** Stores the bundled packs the device does not have yet, or only has in an older version. */
export async function installPacks(packs: Pack[]): Promise<void> {
  for (const pack of packs) await packStore.saveIfNewer(pack)
}

/** Removes the pack's questions. Trips that used it keep their plan and their scores. */
export async function removePack(packId: string): Promise<void> {
  const db = await database()
  await db.delete('packs', packId)
}

export async function deleteTrip(tripId: string): Promise<void> {
  const db = await database()
  await db.delete('trips', tripId)
}

export async function saveTrip(trip: TripState): Promise<void> {
  const db = await database()
  await db.put('trips', trip)
}

/** Asks the browser not to clear our data when the device runs low on space. */
export function requestPersistentStorage(): void {
  navigator.storage?.persist?.().catch(() => {
    // Not granted; the data is still stored, just without the guarantee.
  })
}
