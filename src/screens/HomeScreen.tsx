import { useAppData } from '../app/appData.ts'
import { href } from '../app/router.ts'
import type { TripState } from '../game/types.ts'
import { countdownBadge, tripPhase } from '../trips/countdown.ts'
import { formatDateRange, todayIso } from '../trips/dates.ts'
import { sortTrips } from '../trips/list.ts'
import { LinkButton } from '../ui/Button.tsx'
import IosInstallHint from '../ui/IosInstallHint.tsx'
import { TRIP_KIND_LABELS } from '../ui/labels.ts'
import OnlineBadge from '../ui/OnlineBadge.tsx'
import Screen from '../ui/Screen.tsx'
import text from '../ui/text.module.css'
import TransportIcon from '../ui/TransportIcon.tsx'
import styles from './HomeScreen.module.css'

const buildTime = new Date(__BUILD_TIME__).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })

export default function HomeScreen() {
  const { packs, trips } = useAppData()
  const today = todayIso()
  const sorted = sortTrips(trips, today)

  const details = (trip: TripState) => {
    const parts = trip.startDate ? [formatDateRange(trip.startDate, trip.endDate)] : []
    if (trip.kind) parts.push(TRIP_KIND_LABELS[trip.kind])
    const packed = trip.checklist.filter((item) => item.done).length
    if (trip.checklist.length > 0) parts.push(`${packed}/${trip.checklist.length} hazır`)
    return parts.join(' · ')
  }

  return (
    <Screen title="Trip Quiz" aside={<OnlineBadge />}>
      <IosInstallHint />
      <LinkButton to={{ screen: 'trip-new' }} variant="primary" big>
        + Yeni gezi
      </LinkButton>

      {sorted.length === 0 ? (
        <p className={text.hint}>Henüz gezi yok. Nereye ve ne zaman gideceğini gir, sayaç başlasın.</p>
      ) : (
        <ul className={styles.list}>
          {sorted.map((trip) => {
            const badge = countdownBadge(tripPhase(trip, today))
            return (
              <li key={trip.id}>
                <a className={styles.card} href={href({ screen: 'trip', tripId: trip.id })}>
                  <span className={styles.head}>
                    <TransportIcon transport={trip.transport} size={26} />
                    <span className={styles.title}>{trip.name}</span>
                    {badge && <span className={styles.badge}>{badge}</span>}
                  </span>
                  <span className={styles.details}>{details(trip)}</span>
                </a>
              </li>
            )
          })}
        </ul>
      )}

      <LinkButton to={{ screen: 'packs' }}>Soru paketleri ({packs.length})</LinkButton>
      <p className={styles.version}>Sürüm: {buildTime}</p>
    </Screen>
  )
}
