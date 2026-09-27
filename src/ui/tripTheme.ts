import type { TripKind } from '../trips/types.ts'
import styles from './tripTheme.module.css'

/**
 * The class that gives a trip its colour (--trip-color, --trip-soft, --trip-ink) from its holiday type.
 * A trip without a holiday type keeps the app's own teal.
 */
export function tripTheme(kind?: TripKind): string {
  return (kind && styles[kind]) || styles.other
}
