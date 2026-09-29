import { useState } from 'react'
import { href } from '../app/router.ts'
import { useAppData, useTrip } from '../app/appData.ts'
import { bundledPacks } from '../packs/bundled.ts'
import { fetchPackList, type SyncResult } from '../packs/sync.ts'
import type { Pack } from '../packs/types.ts'
import { destinationName } from '../trips/destinations.ts'
import { matchesDestination } from '../trips/packMatch.ts'
import { Button } from 'kitshelf-ui/ui/Button.tsx'
import ConfirmDialog from 'kitshelf-ui/ui/ConfirmDialog.tsx'
import Missing from 'kitshelf-ui/ui/Missing.tsx'
import Screen from 'kitshelf-ui/ui/Screen.tsx'
import { tripTheme } from '../ui/tripTheme.ts'
import text from 'kitshelf-ui/ui/text.module.css'
import { useOnline } from 'kitshelf-ui/ui/useOnline.ts'
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
  if (!trip) return <Missing message="Bu seyahat bulunamadı." back={href({ screen: 'home' })} />

  const destination = { country: trip.country, cityId: trip.cityId }
  const where = destinationName(destinations, trip.country, trip.cityId)
  const onDevice = packs.filter((pack) => matchesDestination(pack, destination) && !trip.packIds.includes(pack.id))
  // Packs that ship inside the app can be added without a network at all.
  const inApp = bundledPacks().filter(
    (pack) =>
      matchesDestination(pack, destination) &&
      !trip.packIds.includes(pack.id) &&
      !onDevice.some((other) => other.id === pack.id),
  )
  const nearby = [...onDevice, ...inApp]
  const usedElsewhere = (packId: string) =>
    trips.some((other) => other.id !== trip.id && other.packIds.includes(packId))

  const link = async (packId: string) => {
    // A pack that is only inside the app has to be installed before the trip can play with it.
    if (!packs.some((pack) => pack.id === packId)) await downloadPacks([packId])
    saveTrip({ ...trip, packIds: [...trip.packIds, packId] })
  }

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
    <Screen
      title="Soru paketleri"
      back={href({ screen: 'trip', tripId })}
      theme={tripTheme(trip.kind)}
      footer={
        trip.country !== undefined &&
        online && (
          <Button variant="primary" big disabled={searching} onClick={() => void search()}>
            {searching ? 'Aranıyor…' : 'Paketleri getir ve güncelle'}
          </Button>
        )
      }
    >
      <p className={text.meta}>{where === '' ? 'Bu seyahatin ülkesi seçilmemiş.' : `${where} paketleri`}</p>

      {collection.packs.length === 0 ? (
        <p className={text.hint}>
          Bu seyahate paket bağlı değil. Paketler bilgi yarışmasını ve tahmin sorularını getirir.
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
                <Button inline onClick={() => setRemoving(pack)}>
                  Çıkar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {trip.packIds.some((packId) => !packs.some((pack) => pack.id === packId)) && (
        <p className={text.notice}>
          Bu seyahatin bağlı paketlerinden biri cihazda yok. İnternet varken aşağıdan yeniden indirebilirsin.
        </p>
      )}

      {nearby.length > 0 && (
        <>
          <h2 className={text.sectionTitle}>Cihazdaki diğer paketler</h2>
          <ul className={styles.list}>
            {nearby.map((pack) => (
              <li key={pack.id} className={styles.pack}>
                <div>
                  <p className={styles.title}>{pack.title}</p>
                  <p className={text.hint}>{pack.questions.length} soru</p>
                </div>
                <div className={styles.action}>
                  <Button inline onClick={() => void link(pack.id)}>
                    Ekle
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {trip.country === undefined ? (
        <p className={text.hint}>Seyahati düzenleyip ülkesini seçersen o destinasyonun paketlerini indirebilirim.</p>
      ) : (
        !online && <p className={text.hint}>İnternet yokken paket indirilemez. Bağlanınca bu ekrandan tekrar dene.</p>
      )}

      {nothingNew && !searching && (
        <p className={styles.report} role="status">
          Bu seyahatin paketleri güncel.
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
        <strong>{removing?.title}</strong> bu seyahatten çıkarılacak
        {removing && !usedElsewhere(removing.id) ? ' ve başka seyahatte kullanılmadığı için telefondan silinecek' : ''}.
        Seyahatin oyuncuları, puanları ve tahminleri durur; internet varken paketi yeniden indirebilirsin.
      </ConfirmDialog>
    </Screen>
  )
}
