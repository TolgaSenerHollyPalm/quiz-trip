import { useRef, useState } from 'react'
import { useTrip } from '../app/appData.ts'
import { navigate } from '../app/router.ts'
import { DIFFICULTY_POINTS, isCorrectChoice, turnPoints } from '../game/scoring.ts'
import { answerTurn } from '../game/trip.ts'
import type { RoundTurn, TurnAnswer } from '../game/types.ts'
import { Button } from '../ui/Button.tsx'
import Countdown from '../ui/Countdown.tsx'
import { CATEGORY_LABELS, DIFFICULTY_LABELS, OPTION_LETTERS } from '../ui/labels.ts'
import Missing from '../ui/Missing.tsx'
import Screen from '../ui/Screen.tsx'
import styles from './PlayScreen.module.css'

interface Feedback {
  turn: RoundTurn
  answer: TurnAnswer
  title: string
  finishedRoundId?: string // set once the last answer has closed the round
}

type Phase = { name: 'ready' } | { name: 'question' } | { name: 'feedback'; feedback: Feedback }

// Every step of a round is saved as it happens; leaving and coming back resumes at the current player's turn.
export default function PlayScreen({ tripId }: { tripId: string }) {
  const { pack, trip, saveTrip } = useTrip(tripId)
  const [phase, setPhase] = useState<Phase>({ name: 'ready' })
  const back = { screen: 'trip', tripId } as const
  const nameOf = (playerId: string) => trip?.players.find((player) => player.id === playerId)?.nickname ?? '?'

  if (!trip) return <Missing message="Bu gezi bulunamadı." back={{ screen: 'home' }} />
  if (!pack) return <Missing message="Bu gezinin soru paketi cihazda yok." back={{ screen: 'trip', tripId }} />

  if (phase.name === 'feedback') {
    const { feedback } = phase
    const next = trip.currentRound?.turns[trip.currentRound.answers.length]
    return (
      <Screen title={feedback.title} back={back}>
        <FeedbackView feedback={feedback} playerName={nameOf(feedback.turn.playerId)} />
        {feedback.finishedRoundId ? (
          <Button
            variant="primary"
            big
            onClick={() => navigate({ screen: 'result', tripId, roundId: feedback.finishedRoundId! }, { replace: true })}
          >
            Sonuçları gör
          </Button>
        ) : (
          <Button variant="primary" big onClick={() => setPhase({ name: 'ready' })}>
            Sıradaki: {next ? nameOf(next.playerId) : ''}
          </Button>
        )}
      </Screen>
    )
  }

  const round = trip.currentRound
  const turn = round?.turns[round.answers.length]
  if (!round || !turn) return <Missing message="Devam eden bir tur yok." back={back} />
  const title = `Soru ${round.answers.length + 1} / ${round.turns.length}`

  if (phase.name === 'ready') {
    return (
      <Screen title={title} back={back}>
        <div className={styles.ready}>
          <p className={styles.readyLabel}>Sıradaki oyuncu</p>
          <p className={styles.playerName}>{nameOf(turn.playerId)}</p>
        </div>
        <Button variant="primary" big onClick={() => setPhase({ name: 'question' })}>
          Hazırım
        </Button>
      </Screen>
    )
  }

  const answer = (choice: number | null) => {
    const updated = answerTurn(trip, choice, new Date().toISOString())
    saveTrip(updated)
    setPhase({
      name: 'feedback',
      feedback: {
        turn,
        answer: { choice, points: turnPoints(turn.question, turn.optionOrder, choice) },
        title,
        finishedRoundId: updated.currentRound ? undefined : round.id,
      },
    })
  }

  return (
    <Screen title={title} back={back}>
      <QuestionView
        turn={turn}
        playerName={nameOf(turn.playerId)}
        timeLimit={round.settings.timeLimit}
        onAnswer={answer}
      />
    </Screen>
  )
}

interface QuestionViewProps {
  turn: RoundTurn
  playerName: string
  timeLimit: number
  onAnswer: (choice: number | null) => void
}

function QuestionView({ turn, playerName, timeLimit, onAnswer }: QuestionViewProps) {
  // A tap and the timer running out can land together; only the first one counts.
  const answered = useRef(false)
  const choose = (choice: number | null) => {
    if (answered.current) return
    answered.current = true
    onAnswer(choice)
  }
  const { question } = turn

  return (
    <>
      <div className={styles.meta}>
        <span className={styles.metaPlayer}>{playerName}</span>
        <span>
          {CATEGORY_LABELS[question.category]} · {DIFFICULTY_LABELS[question.difficulty]} ·{' '}
          {DIFFICULTY_POINTS[question.difficulty]} puan
        </span>
      </div>
      {timeLimit > 0 && <Countdown seconds={timeLimit} onExpire={() => choose(null)} />}
      <p className={styles.question}>{question.text}</p>
      <ol className={styles.options}>
        {turn.optionOrder.map((optionIndex, position) => (
          <li key={optionIndex}>
            <button type="button" className={styles.option} onClick={() => choose(position)}>
              <span className={styles.letter}>{OPTION_LETTERS[position]}</span>
              <span>{question.options[optionIndex]}</span>
            </button>
          </li>
        ))}
      </ol>
    </>
  )
}

function FeedbackView({ feedback, playerName }: { feedback: Feedback; playerName: string }) {
  const { turn, answer } = feedback
  const { question } = turn
  const correct = isCorrectChoice(question, turn.optionOrder, answer.choice)
  const verdict = correct ? `Doğru! +${answer.points} puan` : answer.choice === null ? 'Süre doldu' : 'Yanlış'

  return (
    <>
      <p className={`${styles.verdict} ${correct ? styles.verdictRight : styles.verdictWrong}`} role="status">
        <span className={styles.metaPlayer}>{playerName}</span>
        {verdict}
      </p>
      <p className={styles.questionSmall}>{question.text}</p>
      <ol className={styles.options}>
        {turn.optionOrder.map((optionIndex, position) => {
          const state =
            optionIndex === question.answerIndex
              ? styles.right
              : position === answer.choice
                ? styles.wrong
                : styles.faded
          return (
            <li key={optionIndex}>
              <div className={`${styles.option} ${state}`}>
                <span className={styles.letter}>{OPTION_LETTERS[position]}</span>
                <span>{question.options[optionIndex]}</span>
              </div>
            </li>
          )
        })}
      </ol>
      <p className={styles.explanation}>{question.explanation}</p>
    </>
  )
}
