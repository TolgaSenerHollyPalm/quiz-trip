import { useAppData } from '../app/appData.ts'
import { href } from '../app/router.ts'
import type { TripState } from '../game/types.ts'
import { countdownBadge, countdownMessage, tripPhase } from '../trips/countdown.ts'
import { formatDateRangeShort, todayIso } from '../trips/dates.ts'
import { sortTrips } from '../trips/list.ts'
import { LinkButton } from '../ui/Button.tsx'
import Chip from '../ui/Chip.tsx'
import { IconLink } from '../ui/IconButton.tsx'
import { AppIcon, PlusIcon, SlidersIcon } from '../ui/icons.tsx'
import IosInstallHint from '../ui/IosInstallHint.tsx'
import { TRANSPORT_LABELS, TRIP_KIND_LABELS } from '../ui/labels.ts'
import { LinkRow, ListCard } from '../ui/ListCard.tsx'
import OnlineBadge from '../ui/OnlineBadge.tsx'
import ProgressBar from '../ui/ProgressBar.tsx'
import Screen from '../ui/Screen.tsx'
import text from '../ui/text.module.css'
import Tile from '../ui/Tile.tsx'
import type { Tone } from '../ui/tone.ts'
import TransportIcon from '../ui/TransportIcon.tsx'
import TripKindIcon from '../ui/TripKindIcon.tsx'
import { tripTheme } from '../ui/tripTheme.ts'
import styles from './HomeScreen.module.css'

/** "14 – 21 Ekim · Uçak · Deniz"; "diğer" says nothing, so it is left out. */
function tripLine(trip: TripState, today: string): string {
  return [
    trip.startDate && formatDateRangeShort(trip.startDate, trip.endDate, today),
    trip.transport && trip.transport !== 'other' && TRANSPORT_LABELS[trip.transport],
    trip.kind && trip.kind !== 'other' && TRIP_KIND_LABELS[trip.kind],
  ]
    .filter(Boolean)
    .join(' · ')
}

export default function HomeScreen() {
  const { trips } = useAppData()
  const today = todayIso()
  const sorted = sortTrips(trips, today)
  // The first trip still to come or under way; an undated one has no count to lead with.
  const featured = sorted.find((trip) => ['before', 'today', 'during'].includes(tripPhase(trip, today).kind))
  const others = sorted.filter((trip) => trip !== featured)

  return (
    <Screen
      title="Seyahatlerin"
      eyebrow={trips.length > 0 && `${trips.length} seyahat`}
      icon={
        <span className={styles.brand}>
          <AppIcon />
          TripKit
        </span>
      }
      aside={
        <>
          <OnlineBadge />
          <IconLink to={{ screen: 'app-settings' }} label="Ayarlar">
            <SlidersIcon />
          </IconLink>
        </>
      }
      footer={
        <LinkButton to={{ screen: 'trip-new' }} variant="primary" big>
          <PlusIcon size={20} strokeWidth={2.2} />
          Yeni seyahat
        </LinkButton>
      }
    >
      <IosInstallHint />

      {/* An empty app should say what it is for before it asks for anything. */}
      {trips.length === 0 && (
        <section className={styles.welcome}>
          <h2 className={styles.welcomeTitle}>Seyahatini kur, gerisini TripKit hatırlasın</h2>
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

      {featured && <FeaturedTrip trip={featured} today={today} />}

      {others.length > 0 && (
        <section className={styles.section}>
          <h2 className={text.sectionTitle}>{featured ? 'Diğer seyahatler' : 'Seyahatler'}</h2>
          <ListCard as="nav" label="Seyahatler">
            {others.map((trip) => (
              <OtherTrip key={trip.id} trip={trip} today={today} />
            ))}
          </ListCard>
        </section>
      )}
    </Screen>
  )
}

/** The trip that is next: its countdown in its own colour, and how far its three lists have got. */
function FeaturedTrip({ trip, today }: { trip: TripState; today: string }) {
  const phase = tripPhase(trip, today)
  const lists: [string, Tone, { done: boolean }[]][] = [
    ['Hazırlık', 'teal', trip.checklist],
    ['Almadan gelme', 'coral', trip.souvenirs],
    ['Tatmadan gelme', 'amber', trip.tastes],
  ]

  return (
    <a className={`${styles.featured} ${tripTheme(trip.kind)}`} href={href({ screen: 'trip', tripId: trip.id })}>
      <div className={styles.top}>
        <div className={styles.topRow}>
          <span className={styles.next}>{phase.kind === 'during' ? 'Devam eden seyahat' : 'Sıradaki seyahat'}</span>
          <TransportIcon transport={trip.transport} size={22} decorative />
        </div>
        {phase.kind === 'before' ? (
          <p className={styles.count}>
            <span className={styles.days}>{phase.daysLeft}</span>
            gün kaldı
          </p>
        ) : (
          <p className={styles.headline}>{countdownMessage(phase).title}</p>
        )}
        <div className={styles.names}>
          <h2 className={styles.name}>{trip.name}</h2>
          <p className={styles.line}>{tripLine(trip, today)}</p>
        </div>
      </div>
      <div className={styles.lists}>
        {lists.map(([label, tone, items]) => {
          const done = items.filter((item) => item.done).length
          return (
            <div key={label} className={styles.list}>
              <span className={styles.listLabel}>{label}</span>
              <span className={styles.listCount}>{items.length > 0 ? `${done} / ${items.length}` : '—'}</span>
              <ProgressBar value={done} max={items.length} tone={tone} label={label} />
            </div>
          )
        })}
      </div>
    </a>
  )
}

function OtherTrip({ trip, today }: { trip: TripState; today: string }) {
  const phase = tripPhase(trip, today)
  const badge = countdownBadge(phase)
  const finished = phase.kind === 'after'
  const icon =
    trip.transport && trip.transport !== 'other' ? (
      <TransportIcon transport={trip.transport} size={22} decorative />
    ) : (
      <TripKindIcon kind={trip.kind ?? 'other'} size={22} />
    )

  return (
    <LinkRow
      to={{ screen: 'trip', tripId: trip.id }}
      tile={
        <Tile tone={finished ? 'neutral' : 'trip'} theme={tripTheme(trip.kind)}>
          {icon}
        </Tile>
      }
      title={trip.name}
      subtitle={tripLine(trip, today) || undefined}
      trailing={
        badge &&
        (finished ? (
          <Chip tone="quiet" strong>
            {badge}
          </Chip>
        ) : (
          <span className={tripTheme(trip.kind)}>
            <Chip tone="trip" strong>
              {badge}
            </Chip>
          </span>
        ))
      }
    />
  )
}
