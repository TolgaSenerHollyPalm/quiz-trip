import { useAppData } from '../app/appData.ts'
import { href } from '../app/router.ts'
import type { SyncResult } from '../packs/sync.ts'
import { Button } from '../ui/Button.tsx'
import IosInstallHint from '../ui/IosInstallHint.tsx'
import OnlineBadge from '../ui/OnlineBadge.tsx'
import Screen from '../ui/Screen.tsx'
import { useOnline } from '../ui/useOnline.ts'
import styles from './HomeScreen.module.css'

const buildTime = new Date(__BUILD_TIME__).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })

export default function HomeScreen() {
  const { packs, trips, sync, startSync } = useAppData()
  const online = useOnline()

  return (
    <Screen title="Trip Quiz" aside={<OnlineBadge />}>
      <IosInstallHint />
      <h2 className={styles.heading}>Geziler</h2>
      {packs.length === 0 ? (
        <p>Cihazda henüz gezi paketi yok.</p>
      ) : (
        <ul className={styles.list}>
          {packs.map((pack) => {
            const trip = trips[pack.id]
            const details = [`${pack.questions.length} soru`]
            if (trip?.players.length) details.push(`${trip.players.length} oyuncu`)
            if (trip?.rounds.length) details.push(`${trip.rounds.length} tur`)
            return (
              <li key={pack.id}>
                <a className={styles.card} href={href({ screen: 'trip', packId: pack.id })}>
                  <span className={styles.title}>{pack.title}</span>
                  <span className={styles.details}>{details.join(' · ')}</span>
                </a>
              </li>
            )
          })}
        </ul>
      )}

      <Button disabled={!online || sync.running} onClick={startSync}>
        {!online ? 'İnternet yok' : sync.running ? 'Güncelleniyor…' : 'Paketleri güncelle'}
      </Button>
      {sync.result && <SyncReport result={sync.result} />}

      <p className={styles.version}>Sürüm: {buildTime}</p>
    </Screen>
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
          {outcome.status === 'failed' && `${outcome.title} güncellenemedi. ${outcome.reason} Eski hâli kullanılmaya devam ediyor.`}
        </li>
      ))}
    </ul>
  )
}
