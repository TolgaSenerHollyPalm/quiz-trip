import { describe, expect, it } from 'vitest'
import { quizTotals, rankPlayers, turnPoints } from './scoring.ts'
import { makeQuestion } from './test-helpers.ts'
import type { QuizRound } from './types.ts'

describe('turnPoints', () => {
  // The right answer is options[2]. Shown in the order 3, 2, 0, 1, it sits at on-screen position 1.
  const optionOrder = [3, 2, 0, 1]

  it.each([
    ['easy', 1],
    ['medium', 2],
    ['hard', 3],
  ] as const)('gives a right answer to a %s question %i point(s)', (difficulty, points) => {
    const question = makeQuestion('q', { difficulty, answerIndex: 2 })
    expect(turnPoints(question, optionOrder, 1)).toBe(points)
  })

  it('gives 0 for a wrong answer', () => {
    const question = makeQuestion('q', { difficulty: 'hard', answerIndex: 2 })
    expect(turnPoints(question, optionOrder, 2)).toBe(0)
  })

  it('gives 0 when time runs out', () => {
    const question = makeQuestion('q', { difficulty: 'hard', answerIndex: 2 })
    expect(turnPoints(question, optionOrder, null)).toBe(0)
  })
})

describe('rankPlayers', () => {
  it('puts the highest points first and keeps ties as ties', () => {
    expect(rankPlayers(['a', 'b', 'c', 'd'], { a: 2, b: 5, c: 5, d: 1 })).toEqual([
      { playerId: 'b', points: 5, rank: 1 },
      { playerId: 'c', points: 5, rank: 1 },
      { playerId: 'a', points: 2, rank: 3 },
      { playerId: 'd', points: 1, rank: 4 },
    ])
  })

  it('gives everyone first place when all are tied', () => {
    expect(rankPlayers(['a', 'b'], { a: 4, b: 4 }).map((standing) => standing.rank)).toEqual([1, 1])
  })

  it('counts a player without points as 0', () => {
    expect(rankPlayers(['a', 'b'], { a: 1 })).toEqual([
      { playerId: 'a', points: 1, rank: 1 },
      { playerId: 'b', points: 0, rank: 2 },
    ])
  })
})

describe('quizTotals', () => {
  it('adds up the points of every round', () => {
    const rounds: QuizRound[] = [
      { id: 'r1', playedAt: '', scores: { a: 3, b: 1 } },
      { id: 'r2', playedAt: '', scores: { a: 2, c: 4 } },
    ]
    expect(quizTotals(rounds)).toEqual({ a: 5, b: 1, c: 4 })
  })
})
