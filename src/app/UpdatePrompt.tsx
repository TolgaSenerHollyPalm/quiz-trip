import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '../ui/Button.tsx'
import styles from './UpdatePrompt.module.css'

// The app can stay open for days during a trip, so look for a new version every hour while online.
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000

export default function UpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return
      setInterval(() => {
        if (!navigator.onLine) return
        registration.update().catch(() => {
          // Server unreachable; the next check will try again.
        })
      }, UPDATE_CHECK_INTERVAL_MS)
    },
  })

  if (!offlineReady && !needRefresh) return null

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div className={styles.toast} role="status">
      <p>{needRefresh ? 'Güncelleme hazır.' : 'Uygulama artık internetsiz de çalışır.'}</p>
      <div className={styles.actions}>
        {needRefresh && (
          <Button variant="primary" onClick={() => void updateServiceWorker(true)}>
            Yenile
          </Button>
        )}
        <Button onClick={close}>{needRefresh ? 'Sonra' : 'Tamam'}</Button>
      </div>
    </div>
  )
}
