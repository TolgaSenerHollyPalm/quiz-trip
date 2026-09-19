import type { Standing } from '../game/scoring.ts'
import styles from './StandingsList.module.css'

interface StandingsListProps {
  standings: Standing[]
  names: ReadonlyMap<string, string>
}

export default function StandingsList({ standings, names }: StandingsListProps) {
  return (
    <ol className={styles.list}>
      {standings.map(({ playerId, points, rank }) => (
        <li key={playerId} className={rank === 1 ? `${styles.row} ${styles.first}` : styles.row}>
          <span className={styles.rank}>{rank}.</span>
          <span className={styles.name}>{names.get(playerId)}</span>
          <span className={styles.points}>{points} puan</span>
        </li>
      ))}
    </ol>
  )
}
