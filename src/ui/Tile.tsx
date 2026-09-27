import type { ReactNode } from 'react'
import { toneClass, type Tone } from './tone.ts'
import styles from './Tile.module.css'

/** A rounded square in a list's soft colour with its icon on it. */
export default function Tile({ tone, size, children }: { tone: Tone; size?: 'small' | 'large'; children: ReactNode }) {
  return (
    <span className={[styles.tile, size && styles[size], toneClass(tone)].filter(Boolean).join(' ')} aria-hidden="true">
      {children}
    </span>
  )
}
