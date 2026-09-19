import type { Category, Difficulty, Question } from '../packs/types.ts'
import type { Rng } from './random.ts'

/** Deterministic Rng (mulberry32) so shuffles in tests repeat exactly. */
export function seededRng(seed: number): Rng {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function makeQuestion(id: string, overrides: Partial<Question> = {}): Question {
  return {
    id,
    category: 'history',
    difficulty: 'easy',
    text: `Soru ${id}`,
    options: ['A', 'B', 'C', 'D'],
    answerIndex: 0,
    explanation: 'Açıklama',
    ...overrides,
  }
}

/** `count` questions with ids like "history-easy-1". */
export function makeQuestions(count: number, category: Category, difficulty: Difficulty): Question[] {
  return Array.from({ length: count }, (_, i) =>
    makeQuestion(`${category}-${difficulty}-${i + 1}`, { category, difficulty }),
  )
}
