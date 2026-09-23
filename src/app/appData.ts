import { createContext, useContext, useMemo } from 'react'
import type { TripState } from '../game/types.ts'
import { collectPacks, NO_PACKS } from '../packs/collection.ts'
import type { SyncResult } from '../packs/sync.ts'
import type { Pack } from '../packs/types.ts'
import type { Country } from '../trips/destinations.ts'
import { packsOfTrip } from '../trips/packMatch.ts'

export interface PackSync {
  running: boolean
  checking: boolean // reading the server's list to see whether anything is new
  pending?: number // packs the server has that the device lacks; undefined while unknown
  result?: SyncResult // of the last sync since the app was opened
}

export interface AppData {
  packs: Pack[]
  trips: TripState[]
  /** Where trips can go: the published list when it could be read, the one built into the app otherwise. */
  destinations: Country[]
  /** Stores a trip, adding it when it is new. */
  saveTrip: (trip: TripState) => void
  deleteTrip: (tripId: string) => void
  /** Removes a pack's questions; trips that used it keep their plan and scores. */
  deletePack: (packId: string) => void
  sync: PackSync
  startSync: () => void
  /** Downloads these packs and nothing else; what the wizard does once a destination is chosen. */
  downloadPacks: (packIds: string[]) => Promise<SyncResult>
  checkPacks: () => void
}

export const AppDataContext = createContext<AppData | null>(null)

export function useAppData(): AppData {
  const data = useContext(AppDataContext)
  if (!data) throw new Error('useAppData must be used inside <AppDataProvider>')
  return data
}

/** A trip and the packs it is played with, merged into one pool of questions and prediction templates. */
export function useTrip(tripId: string) {
  const { packs, trips, saveTrip, deleteTrip } = useAppData()
  const trip = trips.find((candidate) => candidate.id === tripId)
  const packIds = trip?.packIds
  // packIds keeps its identity while the trip is saved during a round, so the pool is built once.
  const collection = useMemo(
    () => (packIds ? collectPacks(packsOfTrip(packs, { packIds })) : NO_PACKS),
    [packs, packIds],
  )
  return { trip, collection, saveTrip, deleteTrip }
}
