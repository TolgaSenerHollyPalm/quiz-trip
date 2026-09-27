import { predictionTotals } from './predictions.ts'
import { quizTotals, rankPlayers } from './scoring.ts'
import type { TripState } from './types.ts'

type Scored = Pick<TripState, 'players' | 'rounds' | 'predictions'>

/** Every player's points: quiz rounds and settled predictions together, as the scoreboard counts them. */
export function tripTotals(trip: Scored): Record<string, number> {
  const quiz = quizTotals(trip.rounds)
  const predictions = predictionTotals(trip.predictions)
  return Object.fromEntries(trip.players.map((player) => [player.id, (quiz[player.id] ?? 0) + (predictions[player.id] ?? 0)]))
}

/** One line for the trip screen: who leads and with how many points, a tie, or that nothing has been played. */
export function scoreSummary(trip: Scored): string {
  const played = trip.rounds.length > 0 || trip.predictions.some((prediction) => prediction.status === 'resolved')
  if (!played || trip.players.length === 0) return 'Henüz oynanmadı'
  const leaders = rankPlayers(
    trip.players.map((player) => player.id),
    tripTotals(trip),
  ).filter((standing) => standing.rank === 1)
  if (leaders.length > 1) return 'Berabere'
  const name = trip.players.find((player) => player.id === leaders[0].playerId)?.nickname
  return `${name} önde · ${leaders[0].points} puan`
}
