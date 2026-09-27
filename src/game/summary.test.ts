import { describe, expect, it } from 'vitest'
import { scoreSummary, tripTotals } from './summary.ts'
import type { Prediction, TripState } from './types.ts'

const players = [
  { id: 't', nickname: 'Tolga' },
  { id: 'd', nickname: 'Deniz' },
]
const trip = (rounds: TripState['rounds'], predictions: Prediction[] = []) => ({ players, rounds, predictions })

describe('scoreSummary', () => {
  it('says nothing has been played before the first round', () => {
    expect(scoreSummary(trip([]))).toBe('Henüz oynanmadı')
    expect(scoreSummary({ players: [], rounds: [], predictions: [] })).toBe('Henüz oynanmadı')
  })

  it('names the leader and their points', () => {
    expect(scoreSummary(trip([{ id: 'r1', playedAt: '2026-10-15T10:00:00Z', scores: { t: 6, d: 14 } }]))).toBe(
      'Deniz önde · 14 puan',
    )
  })

  it('calls a shared lead a tie', () => {
    expect(scoreSummary(trip([{ id: 'r1', playedAt: '2026-10-15T10:00:00Z', scores: { t: 5, d: 5 } }]))).toBe('Berabere')
  })

  it('counts a settled prediction as having played', () => {
    const settled: Prediction = {
      id: 'p1',
      text: 'Kaç?',
      type: 'number',
      status: 'resolved',
      guesses: { t: 3, d: 9 },
      result: 3,
      points: { t: 3 },
    }
    expect(tripTotals(trip([], [settled]))).toEqual({ t: 3, d: 0 })
    expect(scoreSummary(trip([], [settled]))).toBe('Tolga önde · 3 puan')
  })
})
