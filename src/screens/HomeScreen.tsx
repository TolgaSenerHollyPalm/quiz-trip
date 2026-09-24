import { useAppData } from '../app/appData.ts'
import { href } from '../app/router.ts'
import type { TripState } from '../game/types.ts'
import { countdownBadge, tripPhase } from '../trips/countdown.ts'
import { formatDateRange, todayIso } from '../trips/dates.ts'
import { sortTrips } from '../trips/list.ts'
import { LinkButton } from '../ui/Button.tsx'
import { AppMark } from '../ui/icons.tsx'
import IosInstallHint from '../ui/IosInstallHint.tsx'
import { TRIP_KIND_LABELS } from '../ui/labels.ts'
import OnlineBadge from '../ui/OnlineBadge.tsx'
import Screen from '../ui/Screen.tsx'
import text from '../ui/text.module.css'
import TransportIcon from '../ui/TransportIcon.tsx'
import { tripTheme } from '../ui/tripTheme.ts'
import styles from './HomeScreen.module.css'

const buildTime = new Date(__BUILD_TIME__).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })

export default function HomeScreen() {
  const { trips } = useAppData()
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
    <Screen title="TripKit" icon={<AppMark />} aside={<OnlineBadge />} wide>
      <IosInstallHint />

      {/* An empty app should say what it is for before it asks for anything. */}
      {sorted.length === 0 && (
        <section className={styles.welcome}>
          <h2 className={styles.welcomeTitle}>Gezini kur, gerisini TripKit hatırlasın</h2>
          <ol className={styles.steps}>
            <li>
              <span className={styles.stepNumber}>1</span>
              Nereye ve ne zaman gideceğini gir; geri sayım o gün için başlasın.
            </li>
            <li>
              <span className={styles.stepNumber}>2</span>
              Ulaşım türüne ve tatil tarzına göre valiz ve yapılacaklar listen kendiliğinden hazırlansın.
            </li>
            <li>
              <span className={styles.stepNumber}>3</span>
              Gideceğin yerin soru paketini indir, bilgi yarışması ve tahmin oyunuyla yolculuğu eğlenceye
              çevir.
            </li>
          </ol>
          <p className={text.hint}>Her şey cihazında kalır ve internet olmadan da çalışır.</p>
        </section>
      )}

      <div className={styles.action}>
        <LinkButton to={{ screen: 'trip-new' }} variant="primary" big>
          + Yeni gezi
        </LinkButton>
      </div>

      {sorted.length > 0 && (
        <ul className={styles.list}>
          {sorted.map((trip) => {
            const phase = tripPhase(trip, today)
            const badge = countdownBadge(phase)
            return (
              <li key={trip.id}>
                <a className={`${styles.card} ${tripTheme(trip.kind)}`} href={href({ screen: 'trip', tripId: trip.id })}>
                  <span className={styles.head}>
                    <TransportIcon transport={trip.transport} size={26} />
                    <span className={styles.title}>{trip.name}</span>
                    {badge && (
                      <span className={`${styles.badge} ${phase.kind === 'after' ? styles.badgeDone : ''}`}>
                        {badge}
                      </span>
                    )}
                  </span>
                  <span className={styles.details}>{details(trip)}</span>
                </a>
              </li>
            )
          })}
        </ul>
      )}

      <p className={styles.version}>Sürüm: {buildTime}</p>
    </Screen>
  )
}
