import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { TripState } from '../game/types.ts'
import { bundledPacks } from '../packs/bundled.ts'
import { countUpdatablePacks, mergePacks, syncPacks, type Fetcher, type SyncResult } from '../packs/sync.ts'
import type { Pack } from '../packs/types.ts'
import {
  blockedByAnotherTab,
  deleteTrip as removeTrip,
  installPacks,
  loadAll,
  packStore,
  removePack,
  requestPersistentStorage,
  saveTrip as storeTrip,
} from '../storage/db.ts'
import { cachedDestinations, fetchDestinations } from '../trips/destinationSource.ts'
import type { Country } from '../trips/destinations.ts'
import { withTrip } from '../trips/list.ts'
import { wantedByTrips } from '../trips/packMatch.ts'
import { AppDataContext, type PackSync } from './appData.ts'
import styles from './AppDataProvider.module.css'

interface Loaded {
  packs: Pack[]
  trips: TripState[]
}

// The provider is mounted once, so module-level state is enough: flags that keep a second run from
// starting, and the trips as they are right now, which is what decides the packs to sync.
let syncing = false
let checking = false
let currentTrips: TripState[] = []

const browserFetch: Fetcher = (url, init) => fetch(url, init)
const server = (trips: readonly TripState[]) => ({
  fetch: browserFetch,
  store: packStore,
  baseUrl: import.meta.env.BASE_URL,
  wanted: (pin: { id: string; country?: string; cityId?: string }) => wantedByTrips(pin, trips),
})

/** Loads packs and trips from IndexedDB once, then keeps them in memory and writes every change back. */
export default function AppDataProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState<Loaded>()
  const [loadFailed, setLoadFailed] = useState(false)
  const [slowLoad, setSlowLoad] = useState(false)
  const [saveFailed, setSaveFailed] = useState(false)
  const [sync, setSync] = useState<PackSync>({ running: false, checking: false })
  const [destinations, setDestinations] = useState<Country[]>(cachedDestinations)

  /** Asks the server what it has, so the home screen only offers an update when there is one. */
  const checkPacks = useCallback(() => {
    if (checking || syncing || !navigator.onLine) return
    checking = true
    setSync((current) => ({ ...current, checking: true }))
    countUpdatablePacks(server(currentTrips))
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
        currentTrips = trips
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

  // The published list may have grown since this version of the app was built.
  useEffect(() => {
    let active = true
    fetchDestinations((url) => fetch(url, { cache: 'no-store' }), import.meta.env.BASE_URL)
      .then((countries) => {
        if (active && countries) setDestinations(countries)
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])

  // Opening takes a moment; if it takes this long, something is in the way and the player should know.
  useEffect(() => {
    if (loaded) return undefined
    const timer = setTimeout(() => setSlowLoad(true), 5000)
    return () => clearTimeout(timer)
  }, [loaded])

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
      currentTrips = withTrip(currentTrips, trip)
      setLoaded((current) => current && { ...current, trips: withTrip(current.trips, trip) })
      storeTrip(trip).catch(report)
    },
    [report],
  )

  const deleteTrip = useCallback(
    (tripId: string) => {
      currentTrips = currentTrips.filter((trip) => trip.id !== tripId)
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

  /** The wizard's download: these packs only, whatever the trips currently want. */
  const downloadPacks = useCallback(async (packIds: string[]): Promise<SyncResult> => {
    const result = await syncPacks({ ...server(currentTrips), wanted: (pin) => packIds.includes(pin.id) }).catch(
      (error: unknown): SyncResult => {
        console.error(error)
        return { ok: false, reason: 'Beklenmeyen bir hata oldu. Tekrar dene.' }
      },
    )
    if (result.ok && result.saved.length > 0) {
      setLoaded((current) => current && { ...current, packs: mergePacks(current.packs, result.saved) })
    }
    return result
  }, [])

  // Lives here rather than on the home screen, so a sync carries on (and cannot start twice) while players move around.
  const startSync = useCallback(() => {
    if (syncing) return
    syncing = true
    setSync((current) => ({ ...current, running: true }))
    syncPacks(server(currentTrips))
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
    () =>
      loaded && { ...loaded, destinations, saveTrip, deleteTrip, deletePack, sync, startSync, downloadPacks, checkPacks },
    [loaded, destinations, saveTrip, deleteTrip, deletePack, sync, startSync, downloadPacks, checkPacks],
  )

  if (loadFailed) {
    return <p className={styles.message}>Kayıtlı veriler açılamadı. Uygulamayı kapatıp yeniden aç.</p>
  }
  if (!value) {
    if (slowLoad && blockedByAnotherTab()) {
      return (
        <p className={styles.message}>
          Uygulama başka bir sekmede ya da pencerede daha eski bir sürümle açık. Oradaki sekmeyi kapatıp bu
          sayfayı yenile.
        </p>
      )
    }
    return null
  }

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
