import type { Standing } from '../game/scoring.ts'
import { TrophyIcon } from './icons.tsx'
import styles from './StandingsList.module.css'

interface StandingsListProps {
  standings: Standing[]
  names: ReadonlyMap<string, string>
}

/** Places on a white card: the rank first (a cup for whoever leads), the points on the right. */
export default function StandingsList({ standings, names }: StandingsListProps) {
  return (
    <ol className={styles.list}>
      {standings.map(({ playerId, points, rank }) => (
        <li key={playerId} className={styles.row}>
          <span className={rank === 1 ? `${styles.rank} ${styles.first}` : styles.rank}>
            {rank === 1 ? (
              <>
                <TrophyIcon size={20} />
                <span className={styles.hidden}>1.</span>
              </>
            ) : (
              rank
            )}
          </span>
          <span className={styles.name}>{names.get(playerId)}</span>
          <span className={styles.points}>{points} puan</span>
        </li>
      ))}
    </ol>
  )
}
