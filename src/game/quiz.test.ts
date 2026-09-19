import { describe, expect, it } from 'vitest'
import type { Question } from '../packs/types.ts'
import { buildRound, type RoundInput } from './quiz.ts'
import { makeQuestions, seededRng } from './test-helpers.ts'
import type { QuizSettings, RoundTurn } from './types.ts'

const settings = (overrides: Partial<QuizSettings> = {}): QuizSettings => ({
  categories: ['history'],
  difficulty: 'mixed',
  questionsPerPlayer: 3,
  timeLimit: 0,
  ...overrides,
})

const deal = (questions: Question[], overrides: Partial<RoundInput> = {}) =>
  buildRound({
    questions,
    settings: settings(),
    playerIds: ['a', 'b', 'c'],
    askedQuestionIds: [],
    roundsPlayed: 0,
    rng: seededRng(1),
    ...overrides,
  })

const ids = (turns: RoundTurn[]) => turns.map((turn) => turn.question.id)

describe('buildRound', () => {
  const easy = makeQuestions(10, 'history', 'easy')
  const medium = makeQuestions(10, 'history', 'medium')
  const hard = makeQuestions(10, 'history', 'hard')
  const all = [...easy, ...medium, ...hard]

  it('gives every player the same number of questions, one turn each in seat order', () => {
    expect(deal(all).map((turn) => turn.playerId)).toEqual(['a', 'b', 'c', 'a', 'b', 'c', 'a', 'b', 'c'])
  })

  it('moves the first seat on by one every round', () => {
    expect(deal(all, { roundsPlayed: 1 }).slice(0, 3).map((turn) => turn.playerId)).toEqual(['b', 'c', 'a'])
    expect(deal(all, { roundsPlayed: 5 }).slice(0, 3).map((turn) => turn.playerId)).toEqual(['c', 'a', 'b'])
  })

  it('never repeats a question within a round while there are enough', () => {
    const turns = deal(all, { settings: settings({ questionsPerPlayer: 9 }) })
    expect(turns).toHaveLength(27)
    expect(new Set(ids(turns)).size).toBe(27)
  })

  it('keeps each question number at one difficulty even when that forces a repeat', () => {
    // Ten questions per difficulty cannot fill ten question numbers of three players without one running short.
    const turns = deal(all, { settings: settings({ questionsPerPlayer: 10 }) })
    for (let slot = 0; slot < 10; slot++) {
      const levels = turns.slice(slot * 3, slot * 3 + 3).map((turn) => turn.question.difficulty)
      expect(new Set(levels).size).toBe(1)
    }
    expect(new Set(ids(turns)).size).toBe(28)
  })

  it('only uses the chosen categories and difficulty', () => {
    const food = makeQuestions(10, 'food', 'medium')
    const turns = deal([...all, ...food], { settings: settings({ categories: ['food'], difficulty: 'medium' }) })
    expect(turns.every((turn) => turn.question.category === 'food')).toBe(true)
    expect(turns.every((turn) => turn.question.difficulty === 'medium')).toBe(true)
  })

  it('asks questions never asked on this trip before any asked ones', () => {
    const asked = easy.slice(0, 7).map((question) => question.id)
    const turns = deal(easy, {
      settings: settings({ difficulty: 'easy', questionsPerPlayer: 1 }),
      askedQuestionIds: asked,
    })
    expect(ids(turns).sort()).toEqual(['history-easy-10', 'history-easy-8', 'history-easy-9'])
  })

  it('brings back the questions asked longest ago once every question has been asked', () => {
    const asked = [5, 3, 1, 2, 4, 6, 7, 8, 9, 10].map((n) => `history-easy-${n}`) // oldest first
    const turns = deal(easy, {
      settings: settings({ difficulty: 'easy', questionsPerPlayer: 1 }),
      askedQuestionIds: asked,
    })
    expect(ids(turns).sort()).toEqual(['history-easy-1', 'history-easy-3', 'history-easy-5'])
  })

  it('repeats questions evenly within the round when there are not enough', () => {
    const two = easy.slice(0, 2)
    const turns = deal(two, { settings: settings({ difficulty: 'easy', questionsPerPlayer: 2 }) })
    expect(turns).toHaveLength(6)
    const uses = ids(turns).reduce<Record<string, number>>((count, id) => ({ ...count, [id]: (count[id] ?? 0) + 1 }), {})
    expect(uses).toEqual({ 'history-easy-1': 3, 'history-easy-2': 3 })
  })

  it('gives every player the same difficulty for the same question number in a mixed round', () => {
    const turns = deal(all)
    for (let slot = 0; slot < 3; slot++) {
      const levels = turns.slice(slot * 3, slot * 3 + 3).map((turn) => turn.question.difficulty)
      expect(new Set(levels).size).toBe(1)
    }
    // With plenty of every difficulty, three questions each means one of each.
    for (const player of ['a', 'b', 'c']) {
      const levels = turns.filter((turn) => turn.playerId === player).map((turn) => turn.question.difficulty)
      expect(levels.sort()).toEqual(['easy', 'hard', 'medium'])
    }
  })

  it('skips a difficulty in a mixed round when it cannot give every player a question', () => {
    const turns = deal([...easy, ...medium, hard[0]])
    expect(turns.some((turn) => turn.question.difficulty === 'hard')).toBe(false)
    expect(new Set(ids(turns)).size).toBe(9)
  })

  it('shows the four options in a shuffled order', () => {
    const turns = deal(all, { settings: settings({ questionsPerPlayer: 10 }) })
    for (const turn of turns) expect([...turn.optionOrder].sort()).toEqual([0, 1, 2, 3])
    expect(turns.some((turn) => turn.optionOrder.join() !== '0,1,2,3')).toBe(true)
  })

  it('deals nothing when no question matches', () => {
    expect(deal(all, { settings: settings({ categories: ['food'] }) })).toEqual([])
  })
})
