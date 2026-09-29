import { useEffect, useState, type ReactNode } from 'react'
import { href } from '../app/router.ts'
import { useAppData } from '../app/appData.ts'
import { currentAppearance, saveAppearance, type Appearance } from 'kitshelf-ui/app/appearance.ts'
import { wipeDevice } from '../storage/wipe.ts'
import { Button } from 'kitshelf-ui/ui/Button.tsx'
import ChoiceGroup from 'kitshelf-ui/ui/ChoiceGroup.tsx'
import ConfirmDialog from 'kitshelf-ui/ui/ConfirmDialog.tsx'
import { AutoIcon, MoonIcon, SunIcon } from 'kitshelf-ui/ui/icons.tsx'
import Screen from 'kitshelf-ui/ui/Screen.tsx'
import text from 'kitshelf-ui/ui/text.module.css'
import styles from './AppSettingsScreen.module.css'

const buildTime = new Date(__BUILD_TIME__).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })

const APPEARANCES: { value: Appearance; label: string; icon: ReactNode }[] = [
  { value: 'system', label: 'Oto', icon: <AutoIcon /> },
  { value: 'light', label: 'Açık', icon: <SunIcon /> },
  { value: 'dark', label: 'Koyu', icon: <MoonIcon /> },
]

const megabytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`

export default function AppSettingsScreen() {
  const { packs, trips } = useAppData()
  const [usage, setUsage] = useState<number>()
  const [confirming, setConfirming] = useState(false)
  const [wiping, setWiping] = useState(false)
  const [appearance, setAppearance] = useState(currentAppearance)

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
    <Screen title="Ayarlar" back={href({ screen: 'home' })}>
      <h2 className={text.sectionTitle}>Görünüm</h2>
      <ChoiceGroup
        label="Görünüm"
        hideLabel
        options={APPEARANCES}
        selected={[appearance]}
        onToggle={(value) => {
          saveAppearance(value)
          setAppearance(value)
        }}
      />

      <section className={`${styles.card} ${styles.later}`}>
        <h2 className={text.sectionTitle}>Bu cihazda</h2>
        <dl className={styles.facts}>
          <div>
            <dt>Seyahat</dt>
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
          Seyahatlerin, puanların ve indirdiğin paketler yalnızca bu cihazda duruyor; hiçbiri sunucuya
          gönderilmiyor. Başka bir cihazda görünmemelerinin sebebi de bu.
        </p>
      </section>

      <h2 className={`${text.sectionTitle} ${styles.later}`}>Verileri sil</h2>
      <p className={text.hint}>
        Uygulamanın bu cihazda tuttuğu her şeyi siler: seyahatler, oyuncular, puanlar, tahminler, hazırlık
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
            <strong>{trips.length} seyahat</strong> ve {packs.length} soru paketi, oyuncular, puanlar, tahminler ve
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
