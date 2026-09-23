import { useState } from 'react'
import { useAppData } from '../app/appData.ts'
import type { SyncResult } from '../packs/sync.ts'
import type { Pack } from '../packs/types.ts'
import { Button } from '../ui/Button.tsx'
import ConfirmDialog from '../ui/ConfirmDialog.tsx'
import Screen from '../ui/Screen.tsx'
import text from '../ui/text.module.css'
import { useOnline } from '../ui/useOnline.ts'
import styles from './PacksScreen.module.css'

export default function PacksScreen() {
  const { packs, trips, sync, deletePack } = useAppData()
  const [deleting, setDeleting] = useState<Pack>()

  const usedBy = (packId: string) => trips.filter((trip) => trip.packId === packId).length

  return (
    <Screen title="Soru paketleri" back={{ screen: 'home' }} wide>
      <PackUpdates />
      {sync.result && <SyncReport result={sync.result} />}

      {packs.length === 0 ? (
        <p className={text.hint}>Cihazda paket yok. İnternet varken “Paketleri güncelle” ile indirebilirsin.</p>
      ) : (
        <ul className={styles.list}>
          {packs.map((pack) => (
            <li key={pack.id} className={styles.pack}>
              <div>
                <p className={styles.title}>{pack.title}</p>
                <p className={text.hint}>
                  {pack.questions.length} soru · {pack.predictionTemplates.length} tahmin sorusu · sürüm{' '}
                  {pack.version}
                  {usedBy(pack.id) > 0 && ` · ${usedBy(pack.id)} gezide kullanılıyor`}
                </p>
              </div>
              <div className={styles.action}>
                <Button onClick={() => setDeleting(pack)}>Sil</Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={deleting !== undefined}
        title="Paket silinsin mi?"
        confirmLabel="Sil"
        onConfirm={() => {
          if (deleting) deletePack(deleting.id)
          setDeleting(undefined)
        }}
        onCancel={() => setDeleting(undefined)}
      >
        <strong>{deleting?.title}</strong> paketinin soruları telefondan silinecek. Gezilerin, oyuncuların ve
        puanların durur; paketi “Paketleri güncelle” ile yeniden indirebilirsin.
      </ConfirmDialog>
    </Screen>
  )
}

/** Offers an update only when the server has one; offline it stays out of the way. */
function PackUpdates() {
  const { sync, startSync, checkPacks } = useAppData()
  const online = useOnline()
  if (!online) return null
  if (sync.running) return <Button disabled>Güncelleniyor…</Button>
  if (sync.checking) {
    return (
      <p className={styles.status} role="status">
        Paketler kontrol ediliyor…
      </p>
    )
  }
  if (sync.pending === 0) {
    return (
      <p className={styles.status} role="status">
        Paketler güncel.{' '}
        <button type="button" className={styles.recheck} onClick={checkPacks}>
          Yeniden kontrol et
        </button>
      </p>
    )
  }
  return (
    <Button variant="primary" onClick={startSync}>
      {sync.pending === undefined ? 'Paketleri güncelle' : `Paketleri güncelle (${sync.pending})`}
    </Button>
  )
}

function SyncReport({ result }: { result: SyncResult }) {
  if (!result.ok) {
    return (
      <p className={`${styles.report} ${styles.failed}`} role="status">
        Paket listesi alınamadı: {result.reason} Telefondaki paketler olduğu gibi duruyor.
      </p>
    )
  }
  if (result.outcomes.length === 0) {
    return (
      <p className={styles.report} role="status">
        Tüm paketler güncel.
      </p>
    )
  }
  return (
    <ul className={styles.report} role="status">
      {result.outcomes.map((outcome, index) => (
        <li key={`${outcome.id}-${index}`} className={outcome.status === 'failed' ? styles.failed : undefined}>
          {outcome.status === 'added' && `Yeni paket: ${outcome.title}`}
          {outcome.status === 'updated' && `Güncellendi: ${outcome.title} (sürüm ${outcome.version})`}
          {outcome.status === 'failed' &&
            `${outcome.title} güncellenemedi. ${outcome.reason} Eski hâli kullanılmaya devam ediyor.`}
        </li>
      ))}
    </ul>
  )
}
