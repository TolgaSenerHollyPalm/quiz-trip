import { useEffect, useEffectEvent, useState } from 'react'
import styles from './Countdown.module.css'

interface CountdownProps {
  seconds: number
  onExpire: () => void
}

export default function Countdown({ seconds, onExpire }: CountdownProps) {
  const total = seconds * 1000
  const [left, setLeft] = useState(total)
  const expire = useEffectEvent(onExpire)

  useEffect(() => {
    const end = Date.now() + total
    const timer = setInterval(() => {
      const remaining = Math.max(0, end - Date.now())
      setLeft(remaining)
      if (remaining === 0) {
        clearInterval(timer)
        expire()
      }
    }, 200)
    return () => clearInterval(timer)
  }, [total])

  const secondsLeft = Math.ceil(left / 1000)
  return (
    <div className={styles.countdown} data-urgent={secondsLeft <= 5} role="timer" aria-label={`${secondsLeft} saniye kaldı`}>
      <div className={styles.bar} style={{ width: `${(left / total) * 100}%` }} />
      <span className={styles.value}>{secondsLeft} sn</span>
    </div>
  )
}
