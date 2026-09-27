import { toneClass, type Tone } from './tone.ts'
import styles from './ProgressBar.module.css'

interface ProgressBarProps {
  value: number
  max: number
  tone: Tone
  label: string // what is being counted, e.g. "Hazırlık listesi"
  thick?: boolean
}

/** How much of a list is done. An empty list has no bar at all. */
export default function ProgressBar({ value, max, tone, label, thick }: ProgressBarProps) {
  if (max <= 0) return null
  const share = Math.min(1, Math.max(0, value / max))
  return (
    <span
      className={[styles.track, thick && styles.thick, toneClass(tone)].filter(Boolean).join(' ')}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${value} / ${max}`}
    >
      <span className={styles.fill} style={{ width: `${share * 100}%` }} />
    </span>
  )
}
