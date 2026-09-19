import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { TripState } from '../game/types.ts'
import { bundledPacks } from '../packs/bundled.ts'
import type { Pack } from '../packs/types.ts'
import { installPacks, loadAll, requestPersistentStorage, saveTrip as storeTrip } from '../storage/db.ts'
import { AppDataContext } from './appData.ts'
import styles from './AppDataProvider.module.css'

interface Loaded {
  packs: Pack[]
  trips: Record<string, TripState>
}

/** Loads packs and trips from IndexedDB once, then keeps them in memory and writes every change back. */
export default function AppDataProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState<Loaded>()
  const [loadFailed, setLoadFailed] = useState(false)
  const [saveFailed, setSaveFailed] = useState(false)

  useEffect(() => {
    let active = true
    requestPersistentStorage()
    installPacks(bundledPacks())
      .then(loadAll)
      .then(({ packs, trips }) => {
        if (!active) return
        setLoaded({
          packs: packs.sort((a, b) => a.title.localeCompare(b.title, 'tr')),
          trips: Object.fromEntries(trips.map((trip) => [trip.packId, trip])),
        })
      })
      .catch((error: unknown) => {
        console.error(error)
        if (active) setLoadFailed(true)
      })
    return () => {
      active = false
    }
  }, [])

  const saveTrip = useCallback((trip: TripState) => {
    setLoaded((current) => current && { ...current, trips: { ...current.trips, [trip.packId]: trip } })
    storeTrip(trip).catch((error: unknown) => {
      console.error(error)
      setSaveFailed(true)
    })
  }, [])

  const value = useMemo(() => loaded && { ...loaded, saveTrip }, [loaded, saveTrip])

  if (loadFailed) {
    return <p className={styles.message}>Kayıtlı veriler açılamadı. Uygulamayı kapatıp yeniden aç.</p>
  }
  if (!value) return null

  return (
    <AppDataContext value={value}>
      {saveFailed && (
        <p className={styles.warning} role="alert">
          Son değişiklik kaydedilemedi. Telefonda yer kalmamış olabilir.
        </p>
      )}
      {children}
    </AppDataContext>
  )
}
