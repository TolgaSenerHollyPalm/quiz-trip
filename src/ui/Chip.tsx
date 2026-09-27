import type { ReactNode } from 'react'
import styles from './Chip.module.css'

interface ChipProps {
  tone?: 'neutral' | 'quiet' | 'trip' | 'online'
  strong?: boolean // a count, e.g. "57 gün"
  icon?: ReactNode
  children: ReactNode
}

export default function Chip({ tone = 'neutral', strong, icon, children }: ChipProps) {
  return (
    <span className={[styles.chip, styles[tone], strong && styles.strong].filter(Boolean).join(' ')}>
      {icon}
      {children}
    </span>
  )
}
