import type { TripState } from '../game/types.ts'
import { countdownMessage, tripPhase } from '../trips/countdown.ts'
import { todayIso } from '../trips/dates.ts'
import styles from './CountdownCard.module.css'
import { tripTheme } from './tripTheme.ts'

/**
 * The top of the trip screen, in the trip's colour: the days left in large type with the day's nudge
 * beside them. Without a count (no date, departure day, on the trip, back home) the heading takes its place.
 */
export default function CountdownCard({ trip }: { trip: TripState }) {
  const phase = tripPhase(trip, todayIso())
  const { title, message } = countdownMessage(phase)

  return (
    <section className={`${styles.card} ${tripTheme(trip.kind)}`}>
      {phase.kind === 'before' && <span className={styles.days}>{phase.daysLeft}</span>}
      <div className={styles.text}>
        <h2 className={phase.kind === 'before' ? styles.label : styles.heading}>
          {phase.kind === 'before' ? 'gün kaldı' : title}
        </h2>
        <p className={styles.message}>{message}</p>
      </div>
    </section>
  )
}
