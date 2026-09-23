import { useState } from 'react'
import { Button } from './Button.tsx'
import { isStandalone, showsIosInstallHint } from './installHint.ts'
import styles from './IosInstallHint.module.css'

const DISMISSED = 'ios-install-hint-dismissed'

function dismissedBefore(): boolean {
  try {
    return localStorage.getItem(DISMISSED) === 'yes'
  } catch {
    return false // private window: the hint simply comes back
  }
}

export default function IosInstallHint() {
  const [hidden, setHidden] = useState(dismissedBefore)
  if (hidden || !showsIosInstallHint(navigator.userAgent, navigator.maxTouchPoints, isStandalone())) return null

  const dismiss = () => {
    setHidden(true)
    try {
      localStorage.setItem(DISMISSED, 'yes')
    } catch {
      // Nothing to remember it with; the hint will show again next time.
    }
  }

  return (
    <aside className={styles.hint}>
      <p>
        <strong>Uygulama gibi kullan:</strong> Safari’nin{' '}
        <svg className={styles.icon} viewBox="0 0 24 24" width="20" height="20" role="img" aria-label="Paylaş">
          <path
            d="M12 3v12M12 3l-3.5 3.5M12 3l3.5 3.5M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>{' '}
        <strong>Paylaş</strong> düğmesine bas, <strong>Ana Ekrana Ekle</strong>’yi seç. Böylece internetsiz de
        çalışır.
      </p>
      <Button onClick={dismiss}>Tamam</Button>
    </aside>
  )
}
