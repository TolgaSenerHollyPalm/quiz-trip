import { createContext, useContext } from 'react'
import { newTrip } from '../game/trip.ts'
import type { TripState } from '../game/types.ts'
import type { Pack } from '../packs/types.ts'

export interface AppData {
  packs: Pack[]
  trips: Record<string, TripState>
  saveTrip: (trip: TripState) => void
}

export const AppDataContext = createContext<AppData | null>(null)

export function useAppData(): AppData {
  const data = useContext(AppDataContext)
  if (!data) throw new Error('useAppData must be used inside <AppDataProvider>')
  return data
}

/** A trip is played with one pack; the trip starts empty until someone sets up players. */
export function useTrip(packId: string) {
  const { packs, trips, saveTrip } = useAppData()
  return {
    pack: packs.find((pack) => pack.id === packId),
    trip: trips[packId] ?? newTrip(packId),
    saveTrip,
  }
}
