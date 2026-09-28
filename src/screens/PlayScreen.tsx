import { useRef, useState, type ReactNode } from 'react'
import { useTrip } from '../app/appData.ts'
import { navigate, type Route } from '../app/router.ts'
import { DIFFICULTY_POINTS, isCorrectChoice, roundPoints, turnPoints } from '../game/scoring.ts'
import { answerTurn } from '../game/trip.ts'
import type { CurrentRound, Player, RoundTurn, TurnAnswer } from '../game/types.ts'
import { categoryLabel } from '../packs/collection.ts'
import Avatar from '../ui/Avatar.tsx'
import { Button } from '../ui/Button.tsx'
import Countdown from '../ui/Countdown.tsx'
import { IconLink } from '../ui/IconButton.tsx'
import { ArrowRightIcon, CheckIcon, CloseIcon } from '../ui/icons.tsx'
import { DIFFICULTY_LABELS, OPTION_LETTERS } from '../ui/labels.ts'
import Missing from '../ui/Missing.tsx'
import ProgressBar from '../ui/ProgressBar.tsx'
import text from '../ui/text.module.css'
import { tripTheme } from '../ui/tripTheme.ts'
import { dative, locative } from '../ui/turkish.ts'
import styles from './PlayScreen.module.css'

interface Feedback {
  turn: RoundTurn
  answer: TurnAnswer
  number: number // which question of the round it was
  points: Record<string, number> // the round's points once this answer counted
  finishedRoundId?: string // set once the last answer has closed the round
}

type Phase = { name: 'ready' } | { name: 'question' } | { name: 'feedback'; feedback: Feedback }

// Every step of a round is saved as it happens; leaving and coming back resumes at the current player's turn.
export default function PlayScreen({ tripId }: { tripId: string }) {
  const { collection, trip, saveTrip } = useTrip(tripId)
  const [phase, setPhase] = useState<Phase>({ name: 'ready' })
  const back: Route = { screen: 'trip', tripId }

  if (!trip) return <Missing message="Bu seyahat bulunamadı." back={{ screen: 'home' }} />
  if (collection.packs.length === 0) {
    return <Missing message="Bu seyahatin soru paketi cihazda yok." back={back} />
  }
  const player = (playerId: string) => trip.players.find((candidate) => candidate.id === playerId)
  const nameOf = (playerId: string) => player(playerId)?.nickname ?? '?'
  const theme = tripTheme(trip.kind)

  if (phase.name === 'feedback') {
    const { feedback } = phase
    const next = trip.currentRound?.turns[trip.currentRound.answers.length]
    const total = feedback.finishedRoundId ? feedback.number : (trip.currentRound?.turns.length ?? feedback.number)
    return (
      <GameScreen
        theme={theme}
        back={back}
        position={`Soru ${feedback.number} / ${total}`}
        progress={[feedback.number, total]}
        footer={
          feedback.finishedRoundId ? (
            <Button
              variant="primary"
              big
              onClick={() => navigate({ screen: 'result', tripId, roundId: feedback.finishedRoundId! }, { replace: true })}
            >
              Turu bitir
            </Button>
          ) : (
            <Button variant="primary" big onClick={() => setPhase({ name: 'ready' })}>
              Sıradaki: {next ? nameOf(next.playerId) : ''}
              <ArrowRightIcon />
            </Button>
          )
        }
      >
        <PlayerRow players={trip.players} playerId={feedback.turn.playerId} points={feedback.points} />
        <QuestionCard turn={feedback.turn} categoryName={categoryLabel(collection, feedback.turn.question.category)} />
        <Options turn={feedback.turn} answer={feedback.answer} />
        <Verdict turn={feedback.turn} answer={feedback.answer} />
      </GameScreen>
    )
  }

  const round = trip.currentRound
  const turn = round?.turns[round.answers.length]
  if (!round || !turn) return <Missing message="Devam eden bir tur yok." back={back} />
  const number = round.answers.length + 1
  const position = `Soru ${number} / ${round.turns.length}`

  if (phase.name === 'ready') {
    const name = nameOf(turn.playerId)
    const to = dative(name)
    return (
      <GameScreen
        theme={theme}
        back={back}
        position={position}
        progress={[round.answers.length, round.turns.length]}
        footer={
          <Button variant="primary" big onClick={() => setPhase({ name: 'question' })}>
            Hazırım
          </Button>
        }
      >
        <div className={styles.handOver}>
          <Avatar name={nameOf(turn.playerId)} large />
          <p className={styles.handOverText}>{to ? `Telefonu ${to} ver` : `Telefonu ver: ${name}`}</p>
        </div>
      </GameScreen>
    )
  }

  const answer = (choice: number | null) => {
    const updated = answerTurn(trip, choice, new Date().toISOString())
    saveTrip(updated)
    const given: TurnAnswer = { choice, points: turnPoints(turn.question, turn.optionOrder, choice) }
    setPhase({
      name: 'feedback',
      feedback: {
        turn,
        answer: given,
        number,
        points: roundPoints({ turns: round.turns, answers: [...round.answers, given] }),
        finishedRoundId: updated.currentRound ? undefined : round.id,
      },
    })
  }

  return (
    <QuestionPhase
      theme={theme}
      back={back}
      position={position}
      round={round}
      turn={turn}
      players={trip.players}
      categoryName={categoryLabel(collection, turn.question.category)}
      onAnswer={answer}
    />
  )
}

interface GameScreenProps {
  theme: string
  back: Route
  position: string // "Soru 4 / 12"
  progress: [number, number]
  timer?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

/** The round's own frame: leave on the left, where the round is in the middle, the time left on the right. */
function GameScreen({ theme, back, position, progress, timer, footer, children }: GameScreenProps) {
  return (
    <div className={`${styles.screen} ${theme}`}>
      <header className={styles.bar}>
        <IconLink to={back} label="Turdan çık">
          <CloseIcon />
        </IconLink>
        <h1 className={styles.position}>{position}</h1>
        <span className={styles.timer}>{timer}</span>
      </header>
      <div className={styles.progress}>
        <ProgressBar value={progress[0]} max={progress[1]} tone="teal" label="Tur" />
      </div>
      <main className={styles.content}>{children}</main>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}

interface QuestionPhaseProps {
  theme: string
  back: Route
  position: string
  round: CurrentRound
  turn: RoundTurn
  players: Player[]
  categoryName: string
  onAnswer: (choice: number | null) => void
}

function QuestionPhase({ theme, back, position, round, turn, players, categoryName, onAnswer }: QuestionPhaseProps) {
  // A tap and the timer running out can land together; only the first one counts.
  const answered = useRef(false)
  const choose = (choice: number | null) => {
    if (answered.current) return
    answered.current = true
    onAnswer(choice)
  }
  const { question } = turn

  return (
    <GameScreen
      theme={theme}
      back={back}
      position={position}
      progress={[round.answers.length + 1, round.turns.length]}
      timer={round.settings.timeLimit > 0 && <Countdown seconds={round.settings.timeLimit} onExpire={() => choose(null)} />}
    >
      <PlayerRow players={players} playerId={turn.playerId} points={roundPoints(round)} />
      <QuestionCard turn={turn} categoryName={categoryName} />
      <ol className={styles.options}>
        {turn.optionOrder.map((optionIndex, position) => (
          <li key={optionIndex}>
            <button type="button" className={styles.option} onClick={() => choose(position)}>
              <span className={styles.letter}>{OPTION_LETTERS[position]}</span>
              <span className={styles.optionText}>{question.options[optionIndex]}</span>
            </button>
          </li>
        ))}
      </ol>
    </GameScreen>
  )
}


/** Whose turn it is, how the others stand in this round, and the player's own points. */
function PlayerRow({ players, playerId, points }: { players: Player[]; playerId: string; points: Record<string, number> }) {
  const me = players.find((player) => player.id === playerId)
  const name = me?.nickname ?? '?'
  const where = locative(name)
  const others = players
    .filter((player) => player.id !== playerId)
    .map((player) => `${player.nickname} ${points[player.id] ?? 0}`)
    .join(' · ')

  return (
    <div className={styles.playerRow}>
      <Avatar name={name} />
      <span className={styles.who}>
        <strong>{where ? `Sıra ${where}` : `Sıra: ${name}`}</strong>
        {others && <span className={styles.others}>{others}</span>}
      </span>
      <span className={styles.myPoints}>{points[playerId] ?? 0} puan</span>
    </div>
  )
}

function QuestionCard({ turn, categoryName }: { turn: RoundTurn; categoryName: string }) {
  const { question } = turn
  return (
    <section className={styles.card}>
      <div className={styles.cardMeta}>
        <span className={styles.category}>{categoryName}</span>
        <span>
          {DIFFICULTY_LABELS[question.difficulty]} · {DIFFICULTY_POINTS[question.difficulty]} puan
        </span>
      </div>
      <h2 className={styles.question}>{question.text}</h2>
    </section>
  )
}

/** After the answer: the right option in green, a wrong pick in coral, the rest stepping back. */
function Options({ turn, answer }: { turn: RoundTurn; answer: TurnAnswer }) {
  const { question } = turn
  return (
    <ol className={styles.options}>
      {turn.optionOrder.map((optionIndex, position) => {
        const right = optionIndex === question.answerIndex
        const picked = position === answer.choice
        const state = right ? styles.right : picked ? styles.wrong : styles.faded
        return (
          <li key={optionIndex}>
            <div className={`${styles.option} ${state}`}>
              <span className={styles.letter}>{OPTION_LETTERS[position]}</span>
              <span className={styles.optionText}>{question.options[optionIndex]}</span>
              {right && <CheckIcon size={20} strokeWidth={2.6} />}
              {picked && !right && <CloseIcon size={18} strokeWidth={2.4} />}
              <span className={text.visuallyHidden}>{right ? ' (doğru cevap)' : picked ? ' (seçilen, yanlış)' : ''}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function Verdict({ turn, answer }: { turn: RoundTurn; answer: TurnAnswer }) {
  const { question } = turn
  const correct = isCorrectChoice(question, turn.optionOrder, answer.choice)
  const verdict = correct ? `Doğru! +${answer.points} puan` : answer.choice === null ? 'Süre doldu' : 'Yanlış'
  return (
    <section className={styles.verdict} role="status">
      <strong className={correct ? styles.verdictRight : styles.verdictWrong}>{verdict}</strong>
      <p>{question.explanation}</p>
    </section>
  )
}
