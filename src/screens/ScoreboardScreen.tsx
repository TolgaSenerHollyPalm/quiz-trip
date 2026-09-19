import { useTrip } from '../app/appData.ts'
import { quizTotals, rankPlayers } from '../game/scoring.ts'
import Missing from '../ui/Missing.tsx'
import Screen from '../ui/Screen.tsx'
import styles from './ScoreboardScreen.module.css'

export default function ScoreboardScreen({ packId }: { packId: string }) {
  const { pack, trip } = useTrip(packId)
  const back = { screen: 'trip', packId } as const
  if (!pack) return <Missing message="Bu gezi paketi cihazda yok." back={{ screen: 'home' }} />

  const names = new Map(trip.players.map((player) => [player.id, player.nickname]))
  const standings = rankPlayers(
    trip.players.map((player) => player.id),
    quizTotals(trip.rounds),
  )

  return (
    <Screen title="Skor tablosu" back={back}>
      {trip.players.length === 0 ? (
        <p>Henüz oyuncu eklenmedi.</p>
      ) : (
        <>
          <p className={styles.note}>
            {trip.rounds.length > 0 ? `${trip.rounds.length} tur oynandı.` : 'Henüz tur oynanmadı.'}
          </p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Sıra</th>
                <th scope="col">Oyuncu</th>
                <th scope="col" className={styles.points}>
                  Quiz
                </th>
              </tr>
            </thead>
            <tbody>
              {standings.map(({ playerId, points, rank }) => (
                <tr key={playerId} className={rank === 1 && points > 0 ? styles.first : undefined}>
                  <td>{rank}.</td>
                  <td className={styles.name}>{names.get(playerId)}</td>
                  <td className={styles.points}>{points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </Screen>
  )
}
