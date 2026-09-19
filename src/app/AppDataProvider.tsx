import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { TripState } from '../game/types.ts'
import { bundledPacks } from '../packs/bundled.ts'
import { mergePacks, syncPacks, type SyncResult } from '../packs/sync.ts'
import type { Pack } from '../packs/types.ts'
import { installPacks, loadAll, packStore, requestPersistentStorage, saveTrip as storeTrip } from '../storage/db.ts'
import { AppDataContext, type PackSync } from './appData.ts'
import styles from './AppDataProvider.module.css'

interface Loaded {
  packs: Pack[]
  trips: Record<string, TripState>
}

// The provider is mounted once, so a module-level flag is enough to keep a second sync from starting.
let syncing = false

/** Loads packs and trips from IndexedDB once, then keeps them in memory and writes every change back. */
export default function AppDataProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState<Loaded>()
  const [loadFailed, setLoadFailed] = useState(false)
  const [saveFailed, setSaveFailed] = useState(false)
  const [sync, setSync] = useState<PackSync>({ running: false })

  useEffect(() => {
    let active = true
    requestPersistentStorage()
    installPacks(bundledPacks())
      .then(loadAll)
      .then(({ packs, trips }) => {
        if (!active) return
        setLoaded({
          packs: mergePacks([], packs),
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

  // Lives here rather than on the home screen, so a sync carries on (and cannot start twice) while players move around.
  const startSync = useCallback(() => {
    if (syncing) return
    syncing = true
    setSync((current) => ({ ...current, running: true }))
    syncPacks({ fetch: (url, init) => fetch(url, init), store: packStore, baseUrl: import.meta.env.BASE_URL })
      .catch((error: unknown): SyncResult => {
        console.error(error)
        return { ok: false, reason: 'Beklenmeyen bir hata oldu. Tekrar dene.' }
      })
      .then((result) => {
        syncing = false
        // Only the packs change; trips stay exactly as they are in memory.
        if (result.ok && result.saved.length > 0) {
          setLoaded((current) => current && { ...current, packs: mergePacks(current.packs, result.saved) })
        }
        setSync({ running: false, result })
      })
  }, [])

  const value = useMemo(() => loaded && { ...loaded, saveTrip, sync, startSync }, [loaded, saveTrip, sync, startSync])

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
