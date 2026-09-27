import type { ReactNode } from 'react'
import { toneClass, type Tone } from './tone.ts'
import styles from './Tile.module.css'

/** A rounded square in a list's soft colour with its icon on it. */
interface TileProps {
  tone: Tone
  size?: 'small' | 'large'
  theme?: string // a trip's colour class, for the 'trip' tone
  children: ReactNode
}

export default function Tile({ tone, size, theme, children }: TileProps) {
  return (
    <span className={[styles.tile, size && styles[size], theme, toneClass(tone)].filter(Boolean).join(' ')} aria-hidden="true">
      {children}
    </span>
  )
}
