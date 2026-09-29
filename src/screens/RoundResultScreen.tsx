import { href } from '../app/router.ts'
import { useTrip } from '../app/appData.ts'
import { quizTotals, rankPlayers } from '../game/scoring.ts'
import { LinkButton } from 'kitshelf-ui/ui/Button.tsx'
import Missing from 'kitshelf-ui/ui/Missing.tsx'
import Screen from 'kitshelf-ui/ui/Screen.tsx'
import { tripTheme } from '../ui/tripTheme.ts'
import StandingsList from '../ui/StandingsList.tsx'
import text from 'kitshelf-ui/ui/text.module.css'
import styles from './RoundResultScreen.module.css'

export default function RoundResultScreen({ tripId, roundId }: { tripId: string; roundId: string }) {
  const { trip } = useTrip(tripId)
  const back = { screen: 'trip', tripId } as const
  const round = trip?.rounds.find((r) => r.id === roundId)
  if (!trip) return <Missing message="Bu seyahat bulunamadı." back={href({ screen: 'home' })} />
  if (!round) return <Missing message="Bu tur bulunamadı." back={href(back)} />

  const names = new Map(trip.players.map((player) => [player.id, player.nickname]))
  const seating = trip.players.map((player) => player.id)

  return (
    <Screen
      title="Tur sonucu"
      back={href(back)}
      theme={tripTheme(trip.kind)}
      footer={
        <LinkButton to={href({ screen: 'quiz', tripId })} variant="primary" big>
          Yeni tur
        </LinkButton>
      }
    >
      <h2 className={text.sectionTitle}>Bu tur</h2>
      <StandingsList
        standings={rankPlayers(
          seating.filter((id) => id in round.scores),
          round.scores,
        )}
        names={names}
      />
      <h2 className={`${text.sectionTitle} ${styles.later}`}>Genel sıralama</h2>
      <p className={styles.note}>Bu seyahatte oynanan {trip.rounds.length} turun toplamı</p>
      <StandingsList standings={rankPlayers(seating, quizTotals(trip.rounds))} names={names} />
      <LinkButton to={href(back)}>Seyahat ekranına dön</LinkButton>
    </Screen>
  )
}
