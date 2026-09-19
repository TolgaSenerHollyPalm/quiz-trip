import { describe, expect, it } from 'vitest'
import type { PredictionTemplate } from '../packs/types.ts'
import {
  addPrediction,
  customPrediction,
  customPredictionProblems,
  deletePrediction,
  describeBounds,
  formatAnswer,
  guessProblem,
  missingParams,
  predictionFromTemplate,
  predictionTotals,
  scorePrediction,
  setResult,
  submitGuess,
} from './predictions.ts'
import { newTrip, updatePlayers } from './trip.ts'
import type { Prediction, TripState } from './types.ts'

const numberPrediction = (overrides: Partial<Prediction> = {}): Prediction => ({
  id: 'p1',
  text: 'Kaç?',
  type: 'number',
  status: 'open',
  guesses: {},
  ...overrides,
})

const choicePrediction = (overrides: Partial<Prediction> = {}): Prediction =>
  numberPrediction({ type: 'choice', options: ['Deniz', 'Havuz', 'Bahçe', 'Diğer'], ...overrides })

const players = [
  { id: 'a', nickname: 'Ayşe' },
  { id: 'b', nickname: 'Mehmet' },
  { id: 'c', nickname: 'Zeynep' },
]

const tripWith = (prediction: Prediction): TripState => ({ ...newTrip('test'), players, predictions: [prediction] })

describe('scorePrediction', () => {
  it('gives the closest guess 1 point', () => {
    const points = scorePrediction(numberPrediction({ guesses: { a: 5, b: 8, c: 12 }, result: 9 }))
    expect(points).toEqual({ a: 0, b: 1, c: 0 })
  })

  it('gives an exact guess 3 points and a near miss nothing', () => {
    const points = scorePrediction(numberPrediction({ guesses: { a: 9, b: 10, c: 2 }, result: 9 }))
    expect(points).toEqual({ a: 3, b: 0, c: 0 })
  })

  it('gives every player at the same distance the point', () => {
    const points = scorePrediction(numberPrediction({ guesses: { a: 7, b: 11, c: 20 }, result: 9 }))
    expect(points).toEqual({ a: 1, b: 1, c: 0 })
  })

  it('gives every exact guess 3 points', () => {
    const points = scorePrediction(numberPrediction({ guesses: { a: 9, b: 9, c: 8 }, result: 9 }))
    expect(points).toEqual({ a: 3, b: 3, c: 0 })
  })

  it('treats decimal guesses at the same distance as equal', () => {
    const points = scorePrediction(numberPrediction({ guesses: { a: 0.1, b: 0.3 }, result: 0.2 }))
    expect(points).toEqual({ a: 1, b: 1 })
  })

  it('gives the right option 1 point in a choice prediction', () => {
    const points = scorePrediction(choicePrediction({ guesses: { a: 0, b: 2, c: 0 }, result: 0 }))
    expect(points).toEqual({ a: 1, b: 0, c: 1 })
  })

  it('gives nothing before the result is known', () => {
    expect(scorePrediction(numberPrediction({ guesses: { a: 1 } }))).toEqual({})
  })
})

describe('guessProblem', () => {
  const floor = numberPrediction({ min: 1, max: 12, step: 1, unit: 'kat' })

  it('accepts values inside the range, including both ends', () => {
    for (const value of [1, 6, 12]) expect(guessProblem(floor, value)).toBeUndefined()
  })

  it('rejects values outside the range', () => {
    expect(guessProblem(floor, 0)).toBe('1 ile 12 arasında bir değer gir.')
    expect(guessProblem(floor, 13)).toBe('1 ile 12 arasında bir değer gir.')
    expect(guessProblem(numberPrediction({ min: 0 }), -1)).toBe('En az 0 olabilir.')
    expect(guessProblem(numberPrediction({ max: 40 }), 41)).toBe('En çok 40 olabilir.')
  })

  it('rejects values between the steps', () => {
    expect(guessProblem(floor, 2.5)).toBe('Tam sayı gir.')
    const steps = numberPrediction({ min: 0, max: 50000, step: 100 })
    expect(guessProblem(steps, 12300)).toBeUndefined()
    expect(guessProblem(steps, 12350)).toBe('Geçerli değerler: 0 / 100 / 200 …')
    const luggage = numberPrediction({ min: 5, max: 40, step: 0.5 })
    expect(guessProblem(luggage, 23.5)).toBeUndefined()
    expect(guessProblem(luggage, 23.3)).toBe('Geçerli değerler: 5 / 5,5 / 6 …')
  })

  it('shows duration limits as HH:MM', () => {
    const delay = numberPrediction({ format: 'duration', min: 0, max: 600, step: 1 })
    expect(guessProblem(delay, 601)).toBe('00:00 ile 10:00 arasında bir değer gir.')
  })

  it('rejects something that is not a number or not an option', () => {
    expect(guessProblem(floor, Number.NaN)).toBe('Bir sayı gir.')
    expect(guessProblem(choicePrediction(), 4)).toBe('Bir seçenek seç.')
    expect(guessProblem(choicePrediction(), 3)).toBeUndefined()
  })
})

describe('entering guesses', () => {
  it('stays open until every player has guessed, then locks', () => {
    let trip = tripWith(numberPrediction({ min: 1, max: 12 }))
    trip = submitGuess(trip, 'p1', 'a', 3)
    trip = submitGuess(trip, 'p1', 'b', 7)
    expect(trip.predictions[0].status).toBe('open')
    trip = submitGuess(trip, 'p1', 'c', 12)
    expect(trip.predictions[0]).toMatchObject({ status: 'locked', guesses: { a: 3, b: 7, c: 12 } })
  })

  it('lets a player change their guess before the lock but not after', () => {
    let trip = tripWith(numberPrediction())
    trip = submitGuess(trip, 'p1', 'a', 3)
    trip = submitGuess(trip, 'p1', 'a', 4)
    expect(trip.predictions[0].guesses.a).toBe(4)
    trip = submitGuess(submitGuess(trip, 'p1', 'b', 5), 'p1', 'c', 6)
    expect(submitGuess(trip, 'p1', 'a', 9).predictions[0].guesses.a).toBe(4)
  })

  it('never saves a guess outside the range', () => {
    const trip = submitGuess(tripWith(numberPrediction({ min: 1, max: 12 })), 'p1', 'a', 13)
    expect(trip.predictions[0].guesses).toEqual({})
  })
})

describe('results', () => {
  const locked = () => {
    let trip = tripWith(numberPrediction({ min: 0, max: 100 }))
    for (const [player, value] of [['a', 10], ['b', 20], ['c', 40]] as const) trip = submitGuess(trip, 'p1', player, value)
    return trip
  }

  it('cannot be entered while guesses are missing', () => {
    const trip = submitGuess(tripWith(numberPrediction()), 'p1', 'a', 1)
    const prediction = setResult(trip, 'p1', 5).predictions[0]
    expect(prediction.status).toBe('open')
    expect(prediction.result).toBeUndefined()
  })

  it('resolves the prediction and scores it', () => {
    const trip = setResult(locked(), 'p1', 21)
    expect(trip.predictions[0]).toMatchObject({ status: 'resolved', result: 21, points: { a: 0, b: 1, c: 0 } })
  })

  it('works the points out again when the result is corrected', () => {
    const trip = setResult(setResult(locked(), 'p1', 21), 'p1', 40)
    expect(trip.predictions[0].points).toEqual({ a: 0, b: 0, c: 3 })
  })

  it('may lie outside the guessing range', () => {
    expect(setResult(locked(), 'p1', 700).predictions[0].points).toEqual({ a: 0, b: 0, c: 1 })
  })

  it('count towards each player’s prediction total', () => {
    const second = numberPrediction({ id: 'p2', status: 'resolved', guesses: {}, points: { a: 3, b: 0 } })
    const trip = addPrediction(setResult(locked(), 'p1', 21), second)
    expect(predictionTotals(trip.predictions)).toEqual({ a: 3, b: 1, c: 0 })
  })
})

describe('changing players', () => {
  it('locks an open prediction when the only player still missing is removed', () => {
    let trip = tripWith(numberPrediction())
    trip = submitGuess(submitGuess(trip, 'p1', 'a', 1), 'p1', 'b', 2)
    const updated = updatePlayers(trip, players.slice(0, 2))
    expect(updated.predictions[0].status).toBe('locked')
  })

  it('keeps an open prediction open until a new player has guessed too', () => {
    let trip = tripWith(numberPrediction())
    trip = submitGuess(submitGuess(trip, 'p1', 'a', 1), 'p1', 'b', 2)
    trip = updatePlayers(trip, [...players, { id: 'd', nickname: 'Can' }])
    trip = submitGuess(trip, 'p1', 'c', 3)
    expect(trip.predictions[0].status).toBe('open')
    expect(submitGuess(trip, 'p1', 'd', 4).predictions[0].status).toBe('locked')
  })

  it('gives the point to the next closest player when the closest one is removed', () => {
    let trip = tripWith(numberPrediction())
    for (const [player, value] of [['a', 10], ['b', 20], ['c', 40]] as const) trip = submitGuess(trip, 'p1', player, value)
    trip = setResult(trip, 'p1', 21)
    expect(trip.predictions[0].points).toEqual({ a: 0, b: 1, c: 0 })
    const updated = updatePlayers(trip, [players[0], players[2]])
    expect(updated.predictions[0].points).toEqual({ a: 1, c: 0 })
  })
})

describe('templates', () => {
  const floor: PredictionTemplate = {
    id: 'hotel-floor',
    type: 'number',
    text: 'Odamız kaçıncı katta olacak?',
    unit: 'kat',
    step: 1,
    params: { min: { key: 'minFloor', label: 'En alt kat' }, max: { key: 'maxFloor', label: 'En üst kat' } },
  }

  it('lists the trip settings still missing', () => {
    expect(missingParams(floor, {})).toEqual([floor.params!.min, floor.params!.max])
    expect(missingParams(floor, { minFloor: 1 })).toEqual([floor.params!.max])
    expect(missingParams(floor, { minFloor: 1, maxFloor: 12 })).toEqual([])
  })

  it('copies the bounds from the trip settings into the prediction', () => {
    const prediction = predictionFromTemplate(floor, { minFloor: 1, maxFloor: 12 }, 'new-id')
    expect(prediction).toEqual({
      id: 'new-id',
      templateId: 'hotel-floor',
      type: 'number',
      text: 'Odamız kaçıncı katta olacak?',
      unit: 'kat',
      step: 1,
      min: 1,
      max: 12,
      status: 'open',
      guesses: {},
    })
  })

  it('keeps fixed bounds and the duration format', () => {
    const delay: PredictionTemplate = { id: 'flight-delay', type: 'number', text: 'Rötar?', unit: 'dk', format: 'duration', min: 0, max: 600, step: 1 }
    expect(predictionFromTemplate(delay, {}, 'x')).toMatchObject({ format: 'duration', min: 0, max: 600, step: 1 })
  })
})

describe('custom predictions', () => {
  it('checks the question, the range and the options', () => {
    expect(customPredictionProblems({ text: ' ', kind: 'number' })).toEqual(['Soruyu yaz.'])
    expect(customPredictionProblems({ text: 'Kaç?', kind: 'number', min: 5, max: 5 })).toEqual([
      'En az değer, en çok değerden küçük olmalı.',
    ])
    expect(customPredictionProblems({ text: 'Hangisi?', kind: 'choice', options: ['Evet', ' '] })).toEqual([
      'En az 2 seçenek yaz.',
    ])
    expect(customPredictionProblems({ text: 'Hangisi?', kind: 'choice', options: ['Evet', 'evet'] })).toEqual([
      'Aynı seçenek iki kez yazılmış.',
    ])
  })

  it('builds number, duration and choice predictions', () => {
    // No step: a custom number may have decimals.
    expect(customPrediction({ text: ' Kaç deve? ', kind: 'number', unit: 'deve', min: 0 }, 'x')).toEqual({
      id: 'x',
      text: 'Kaç deve?',
      type: 'number',
      unit: 'deve',
      min: 0,
      max: undefined,
      status: 'open',
      guesses: {},
    })
    expect(customPrediction({ text: 'Ne kadar sürer?', kind: 'duration' }, 'x')).toMatchObject({
      type: 'number',
      format: 'duration',
      min: 0,
      step: 1,
    })
    expect(customPrediction({ text: 'Hangisi?', kind: 'choice', options: ['A', ' ', 'B'] }, 'x')).toMatchObject({
      type: 'choice',
      options: ['A', 'B'],
    })
  })
})

describe('describing values', () => {
  it('describes the allowed range', () => {
    expect(describeBounds(numberPrediction({ min: 1, max: 12, unit: 'kat' }))).toBe('1–12 kat')
    expect(describeBounds(numberPrediction({ format: 'duration', min: 0, max: 600, unit: 'dk' }))).toBe('00:00–10:00 SS:DD')
    expect(describeBounds(numberPrediction({ min: 5, unit: 'kg' }))).toBe('en az 5 kg')
    expect(describeBounds(numberPrediction())).toBe('')
  })

  it('formats an answer with its unit or option text', () => {
    expect(formatAnswer(numberPrediction({ unit: 'kg' }), 23.5)).toBe('23,5 kg')
    expect(formatAnswer(numberPrediction({ format: 'duration', unit: 'dk' }), 75)).toBe('01:15')
    expect(formatAnswer(choicePrediction(), 1)).toBe('Havuz')
  })

  it('removes a deleted prediction', () => {
    expect(deletePrediction(tripWith(numberPrediction()), 'p1').predictions).toEqual([])
  })
})
