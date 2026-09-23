import type { TripKind } from '../trips/types.ts'
import styles from './tripTheme.module.css'

/**
 * The colours a trip's cards are painted with: the sea is blue, a theme park yellow and blue, winter
 * icy white. A trip without a holiday type keeps the app's own turquoise.
 */
export function tripTheme(kind?: TripKind): string {
  return (kind && styles[kind]) || styles.other
}
