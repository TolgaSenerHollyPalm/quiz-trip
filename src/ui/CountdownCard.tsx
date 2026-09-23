import type { TripState } from '../game/types.ts'
import { countdownMessage, tripPhase } from '../trips/countdown.ts'
import { formatDateRange, todayIso } from '../trips/dates.ts'
import { TRIP_KIND_LABELS } from './labels.ts'
import styles from './CountdownCard.module.css'
import TransportIcon from './TransportIcon.tsx'
import { tripTheme } from './tripTheme.ts'

/** The top of the trip screen: how long until departure, and a nudge for today. */
export default function CountdownCard({ trip }: { trip: TripState }) {
  const phase = tripPhase(trip, todayIso())
  const { title, message } = countdownMessage(phase)
  const meta = [trip.startDate && formatDateRange(trip.startDate, trip.endDate), trip.kind && TRIP_KIND_LABELS[trip.kind]]
    .filter(Boolean)
    .join(' · ')

  return (
    <section className={`${styles.card} ${styles[phase.kind]} ${tripTheme(trip.kind)}`}>
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        <TransportIcon transport={trip.transport} size={34} />
      </div>
      <p>{message}</p>
      {meta !== '' && <p className={styles.meta}>{meta}</p>}
    </section>
  )
}
