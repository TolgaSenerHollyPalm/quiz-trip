import { trackDataSince } from 'kitshelf-ui/backup/state.ts'
import { useToast } from 'kitshelf-ui/ui/toastContext.ts'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { KIT, stampTrip } from '../backup/tripkitBackup.ts'
import type { TripState } from '../game/types.ts'
import { bundledPacks } from '../packs/bundled.ts'
import { afterDownload, offerWaitingPacks, takeBack as withoutPacks } from '../packs/offer.ts'
import {
  countUpdatablePacks,
  fetchPackList,
  mergePacks,
  syncPacks,
  type Fetcher,
  type PackOutcome,
  type SyncResult,
} from '../packs/sync.ts'
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
import { findCountry, type Country } from '../trips/destinations.ts'
import { withTrip } from '../trips/list.ts'
import { addedText, wantedByTrips } from '../trips/packMatch.ts'
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
let offering = false // one automatic pack download at a time (plan 10)
let offerAgain = false // a trip began waiting while one ran
let currentTrips: TripState[] = []
// What the automatic download reads after the render it started in.
let currentPacks: Pack[] = []
let currentDestinations: Country[] = []
let offerWaiting = () => undefined as void

// The backup reminder's clock starts with the first trip and stops when the last one is deleted.
const noteTrips = () => trackDataSince(KIT, currentTrips.length > 0, new Date())

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
  const [arriving, setArriving] = useState<readonly string[]>([])
  const show = useToast()
  useEffect(() => {
    currentPacks = loaded?.packs ?? []
    currentDestinations = destinations
  }, [loaded, destinations])

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
    // Nothing is installed on start: a pack reaches the device only when a trip asks for it.
    loadAll()
      .then(({ packs, trips }) => {
        if (!active) return
        currentTrips = trips
        noteTrips()
        setLoaded({ packs: mergePacks([], packs), trips })
        checkPacks()
        offerWaiting()
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
    const check = () => {
      checkPacks()
      offerWaiting()
    }
    // A Wi-Fi that hangs never fires `online`; coming back to the app is the next chance.
    const back = () => {
      if (document.visibilityState === 'visible') offerWaiting()
    }
    window.addEventListener('online', check)
    document.addEventListener('visibilitychange', back)
    return () => {
      window.removeEventListener('online', check)
      document.removeEventListener('visibilitychange', back)
    }
  }, [checkPacks])

  const report = useCallback((error: unknown) => {
    console.error(error)
    setSaveFailed(true)
  }, [])

  const saveTrip = useCallback(
    (changed: TripState) => {
      const trip = stampTrip(changed, new Date())
      currentTrips = withTrip(currentTrips, trip)
      noteTrips()
      setLoaded((current) => current && { ...current, trips: withTrip(current.trips, trip) })
      storeTrip(trip).catch(report)
      if (trip.packOffer === 'waiting') queueMicrotask(() => offerWaiting())
    },
    [report],
  )

  const deleteTrip = useCallback(
    (tripId: string) => {
      currentTrips = currentTrips.filter((trip) => trip.id !== tripId)
      noteTrips()
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

  /**
   * Installs exactly these packs: the ones that ship inside the app come straight from there (no network,
   * works offline), the rest are downloaded.
   */
  const downloadPacks = useCallback(async (packIds: string[]): Promise<SyncResult> => {
    const fromApp = bundledPacks().filter((pack) => packIds.includes(pack.id))
    if (fromApp.length > 0) {
      await installPacks(fromApp).catch(report)
      setLoaded((current) => current && { ...current, packs: mergePacks(current.packs, fromApp) })
    }
    const installed: PackOutcome[] = fromApp.map((pack) => ({
      id: pack.id,
      title: pack.title,
      status: 'added',
      version: pack.version,
    }))

    const missing = packIds.filter((id) => !fromApp.some((pack) => pack.id === id))
    if (missing.length === 0) return { ok: true, outcomes: installed, saved: fromApp }

    const result = await syncPacks({ ...server(currentTrips), wanted: (pin) => missing.includes(pin.id) }).catch(
      (error: unknown): SyncResult => {
        console.error(error)
        return { ok: false, reason: 'Beklenmeyen bir hata oldu. Tekrar dene.' }
      },
    )
    if (!result.ok) return fromApp.length > 0 ? { ok: true, outcomes: installed, saved: fromApp } : result
    if (result.saved.length > 0) {
      setLoaded((current) => current && { ...current, packs: mergePacks(current.packs, result.saved) })
    }
    return { ok: true, outcomes: [...installed, ...result.outcomes], saved: [...fromApp, ...result.saved] }
  }, [report])

  const marking = useCallback((tripId: string, on: boolean) => {
    setArriving((ids) => (on ? [...ids, tripId] : ids.filter((id) => id !== tripId)))
  }, [])

  // Nobody waits for this: the trip opens at once and its games appear when the packs are in.
  const addPacks = useCallback(
    async (tripId: string, packIds: string[]): Promise<string | undefined> => {
      const missing = packIds.filter((id) => !currentPacks.some((pack) => pack.id === id))
      if (missing.length > 0) marking(tripId, true)
      const result = missing.length > 0 ? await downloadPacks(missing).finally(() => marking(tripId, false)) : undefined
      const onPhone = [...(result?.ok ? result.saved : []), ...currentPacks]
      const latest = currentTrips.find((trip) => trip.id === tripId)
      const next = latest && afterDownload(latest, packIds, onPhone)
      if (next) saveTrip(next)
      if (packIds.every((id) => onPhone.some((pack) => pack.id === id))) return undefined
      if (result && !result.ok) return result.reason
      const trouble = result?.outcomes.find((outcome) => outcome.status === 'failed')
      return trouble && 'reason' in trouble ? trouble.reason : 'Paket indirilemedi. Tekrar dene.'
    },
    [downloadPacks, saveTrip, marking],
  )

  /** "Geri al" undoes an automatic add the way the Soru paketleri screen removes a pack. */
  const takeBack = useCallback(
    (tripId: string, packIds: readonly string[]) => {
      const trip = currentTrips.find((candidate) => candidate.id === tripId)
      if (!trip) return
      const { trip: next, unused } = withoutPacks(trip, packIds, currentTrips)
      saveTrip(next)
      unused.forEach(deletePack)
    },
    [saveTrip, deletePack],
  )

  const offerPacks = useCallback(async () => {
    if (!navigator.onLine) return
    if (offering) {
      offerAgain = true
      return
    }
    offering = true
    try {
      await offerWaitingPacks({
        trips: () => currentTrips,
        packs: () => currentPacks,
        bundled: bundledPacks(),
        list: (wanted) => fetchPackList({ ...server(currentTrips), wanted }),
        download: downloadPacks,
        arriving: marking,
        save: saveTrip,
        added: (trip, packs) => {
          const countryName = findCountry(currentDestinations, trip.country)?.name
          const ids = packs.map((pack) => pack.id)
          show(addedText(packs, countryName), { duration: 8000, action: { label: 'Geri al', onClick: () => takeBack(trip.id, ids) } })
        },
      })
    } finally {
      offering = false
      if (offerAgain) {
        offerAgain = false
        offerWaiting()
      }
    }
  }, [saveTrip, downloadPacks, marking, takeBack, show])

  useEffect(() => {
    offerWaiting = () => void offerPacks()
  }, [offerPacks])

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

  // A restore writes straight to IndexedDB; memory follows by reading it back.
  const reload = useCallback(async () => {
    const { packs, trips } = await loadAll()
    currentTrips = trips
    noteTrips()
    setLoaded((current) => current && { ...current, packs: mergePacks([], packs), trips })
    checkPacks()
  }, [checkPacks])

  const value = useMemo(
    () =>
      loaded && {
        ...loaded,
        destinations,
        saveTrip,
        deleteTrip,
        deletePack,
        sync,
        startSync,
        downloadPacks,
        addPacks,
        arriving,
        checkPacks,
        reload,
      },
    [loaded, destinations, saveTrip, deleteTrip, deletePack, sync, startSync, downloadPacks, addPacks, arriving, checkPacks, reload],
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
