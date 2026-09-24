import { useTrip } from '../app/appData.ts'
import { quizTotals, rankPlayers } from '../game/scoring.ts'
import { LinkButton } from '../ui/Button.tsx'
import Missing from '../ui/Missing.tsx'
import Screen from '../ui/Screen.tsx'
import { tripTheme } from '../ui/tripTheme.ts'
import StandingsList from '../ui/StandingsList.tsx'
import styles from './RoundResultScreen.module.css'

export default function RoundResultScreen({ tripId, roundId }: { tripId: string; roundId: string }) {
  const { trip } = useTrip(tripId)
  const back = { screen: 'trip', tripId } as const
  const round = trip?.rounds.find((r) => r.id === roundId)
  if (!trip) return <Missing message="Bu gezi bulunamadı." back={{ screen: 'home' }} />
  if (!round) return <Missing message="Bu tur bulunamadı." back={back} />

  const names = new Map(trip.players.map((player) => [player.id, player.nickname]))
  const seating = trip.players.map((player) => player.id)

  return (
    <Screen title="Tur sonucu" back={back} theme={tripTheme(trip.kind)}>
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
      <LinkButton to={{ screen: 'quiz', tripId }} variant="primary" big>
        Yeni tur
      </LinkButton>
      <LinkButton to={back}>Gezi ekranı</LinkButton>
    </Screen>
  )
}
