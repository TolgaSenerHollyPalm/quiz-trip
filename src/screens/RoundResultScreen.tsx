import { useTrip } from '../app/appData.ts'
import { quizTotals, rankPlayers } from '../game/scoring.ts'
import { LinkButton } from '../ui/Button.tsx'
import Missing from '../ui/Missing.tsx'
import Screen from '../ui/Screen.tsx'
import StandingsList from '../ui/StandingsList.tsx'
import styles from './RoundResultScreen.module.css'

export default function RoundResultScreen({ packId, roundId }: { packId: string; roundId: string }) {
  const { pack, trip } = useTrip(packId)
  const back = { screen: 'trip', packId } as const
  const round = trip.rounds.find((r) => r.id === roundId)
  if (!pack || !round) return <Missing message="Bu tur bulunamadı." back={back} />

  const names = new Map(trip.players.map((player) => [player.id, player.nickname]))
  const seating = trip.players.map((player) => player.id)

  return (
    <Screen title="Tur sonucu" back={back}>
      <h2 className={styles.heading}>Bu tur</h2>
      <StandingsList
        standings={rankPlayers(
          seating.filter((id) => id in round.scores),
          round.scores,
        )}
        names={names}
      />
      <h2 className={styles.heading}>Genel sıralama</h2>
      <p className={styles.note}>Bu gezide oynanan {trip.rounds.length} turun toplamı</p>
      <StandingsList standings={rankPlayers(seating, quizTotals(trip.rounds))} names={names} />
      <LinkButton to={{ screen: 'quiz', packId }} variant="primary" big>
        Yeni tur
      </LinkButton>
      <LinkButton to={back}>Gezi ekranı</LinkButton>
    </Screen>
  )
}
