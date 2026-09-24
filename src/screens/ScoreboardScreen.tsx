import { useTrip } from '../app/appData.ts'
import { predictionTotals } from '../game/predictions.ts'
import { quizTotals, rankPlayers } from '../game/scoring.ts'
import Missing from '../ui/Missing.tsx'
import Screen from '../ui/Screen.tsx'
import { tripTheme } from '../ui/tripTheme.ts'
import styles from './ScoreboardScreen.module.css'

export default function ScoreboardScreen({ tripId }: { tripId: string }) {
  const { trip } = useTrip(tripId)
  const back = { screen: 'trip', tripId } as const
  if (!trip) return <Missing message="Bu gezi bulunamadı." back={{ screen: 'home' }} />

  const names = new Map(trip.players.map((player) => [player.id, player.nickname]))
  const quiz = quizTotals(trip.rounds)
  const predictions = predictionTotals(trip.predictions)
  const totals = Object.fromEntries(
    trip.players.map((player) => [player.id, (quiz[player.id] ?? 0) + (predictions[player.id] ?? 0)]),
  )
  const standings = rankPlayers(
    trip.players.map((player) => player.id),
    totals,
  )
  const resolved = trip.predictions.filter((prediction) => prediction.status === 'resolved').length

  return (
    <Screen title="Skor tablosu" back={back} theme={tripTheme(trip.kind)}>
      {trip.players.length === 0 ? (
        <p>Henüz oyuncu eklenmedi.</p>
      ) : (
        <>
          <p className={styles.note}>
            {trip.rounds.length} tur oynandı · {resolved} tahmin sonuçlandı
          </p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Sıra</th>
                <th scope="col">Oyuncu</th>
                <th scope="col" className={styles.points}>
                  Quiz
                </th>
                <th scope="col" className={styles.points}>
                  Tahmin
                </th>
                <th scope="col" className={styles.points}>
                  Toplam
                </th>
              </tr>
            </thead>
            <tbody>
              {standings.map(({ playerId, points, rank }) => (
                <tr key={playerId} className={rank === 1 && points > 0 ? styles.first : undefined}>
                  <td>{rank}.</td>
                  <td className={styles.name}>{names.get(playerId)}</td>
                  <td className={styles.points}>{quiz[playerId] ?? 0}</td>
                  <td className={styles.points}>{predictions[playerId] ?? 0}</td>
                  <td className={`${styles.points} ${styles.total}`}>{points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </Screen>
  )
}
