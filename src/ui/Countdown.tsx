import { useEffect, useEffectEvent, useState } from 'react'
import styles from './Countdown.module.css'
import { StopwatchIcon } from './icons.tsx'

interface CountdownProps {
  seconds: number
  onExpire: () => void
}

/** The time left for a question, as "0:09"; the last five seconds turn red. */
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
    <span className={styles.countdown} data-urgent={secondsLeft <= 5} role="timer" aria-label={`${secondsLeft} saniye kaldı`}>
      <StopwatchIcon />
      {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
    </span>
  )
}
