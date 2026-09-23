import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { TripState } from '../game/types.ts'
import { bundledPacks } from '../packs/bundled.ts'
import { countUpdatablePacks, mergePacks, syncPacks, type Fetcher, type SyncResult } from '../packs/sync.ts'
import type { Pack } from '../packs/types.ts'
import {
  deleteTrip as removeTrip,
  installPacks,
  loadAll,
  packStore,
  removePack,
  requestPersistentStorage,
  saveTrip as storeTrip,
} from '../storage/db.ts'
import { withTrip } from '../trips/list.ts'
import { AppDataContext, type PackSync } from './appData.ts'
import styles from './AppDataProvider.module.css'

interface Loaded {
  packs: Pack[]
  trips: TripState[]
}

// The provider is mounted once, so module-level flags are enough to keep a second run from starting.
let syncing = false
let checking = false

const browserFetch: Fetcher = (url, init) => fetch(url, init)
const server = () => ({ fetch: browserFetch, store: packStore, baseUrl: import.meta.env.BASE_URL })

/** Loads packs and trips from IndexedDB once, then keeps them in memory and writes every change back. */
export default function AppDataProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState<Loaded>()
  const [loadFailed, setLoadFailed] = useState(false)
  const [saveFailed, setSaveFailed] = useState(false)
  const [sync, setSync] = useState<PackSync>({ running: false, checking: false })

  /** Asks the server what it has, so the home screen only offers an update when there is one. */
  const checkPacks = useCallback(() => {
    if (checking || syncing || !navigator.onLine) return
    checking = true
    setSync((current) => ({ ...current, checking: true }))
    countUpdatablePacks(server())
      .catch((error: unknown): undefined => {
        console.error(error)
        return undefined
      })
      .then((pending) => {
        checking = false
        setSync((current) => ({ ...current, checking: false, pending }))
      })
  }, [])

  useEffect(() => {
    let active = true
    requestPersistentStorage()
    installPacks(bundledPacks())
      .then(loadAll)
      .then(({ packs, trips }) => {
        if (!active) return
        setLoaded({ packs: mergePacks([], packs), trips })
        checkPacks()
      })
      .catch((error: unknown) => {
        console.error(error)
        if (active) setLoadFailed(true)
      })
    return () => {
      active = false
    }
  }, [checkPacks])

  // Back on a network: look again, so the button can appear without restarting the app.
  useEffect(() => {
    const check = () => checkPacks()
    window.addEventListener('online', check)
    return () => window.removeEventListener('online', check)
  }, [checkPacks])

  const report = useCallback((error: unknown) => {
    console.error(error)
    setSaveFailed(true)
  }, [])

  const saveTrip = useCallback(
    (trip: TripState) => {
      setLoaded((current) => current && { ...current, trips: withTrip(current.trips, trip) })
      storeTrip(trip).catch(report)
    },
    [report],
  )

  const deleteTrip = useCallback(
    (tripId: string) => {
      setLoaded((current) => current && { ...current, trips: current.trips.filter((trip) => trip.id !== tripId) })
      removeTrip(tripId).catch(report)
    },
    [report],
  )

  const deletePack = useCallback(
    (packId: string) => {
      setLoaded((current) => current && { ...current, packs: current.packs.filter((pack) => pack.id !== packId) })
      removePack(packId).catch(report)
    },
    [report],
  )

  // Lives here rather than on the home screen, so a sync carries on (and cannot start twice) while players move around.
  const startSync = useCallback(() => {
    if (syncing) return
    syncing = true
    setSync((current) => ({ ...current, running: true }))
    syncPacks(server())
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
        setSync((current) => ({ ...current, running: false, result }))
        checkPacks() // whatever failed stays pending
      })
  }, [checkPacks])

  const value = useMemo(
    () => loaded && { ...loaded, saveTrip, deleteTrip, deletePack, sync, startSync, checkPacks },
    [loaded, saveTrip, deleteTrip, deletePack, sync, startSync, checkPacks],
  )

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
