import { useState } from 'react'
import { useTrip } from '../app/appData.ts'
import { navigate } from '../app/router.ts'
import { describeBounds, guessProblem, submitGuess } from '../game/predictions.ts'
import { Button, LinkButton } from '../ui/Button.tsx'
import GuessList from '../ui/GuessList.tsx'
import Missing from '../ui/Missing.tsx'
import Screen from '../ui/Screen.tsx'
import { tripTheme } from '../ui/tripTheme.ts'
import text from '../ui/text.module.css'
import ValueField from '../ui/ValueField.tsx'
import styles from './GuessScreen.module.css'

type Phase = 'handoff' | 'input' | 'locked'

interface GuessScreenProps {
  tripId: string
  predictionId: string
  playerId?: string // only this player changes their guess
}

/**
 * Players enter their guesses one after another on the same phone. Nobody sees an earlier guess: the field
 * always starts empty and a hand-over screen sits between players. The last guess locks the prediction.
 */
export default function GuessScreen({ tripId, predictionId, playerId }: GuessScreenProps) {
  const { trip, saveTrip } = useTrip(tripId)
  const prediction = trip?.predictions.find((p) => p.id === predictionId)
  const [queue] = useState(() =>
    playerId ? [playerId] : (trip?.players ?? []).filter((player) => !(player.id in (prediction?.guesses ?? {}))).map((p) => p.id),
  )
  const [position, setPosition] = useState(0)
  const [phase, setPhase] = useState<Phase>(playerId ? 'input' : 'handoff')
  const [value, setValue] = useState<number>()
  const [problem, setProblem] = useState<string>()

  const detail = { screen: 'prediction', tripId, predictionId } as const
  if (!trip) return <Missing message="Bu gezi bulunamadı." back={{ screen: 'home' }} />
  if (!prediction) return <Missing message="Bu tahmin bulunamadı." back={{ screen: 'predictions', tripId }} />

  if (phase === 'locked') {
    return (
      <Screen title="Tahminler kilitlendi" back={detail} theme={tripTheme(trip.kind)}>
        <p className={styles.done}>Herkes girdi. Artık tahminler değiştirilemez.</p>
        <p className={text.question}>{prediction.text}</p>
        <GuessList prediction={prediction} players={trip.players} />
        <LinkButton to={detail} variant="primary" big>
          Tamam
        </LinkButton>
      </Screen>
    )
  }

  const player = trip.players.find((p) => p.id === queue[position])
  if (prediction.status !== 'open' || !player) {
    return <Missing message="Bu tahmine girilecek bir şey kalmadı." back={detail} />
  }

  const moveTo = (next: number, nextPhase: Phase) => {
    setPosition(next)
    setPhase(nextPhase)
    setValue(undefined)
    setProblem(undefined)
  }

  const save = () => {
    const issue = guessProblem(prediction, value ?? Number.NaN)
    if (issue) {
      setProblem(issue)
      return
    }
    const updated = submitGuess(trip, prediction.id, player.id, value!)
    saveTrip(updated)
    if (updated.predictions.find((p) => p.id === prediction.id)?.status === 'locked') setPhase('locked')
    else if (position + 1 < queue.length) moveTo(position + 1, 'handoff')
    else navigate(detail, { replace: true })
  }

  if (phase === 'handoff') {
    const previous = trip.players.find((p) => p.id === queue[position - 1])
    return (
      <Screen title="Tahmin girişi" back={detail} theme={tripTheme(trip.kind)}>
        {previous && <p className={styles.saved}>Kaydedildi. Telefonu sıradaki oyuncuya ver.</p>}
        <div className={styles.handoff}>
          <p className={styles.label}>Sıradaki oyuncu</p>
          <p className={styles.name}>{player.nickname}</p>
          <p className={text.hint}>Diğerlerinin tahminleri gizli.</p>
        </div>
        <Button variant="primary" big onClick={() => setPhase('input')}>
          Hazırım
        </Button>
        {previous && (
          <Button onClick={() => moveTo(position - 1, 'input')}>Geri: {previous.nickname} tahminini değiştirsin</Button>
        )}
      </Screen>
    )
  }

  const bounds = describeBounds(prediction)
  return (
    <Screen title="Tahmin girişi" back={detail} theme={tripTheme(trip.kind)}>
      <p className={styles.player}>{player.nickname}</p>
      <p className={text.question}>{prediction.text}</p>
      {prediction.type === 'number' && bounds && <p className={text.meta}>{bounds}</p>}
      <ValueField
        key={`${player.id}-${position}`}
        prediction={prediction}
        label="Tahminin"
        invalid={problem !== undefined}
        onChange={(next) => {
          setValue(next)
          setProblem(undefined)
        }}
      />
      {player.id in prediction.guesses && <p className={text.hint}>Önceki tahminin gizli; yenisini gir.</p>}
      {problem && (
        <p className={text.problem} role="alert">
          {problem}
        </p>
      )}
      <Button variant="primary" big onClick={save}>
        Kaydet
      </Button>
    </Screen>
  )
}
