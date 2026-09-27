import type { ReactNode } from 'react'
import type { TripState } from '../game/types.ts'
import { BagIcon, ForkKnifeIcon, SuitcaseIcon } from '../ui/icons.tsx'
import { LinkRow, ListCard } from '../ui/ListCard.tsx'
import ProgressBar from '../ui/ProgressBar.tsx'
import Tile from '../ui/Tile.tsx'
import type { Tone } from '../ui/tone.ts'
import type { Route } from '../app/router.ts'
import text from '../ui/text.module.css'
import styles from './TripLists.module.css'

/** The trip's three lists, each with how much of it is done. */
export default function TripLists({ trip }: { trip: TripState }) {
  const tripId = trip.id
  const row = (to: Route, title: string, tone: Tone, icon: ReactNode, items: { done: boolean }[]) => {
    const done = items.filter((item) => item.done).length
    return (
      <LinkRow
        to={to}
        tile={<Tile tone={tone}>{icon}</Tile>}
        title={title}
        meta={items.length > 0 ? `${done} / ${items.length}` : 'Ekle'}
        bar={items.length > 0 && <ProgressBar value={done} max={items.length} tone={tone} label={title} />}
      />
    )
  }

  return (
    <section className={styles.section}>
      <h2 className={text.sectionTitle}>Listeler</h2>
      <ListCard as="nav" label="Listeler">
        {row({ screen: 'checklist', tripId }, 'Hazırlık listesi', 'teal', <SuitcaseIcon />, trip.checklist)}
        {row({ screen: 'souvenirs', tripId }, 'Almadan gelme', 'coral', <BagIcon />, trip.souvenirs)}
        {row({ screen: 'tastes', tripId }, 'Tatmadan gelme', 'amber', <ForkKnifeIcon />, trip.tastes)}
      </ListCard>
    </section>
  )
}
