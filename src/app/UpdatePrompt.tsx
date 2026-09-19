import { useRef } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '../ui/Button.tsx'
import styles from './UpdatePrompt.module.css'

// The app can stay open for days during a trip, so look for a new version every hour while online.
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000

export default function UpdatePrompt() {
  const registration = useRef<ServiceWorkerRegistration | undefined>(undefined)
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registered) {
      if (!registered) return
      registration.current = registered
      setInterval(() => {
        if (!navigator.onLine) return
        registered.update().catch(() => {
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

  // Normally the waiting version takes over this page, which then reloads. A page that was never under a service
  // worker's control (e.g. the very first visit) is not taken over, so reload it ourselves once the new one is active.
  const refresh = () => {
    const waiting = registration.current?.waiting
    if (!waiting) {
      location.reload()
      return
    }
    waiting.addEventListener('statechange', () => {
      if (waiting.state === 'activated') location.reload()
    })
    void updateServiceWorker(true)
  }

  return (
    <div className={styles.toast} role="status">
      <p>{needRefresh ? 'Güncelleme hazır.' : 'Uygulama artık internetsiz de çalışır.'}</p>
      <div className={styles.actions}>
        {needRefresh && (
          <Button variant="primary" onClick={refresh}>
            Yenile
          </Button>
        )}
        <Button onClick={close}>{needRefresh ? 'Sonra' : 'Tamam'}</Button>
      </div>
    </div>
  )
}
