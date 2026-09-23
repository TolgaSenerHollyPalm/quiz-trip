import { useState } from 'react'
import { useAppData, useTrip } from '../app/appData.ts'
import { fetchPackList, type SyncResult } from '../packs/sync.ts'
import type { Pack } from '../packs/types.ts'
import { destinationName } from '../trips/destinations.ts'
import { matchesDestination } from '../trips/packMatch.ts'
import { Button } from '../ui/Button.tsx'
import ConfirmDialog from '../ui/ConfirmDialog.tsx'
import Missing from '../ui/Missing.tsx'
import Screen from '../ui/Screen.tsx'
import { tripTheme } from '../ui/tripTheme.ts'
import text from '../ui/text.module.css'
import { useOnline } from '../ui/useOnline.ts'
import styles from './TripPacksScreen.module.css'

/** The question packs of one trip: what it plays with, and what its destination still has to offer. */
export default function TripPacksScreen({ tripId }: { tripId: string }) {
  const { packs, trips, destinations, deletePack, downloadPacks } = useAppData()
  const { trip, collection, saveTrip } = useTrip(tripId)
  const online = useOnline()
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState<SyncResult>()
  const [nothingNew, setNothingNew] = useState(false)
  const [removing, setRemoving] = useState<Pack>()
  if (!trip) return <Missing message="Bu gezi bulunamadı." back={{ screen: 'home' }} />

  const destination = { country: trip.country, cityId: trip.cityId }
  const where = destinationName(destinations, trip.country, trip.cityId)
  const nearby = packs.filter((pack) => matchesDestination(pack, destination) && !trip.packIds.includes(pack.id))
  const usedElsewhere = (packId: string) =>
    trips.some((other) => other.id !== trip.id && other.packIds.includes(packId))

  const link = (packId: string) => saveTrip({ ...trip, packIds: [...trip.packIds, packId] })

  /** Asks the server what this destination has, downloads what is missing and links it to the trip. */
  const search = async () => {
    setSearching(true)
    setResult(undefined)
    setNothingNew(false)
    const listing = await fetchPackList({
      fetch: (url, init) => fetch(url, init),
      store: { versions: () => Promise.resolve(new Map()), saveIfNewer: () => Promise.resolve(false) },
      baseUrl: import.meta.env.BASE_URL,
      wanted: (pin) => matchesDestination(pin, destination),
    })
    if (!listing.ok) {
      setResult({ ok: false, reason: listing.reason })
      setSearching(false)
      return
    }
    const ids = listing.entries.map((entry) => entry.id)
    const downloaded = ids.length > 0 ? await downloadPacks(ids) : undefined
    const installed = new Set([...packs.map((pack) => pack.id), ...(downloaded?.ok ? downloaded.saved.map((p) => p.id) : [])])
    const missing = ids.filter((id) => installed.has(id) && !trip.packIds.includes(id))
    if (missing.length > 0) saveTrip({ ...trip, packIds: [...trip.packIds, ...missing] })
    setResult(downloaded)
    setNothingNew(missing.length === 0 && (downloaded === undefined || (downloaded.ok && downloaded.outcomes.length === 0)))
    setSearching(false)
  }

  return (
    <Screen title="Soru paketleri" back={{ screen: 'trip', tripId }} wide theme={tripTheme(trip.kind)}>
      <p className={text.meta}>{where === '' ? 'Bu gezinin ülkesi seçilmemiş.' : `${where} paketleri`}</p>

      {collection.packs.length === 0 ? (
        <p className={text.hint}>
          Bu geziye paket bağlı değil. Paketler bilgi yarışmasını ve tahmin sorularını getirir.
        </p>
      ) : (
        <ul className={styles.list}>
          {collection.packs.map((pack) => (
            <li key={pack.id} className={styles.pack}>
              <div>
                <p className={styles.title}>{pack.title}</p>
                <p className={text.hint}>
                  {pack.questions.length} soru · {pack.predictionTemplates.length} tahmin sorusu · sürüm{' '}
                  {pack.version}
                </p>
              </div>
              <div className={styles.action}>
                <Button onClick={() => setRemoving(pack)}>Çıkar</Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {trip.packIds.some((packId) => !packs.some((pack) => pack.id === packId)) && (
        <p className={text.notice}>
          Bu gezinin bağlı paketlerinden biri cihazda yok. İnternet varken aşağıdan yeniden indirebilirsin.
        </p>
      )}

      {nearby.length > 0 && (
        <>
          <h2 className={text.heading}>Cihazdaki diğer paketler</h2>
          <ul className={styles.list}>
            {nearby.map((pack) => (
              <li key={pack.id} className={styles.pack}>
                <div>
                  <p className={styles.title}>{pack.title}</p>
                  <p className={text.hint}>{pack.questions.length} soru</p>
                </div>
                <div className={styles.action}>
                  <Button onClick={() => link(pack.id)}>Ekle</Button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {trip.country === undefined ? (
        <p className={text.hint}>Geziyi düzenleyip ülkesini seçersen o destinasyonun paketlerini indirebilirim.</p>
      ) : !online ? (
        <p className={text.hint}>İnternet yokken paket indirilemez. Bağlanınca bu ekrandan tekrar dene.</p>
      ) : (
        <Button variant="primary" disabled={searching} onClick={() => void search()}>
          {searching ? 'Aranıyor…' : 'Paketleri getir ve güncelle'}
        </Button>
      )}

      {nothingNew && !searching && (
        <p className={styles.report} role="status">
          Bu gezinin paketleri güncel.
        </p>
      )}
      {result && !result.ok && (
        <p className={`${styles.report} ${styles.failed}`} role="status">
          {result.reason}
        </p>
      )}
      {result?.ok && result.outcomes.length > 0 && (
        <ul className={styles.report} role="status">
          {result.outcomes.map((outcome, index) => (
            <li key={`${outcome.id}-${index}`} className={outcome.status === 'failed' ? styles.failed : undefined}>
              {outcome.status === 'added' && `Yeni paket: ${outcome.title}`}
              {outcome.status === 'updated' && `Güncellendi: ${outcome.title} (sürüm ${outcome.version})`}
              {outcome.status === 'failed' &&
                `${outcome.title} indirilemedi. ${outcome.reason} Varsa eski hâli kullanılmaya devam ediyor.`}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={removing !== undefined}
        title="Paket çıkarılsın mı?"
        confirmLabel="Çıkar"
        onConfirm={() => {
          if (removing) {
            saveTrip({ ...trip, packIds: trip.packIds.filter((packId) => packId !== removing.id) })
            if (!usedElsewhere(removing.id)) deletePack(removing.id)
          }
          setRemoving(undefined)
        }}
        onCancel={() => setRemoving(undefined)}
      >
        <strong>{removing?.title}</strong> bu geziden çıkarılacak
        {removing && !usedElsewhere(removing.id) ? ' ve başka gezide kullanılmadığı için telefondan silinecek' : ''}.
        Gezinin oyuncuları, puanları ve tahminleri durur; internet varken paketi yeniden indirebilirsin.
      </ConfirmDialog>
    </Screen>
  )
}
