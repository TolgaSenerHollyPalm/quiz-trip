import type { Difficulty, Question } from '../packs/types.ts'
import type { QuizRound } from './types.ts'

export const DIFFICULTY_POINTS: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 }

/** Whether the option shown at on-screen position `choice` is the right answer. */
export function isCorrectChoice(
  question: Question,
  optionOrder: readonly number[],
  choice: number | null,
): boolean {
  return choice !== null && optionOrder[choice] === question.answerIndex
}

/** A right answer earns the question's difficulty points; a wrong answer or running out of time earns 0. */
export function turnPoints(question: Question, optionOrder: readonly number[], choice: number | null): number {
  return isCorrectChoice(question, optionOrder, choice) ? DIFFICULTY_POINTS[question.difficulty] : 0
}

/** Each player's points summed over all finished quiz rounds. */
export function quizTotals(rounds: readonly QuizRound[]): Record<string, number> {
  const totals: Record<string, number> = {}
  for (const round of rounds) {
    for (const [playerId, points] of Object.entries(round.scores)) {
      totals[playerId] = (totals[playerId] ?? 0) + points
    }
  }
  return totals
}

export interface Standing {
  playerId: string
  points: number
  rank: number
}

/** Highest points first. Tied players share a rank (1, 1, 3) and keep their seating order: ties are never broken. */
export function rankPlayers(playerIds: readonly string[], points: Readonly<Record<string, number>>): Standing[] {
  const rows = playerIds.map((playerId) => ({ playerId, points: points[playerId] ?? 0 }))
  return [...rows]
    .sort((a, b) => b.points - a.points)
    .map((row) => ({ ...row, rank: 1 + rows.filter((other) => other.points > row.points).length }))
}
