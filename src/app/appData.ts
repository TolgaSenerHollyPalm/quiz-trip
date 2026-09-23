import { createContext, useContext } from 'react'
import type { TripState } from '../game/types.ts'
import type { SyncResult } from '../packs/sync.ts'
import type { Pack } from '../packs/types.ts'

export interface PackSync {
  running: boolean
  checking: boolean // reading the server's list to see whether anything is new
  pending?: number // packs the server has that the device lacks; undefined while unknown
  result?: SyncResult // of the last sync since the app was opened
}

export interface AppData {
  packs: Pack[]
  trips: TripState[]
  /** Stores a trip, adding it when it is new. */
  saveTrip: (trip: TripState) => void
  deleteTrip: (tripId: string) => void
  /** Removes a pack's questions; trips that used it keep their plan and scores. */
  deletePack: (packId: string) => void
  sync: PackSync
  startSync: () => void
  checkPacks: () => void
}

export const AppDataContext = createContext<AppData | null>(null)

export function useAppData(): AppData {
  const data = useContext(AppDataContext)
  if (!data) throw new Error('useAppData must be used inside <AppDataProvider>')
  return data
}

/** A trip and the pack it is played with, if that pack is on the device. */
export function useTrip(tripId: string) {
  const { packs, trips, saveTrip, deleteTrip } = useAppData()
  const trip = trips.find((candidate) => candidate.id === tripId)
  return {
    trip,
    pack: packs.find((pack) => pack.id === trip?.packId),
    saveTrip,
    deleteTrip,
  }
}
