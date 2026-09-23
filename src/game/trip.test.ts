import { describe, expect, it } from 'vitest'
import type { Pack } from '../packs/types.ts'
import { DIFFICULTY_POINTS } from './scoring.ts'
import { makeQuestions, seededRng } from './test-helpers.ts'
import { answerTurn, cancelRound, newTrip, playersWithData, startRound, updatePlayers } from './trip.ts'
import type { TripState } from './types.ts'

const pack: Pack = {
  schemaVersion: 1,
  id: 'test',
  title: 'Test',
  country: 'EG',
  city: 'Test',
  version: 1,
  updatedAt: '2026-09-19',
  questions: [...makeQuestions(6, 'history', 'easy'), ...makeQuestions(6, 'history', 'hard')],
  predictionTemplates: [],
}

const PLAYED_AT = '2026-09-19T10:05:00Z'

function started(): TripState {
  const trip = {
    ...newTrip('test', 'Test gezisi'),
    players: [
      { id: 'a', nickname: 'Ali' },
      { id: 'b', nickname: 'Can' },
    ],
  }
  const settings = { categories: ['history' as const], difficulty: 'mixed' as const, questionsPerPlayer: 2, timeLimit: 0 as const }
  return startRound(trip, pack, settings, { id: 'r1', startedAt: '2026-09-19T10:00:00Z' }, seededRng(7))
}

/** Answers the current turn right or wrong. */
function answer(trip: TripState, right: boolean): TripState {
  const round = trip.currentRound!
  const turn = round.turns[round.answers.length]
  const rightPosition = turn.optionOrder.indexOf(turn.question.answerIndex)
  return answerTurn(trip, right ? rightPosition : (rightPosition + 1) % 4, PLAYED_AT)
}

describe('a quiz round', () => {
  it('deals the turns and remembers the settings for next time', () => {
    const trip = started()
    expect(trip.currentRound?.turns.map((turn) => turn.playerId)).toEqual(['a', 'b', 'a', 'b'])
    expect(trip.currentRound?.answers).toEqual([])
    expect(trip.quizSettings?.questionsPerPlayer).toBe(2)
  })

  it('marks each answered question as asked, moving a repeated one to the end', () => {
    const base = started()
    const firstId = base.currentRound!.turns[0].question.id
    const trip = answer({ ...base, askedQuestionIds: [firstId, 'older'] }, true)
    expect(trip.askedQuestionIds).toEqual(['older', firstId])
  })

  it('adds up each player’s points and closes the round after the last answer', () => {
    let trip = started()
    const turns = trip.currentRound!.turns
    const points = (index: number) => DIFFICULTY_POINTS[turns[index].question.difficulty]
    for (const right of [true, false, true, true]) trip = answer(trip, right)

    expect(trip.currentRound).toBeUndefined()
    expect(trip.rounds).toEqual([{ id: 'r1', playedAt: PLAYED_AT, scores: { a: points(0) + points(2), b: points(3) } }])
  })

  it('keeps a player who scored nothing in the round with 0 points', () => {
    let trip = started()
    for (const right of [true, false, true, false]) trip = answer(trip, right)
    expect(trip.rounds[0].scores.b).toBe(0)
  })

  it('treats running out of time as a wrong answer', () => {
    const trip = answerTurn(started(), null, PLAYED_AT)
    expect(trip.currentRound?.answers).toEqual([{ choice: null, points: 0 }])
  })

  it('throws away the points of a cancelled round but keeps its questions as asked', () => {
    const trip = cancelRound(answer(started(), true))
    expect(trip.currentRound).toBeUndefined()
    expect(trip.rounds).toEqual([])
    expect(trip.askedQuestionIds).toHaveLength(1)
  })
})

describe('updatePlayers', () => {
  const trip: TripState = {
    ...newTrip('test', 'Test gezisi'),
    players: [
      { id: 'a', nickname: 'Ali' },
      { id: 'b', nickname: 'Can' },
    ],
    rounds: [
      { id: 'r1', playedAt: '', scores: { a: 3, b: 2 } },
      { id: 'r2', playedAt: '', scores: { b: 1 } },
    ],
    predictions: [
      {
        id: 'p1',
        text: 'Kaç?',
        type: 'number',
        status: 'resolved',
        guesses: { a: 4, b: 5 },
        result: 5,
        points: { a: 0, b: 3 },
      },
    ],
  }

  it('keeps all points when players are only renamed', () => {
    const renamed = updatePlayers(trip, [
      { id: 'a', nickname: 'Ayşe' },
      { id: 'b', nickname: 'Can' },
    ])
    expect(renamed.players[0].nickname).toBe('Ayşe')
    expect(renamed.rounds).toEqual(trip.rounds)
    expect(renamed.predictions).toEqual(trip.predictions)
  })

  it('removes a deleted player’s points and predictions everywhere', () => {
    const updated = updatePlayers(trip, [{ id: 'a', nickname: 'Ali' }])
    // r2 only had the deleted player, so it goes too.
    expect(updated.rounds).toEqual([{ id: 'r1', playedAt: '', scores: { a: 3 } }])
    expect(updated.predictions[0].guesses).toEqual({ a: 4 })
    // With the exact guess gone, the remaining guess is now the closest one.
    expect(updated.predictions[0].points).toEqual({ a: 1 })
  })

  it('knows which players have points or predictions to lose', () => {
    expect(playersWithData(trip)).toEqual(new Set(['a', 'b']))
    expect(playersWithData(newTrip('test', 'Test gezisi'))).toEqual(new Set())
  })

  it('cancels a round in progress only when one of its players is removed', () => {
    const inRound = started()
    expect(updatePlayers(inRound, [{ id: 'a', nickname: 'Ali' }]).currentRound).toBeUndefined()
    const withNewPlayer = updatePlayers(inRound, [...inRound.players, { id: 'c', nickname: 'Deniz' }])
    expect(withNewPlayer.currentRound).toEqual(inRound.currentRound)
  })
})
