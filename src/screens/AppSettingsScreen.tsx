import { useEffect, useState } from 'react'
import { useAppData } from '../app/appData.ts'
import { wipeDevice } from '../storage/wipe.ts'
import { Button } from '../ui/Button.tsx'
import ConfirmDialog from '../ui/ConfirmDialog.tsx'
import Screen from '../ui/Screen.tsx'
import text from '../ui/text.module.css'
import styles from './AppSettingsScreen.module.css'

const buildTime = new Date(__BUILD_TIME__).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })

const megabytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`

export default function AppSettingsScreen() {
  const { packs, trips } = useAppData()
  const [usage, setUsage] = useState<number>()
  const [confirming, setConfirming] = useState(false)
  const [wiping, setWiping] = useState(false)

  // How much room the app takes; the browser answers for the whole site, not just our stores.
  useEffect(() => {
    let active = true
    navigator.storage
      ?.estimate?.()
      .then((estimate) => {
        if (active && estimate.usage !== undefined) setUsage(estimate.usage)
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])

  const questions = packs.reduce((total, pack) => total + pack.questions.length, 0)

  const wipe = () => {
    setWiping(true)
    void wipeDevice().then(() => {
      // A full load rather than a router change: every screen has to start from an empty device.
      location.replace(import.meta.env.BASE_URL)
    })
  }

  return (
    <Screen title="Ayarlar" back={{ screen: 'home' }}>
      <section className={styles.card}>
        <h2 className={text.heading}>Bu cihazda</h2>
        <dl className={styles.facts}>
          <div>
            <dt>Gezi</dt>
            <dd>{trips.length}</dd>
          </div>
          <div>
            <dt>Soru paketi</dt>
            <dd>{packs.length}</dd>
          </div>
          <div>
            <dt>Soru</dt>
            <dd>{questions}</dd>
          </div>
          <div>
            <dt>Kapladığı yer</dt>
            <dd>{usage === undefined ? '—' : megabytes(usage)}</dd>
          </div>
        </dl>
        <p className={text.hint}>
          Gezilerin, puanların ve indirdiğin paketler yalnızca bu cihazda duruyor; hiçbiri sunucuya
          gönderilmiyor. Başka bir cihazda görünmemelerinin sebebi de bu.
        </p>
      </section>

      <h2 className={text.heading}>Verileri sil</h2>
      <p className={text.hint}>
        Uygulamanın bu cihazda tuttuğu her şeyi siler: geziler, oyuncular, puanlar, tahminler, hazırlık
        listeleri, indirilmiş soru paketleri ve ayarlar. Geri alınamaz.
      </p>
      <Button variant="danger" disabled={wiping} onClick={() => setConfirming(true)}>
        {wiping ? 'Siliniyor…' : 'Tüm verileri sil'}
      </Button>

      <p className={styles.version}>Sürüm: {buildTime}</p>

      <ConfirmDialog
        open={confirming}
        title="Her şey silinsin mi?"
        confirmLabel="Evet, sil"
        onConfirm={() => {
          setConfirming(false)
          wipe()
        }}
        onCancel={() => setConfirming(false)}
      >
        {trips.length > 0 ? (
          <>
            <strong>{trips.length} gezi</strong> ve {packs.length} soru paketi, oyuncular, puanlar, tahminler ve
            hazırlık listeleriyle birlikte silinecek.
          </>
        ) : (
          <>İndirilmiş {packs.length} soru paketi ve uygulama ayarları silinecek.</>
        )}{' '}
        Bu işlem geri alınamaz; yedek yok. Uygulama sıfırdan açılacak.
      </ConfirmDialog>
    </Screen>
  )
}
