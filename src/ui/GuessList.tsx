import { formatAnswer } from '../game/predictions.ts'
import type { Player, Prediction } from '../game/types.ts'
import styles from './GuessList.module.css'

interface GuessListProps {
  prediction: Prediction
  players: Player[]
}

/** Everyone's guess; only shown once a prediction is locked. After the result, best guesses come first. */
export default function GuessList({ prediction, players }: GuessListProps) {
  const { guesses, points, result, status } = prediction
  const rows = players
    .filter((player) => player.id in guesses)
    .map((player) => ({ player, guess: guesses[player.id], earned: points?.[player.id] ?? 0 }))
  if (status === 'resolved' && result !== undefined) {
    const off = (guess: number) => (prediction.type === 'number' ? Math.abs(guess - result) : 0)
    rows.sort((a, b) => b.earned - a.earned || off(a.guess) - off(b.guess))
  }

  return (
    <ul className={styles.list}>
      {rows.map(({ player, guess, earned }) => (
        <li key={player.id} className={earned > 0 ? `${styles.row} ${styles.scored}` : styles.row}>
          <span className={styles.name}>{player.nickname}</span>
          <span className={styles.guess}>{formatAnswer(prediction, guess)}</span>
          {status === 'resolved' && <span className={styles.points}>{earned > 0 ? `+${earned}` : '0'}</span>}
        </li>
      ))}
    </ul>
  )
}
