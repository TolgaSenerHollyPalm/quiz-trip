import { useEffect, useState } from 'react'
import { Button } from '../ui/Button.tsx'
import toast from './toast.module.css'

/** Speaks up when the connection drops while the app is open; opening it offline stays quiet. */
export default function ConnectionNotice() {
  const [lost, setLost] = useState(false)

  useEffect(() => {
    const onOffline = () => setLost(true)
    const onOnline = () => setLost(false)
    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)
    return () => {
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
    }
  }, [])

  if (!lost) return null

  return (
    <div className={toast.toast} role="status">
      <p>İnternetin gitti ama devam edebilirsin; TripKit internetsiz de çalışır.</p>
      <div className={toast.actions}>
        <Button onClick={() => setLost(false)}>Tamam</Button>
      </div>
    </div>
  )
}
