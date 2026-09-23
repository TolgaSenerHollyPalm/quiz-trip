import type { Pack } from '../packs/types.ts'
import { settlePredictions } from './predictions.ts'
import { buildRound } from './quiz.ts'
import type { Rng } from './random.ts'
import { turnPoints } from './scoring.ts'
import type { Player, QuizSettings, TripState } from './types.ts'

export function newTrip(id: string, name: string, packId?: string): TripState {
  return {
    id,
    name,
    ...(packId && { packId }),
    checklist: [],
    players: [],
    params: {},
    askedQuestionIds: [],
    rounds: [],
    predictions: [],
  }
}

export function startRound(
  trip: TripState,
  pack: Pack,
  settings: QuizSettings,
  round: { id: string; startedAt: string },
  rng: Rng,
): TripState {
  const turns = buildRound({
    questions: pack.questions,
    settings,
    playerIds: trip.players.map((player) => player.id),
    askedQuestionIds: trip.askedQuestionIds,
    roundsPlayed: trip.rounds.length,
    rng,
  })
  return { ...trip, quizSettings: settings, currentRound: { ...round, settings, turns, answers: [] } }
}

/** Records the answer for the current turn. The last answer closes the round and adds it to the trip's scores. */
export function answerTurn(trip: TripState, choice: number | null, playedAt: string): TripState {
  const round = trip.currentRound
  const turn = round?.turns[round.answers.length]
  if (!round || !turn) return trip

  const answers = [...round.answers, { choice, points: turnPoints(turn.question, turn.optionOrder, choice) }]
  const askedQuestionIds = [
    ...trip.askedQuestionIds.filter((id) => id !== turn.question.id),
    turn.question.id,
  ]
  if (answers.length < round.turns.length) {
    return { ...trip, askedQuestionIds, currentRound: { ...round, answers } }
  }

  const scores: Record<string, number> = {}
  round.turns.forEach(({ playerId }, index) => {
    scores[playerId] = (scores[playerId] ?? 0) + answers[index].points
  })
  return {
    ...trip,
    askedQuestionIds,
    rounds: [...trip.rounds, { id: round.id, playedAt, scores }],
    currentRound: undefined,
  }
}

/** Drops the unfinished round and its points. Questions already shown stay marked as asked. */
export function cancelRound(trip: TripState): TripState {
  return { ...trip, currentRound: undefined }
}

/** Players who have quiz points or predictions that would be lost if they were removed. */
export function playersWithData(trip: TripState): Set<string> {
  const ids = new Set<string>()
  for (const round of trip.rounds) for (const id of Object.keys(round.scores)) ids.add(id)
  for (const prediction of trip.predictions) for (const id of Object.keys(prediction.guesses)) ids.add(id)
  return ids
}

/** Saves a new player list. Removed players lose their quiz points and predictions everywhere. */
export function updatePlayers(trip: TripState, players: Player[]): TripState {
  const keep = new Set(players.map((player) => player.id))
  const onlyKept = <T,>(record: Record<string, T>) =>
    Object.fromEntries(Object.entries(record).filter(([playerId]) => keep.has(playerId)))

  const rounds = trip.rounds
    .map((round) => ({ ...round, scores: onlyKept(round.scores) }))
    .filter((round) => Object.keys(round.scores).length > 0)
  // An open prediction may now have every guess it needs; a resolved one may have a new closest player.
  const predictions = settlePredictions(
    trip.predictions.map((prediction) => ({
      ...prediction,
      guesses: onlyKept(prediction.guesses),
      ...(prediction.points && { points: onlyKept(prediction.points) }),
    })),
    players,
  )
  // A round in progress cannot go on without one of its players.
  const currentRound = trip.currentRound?.turns.every((turn) => keep.has(turn.playerId))
    ? trip.currentRound
    : undefined

  return { ...trip, players, rounds, predictions, currentRound }
}
