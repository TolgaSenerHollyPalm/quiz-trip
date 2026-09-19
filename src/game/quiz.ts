import { DIFFICULTIES, type Difficulty, type Question } from '../packs/types.ts'
import { shuffle, type Rng } from './random.ts'
import type { QuizSettings, RoundTurn } from './types.ts'

export const MIN_PLAYERS = 1
export const MAX_PLAYERS = 8
export const MAX_QUESTIONS_PER_PLAYER = 10

/** Questions that match the chosen categories and difficulty. */
export function questionPool(questions: readonly Question[], settings: QuizSettings): Question[] {
  return questions.filter(
    (question) =>
      settings.categories.includes(question.category) &&
      (settings.difficulty === 'mixed' || question.difficulty === settings.difficulty),
  )
}

export interface RoundInput {
  questions: readonly Question[]
  settings: QuizSettings
  playerIds: readonly string[] // seating order
  askedQuestionIds: readonly string[] // oldest first
  roundsPlayed: number
  rng: Rng
}

/**
 * Deals the questions for one round. Players answer one question each in turn, and the first seat moves on by
 * one every round. Everyone gets the same number of questions and, question by question, the same difficulty,
 * so the 1/2/3 points stay fair in a mixed round. Questions never asked on this trip come first, then the ones
 * asked longest ago; a question repeats within the round only when the chosen questions run out.
 */
export function buildRound({
  questions,
  settings,
  playerIds,
  askedQuestionIds,
  roundsPlayed,
  rng,
}: RoundInput): RoundTurn[] {
  const pool = questionPool(questions, settings)
  if (pool.length === 0 || playerIds.length === 0) return []

  const first = roundsPlayed % playerIds.length
  const seats = [...playerIds.slice(first), ...playerIds.slice(0, first)]
  const askedAt = new Map(askedQuestionIds.map((id, index) => [id, index]))
  const timesUsed = new Map<string, number>()
  const levels = shuffle(
    DIFFICULTIES.filter((level) => pool.some((question) => question.difficulty === level)),
    rng,
  )
  const unused = (level: Difficulty) =>
    pool.filter((question) => question.difficulty === level && !timesUsed.has(question.id))
  const neverAsked = (level: Difficulty) => unused(level).filter((question) => !askedAt.has(question.id))

  const turns: RoundTurn[] = []
  for (let slot = 0; slot < settings.questionsPerPlayer; slot++) {
    // Cycle through the difficulties, but skip one that cannot give every player a question it still has.
    const cycle = levels.map((_, i) => levels[(slot + i) % levels.length])
    const level =
      cycle.find((candidate) => neverAsked(candidate).length >= seats.length) ??
      cycle.find((candidate) => unused(candidate).length >= seats.length) ??
      cycle.reduce((best, candidate) => (unused(candidate).length > unused(best).length ? candidate : best))

    // Least used this round first, then never asked, then asked longest ago; random among equals.
    const ranked = shuffle(
      pool.filter((question) => question.difficulty === level),
      rng,
    ).sort(
      (a, b) =>
        (timesUsed.get(a.id) ?? 0) - (timesUsed.get(b.id) ?? 0) ||
        (askedAt.get(a.id) ?? -1) - (askedAt.get(b.id) ?? -1),
    )
    seats.forEach((playerId, seat) => {
      const question = ranked[seat % ranked.length]
      timesUsed.set(question.id, (timesUsed.get(question.id) ?? 0) + 1)
      turns.push({ playerId, question, optionOrder: shuffle([0, 1, 2, 3], rng) })
    })
  }
  return turns
}
