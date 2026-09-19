import type { PredictionTemplate, TemplateParam } from '../packs/types.ts'
import type { Player, Prediction, TripState } from './types.ts'
import { formatValue } from './values.ts'

export const EXACT_POINTS = 3
export const CLOSEST_POINTS = 1
export const RIGHT_CHOICE_POINTS = 1
export const MAX_CHOICE_OPTIONS = 6

// Rounded so that guesses in 0.1 steps compare equal despite floating point noise.
const distance = (a: number, b: number) => Math.round(Math.abs(a - b) * 1e6) / 1e6

/**
 * Points once the real value is known. Choice: the right option earns 1. Number: an exact guess earns 3,
 * otherwise the closest guess earns 1. Everyone at the same distance gets the same points.
 */
export function scorePrediction({ type, guesses, result }: Pick<Prediction, 'type' | 'guesses' | 'result'>) {
  const entries = Object.entries(guesses)
  if (result === undefined) return {}
  if (type === 'choice') {
    return Object.fromEntries(entries.map(([id, guess]) => [id, guess === result ? RIGHT_CHOICE_POINTS : 0]))
  }
  const best = Math.min(...entries.map(([, guess]) => distance(guess, result)))
  return Object.fromEntries(
    entries.map(([id, guess]) => [
      id,
      distance(guess, result) === best ? (best === 0 ? EXACT_POINTS : CLOSEST_POINTS) : 0,
    ]),
  )
}

/** Each player's points summed over every resolved prediction. */
export function predictionTotals(predictions: readonly Prediction[]): Record<string, number> {
  const totals: Record<string, number> = {}
  for (const prediction of predictions) {
    for (const [playerId, points] of Object.entries(prediction.points ?? {})) {
      totals[playerId] = (totals[playerId] ?? 0) + points
    }
  }
  return totals
}

/** A value with its unit, or the option text, as players read it. */
export function formatAnswer(prediction: Prediction, value: number): string {
  if (prediction.type === 'choice') return prediction.options?.[value] ?? '?'
  const text = formatValue(value, prediction.format)
  return prediction.unit && prediction.format !== 'duration' ? `${text} ${prediction.unit}` : text
}

/** The allowed range in a few words, e.g. "1–12 kat", "00:00–10:00", "en az 5 kg"; empty when anything goes. */
export function describeBounds({ min, max, unit, format }: Prediction): string {
  const value = (n: number) => formatValue(n, format)
  const range =
    min !== undefined && max !== undefined
      ? `${value(min)}–${value(max)}`
      : min !== undefined
        ? `en az ${value(min)}`
        : max !== undefined
          ? `en çok ${value(max)}`
          : ''
  return [range, format === 'duration' ? 'SS:DD' : unit].filter(Boolean).join(' ')
}

/** Why a guess cannot be accepted, in Turkish, or undefined when it is fine. */
export function guessProblem(prediction: Prediction, value: number): string | undefined {
  if (prediction.type === 'choice') {
    const count = prediction.options?.length ?? 0
    return Number.isInteger(value) && value >= 0 && value < count ? undefined : 'Bir seçenek seç.'
  }
  const { min, max, step, format } = prediction
  if (!Number.isFinite(value)) return format === 'duration' ? 'Süreyi saat ve dakika olarak gir.' : 'Bir sayı gir.'
  if ((min !== undefined && value < min) || (max !== undefined && value > max)) {
    const show = (n: number) => formatValue(n, format)
    if (min !== undefined && max !== undefined) return `${show(min)} ile ${show(max)} arasında bir değer gir.`
    return min !== undefined ? `En az ${show(min)} olabilir.` : `En çok ${show(max!)} olabilir.`
  }
  if (step !== undefined) {
    const base = min ?? 0
    const steps = (value - base) / step
    if (Math.abs(steps - Math.round(steps)) > 1e-9) {
      if (step === 1) return 'Tam sayı gir.'
      const examples = [0, 1, 2].map((i) => formatValue(base + i * step, format)).join(' / ')
      return `Geçerli değerler: ${examples} …`
    }
  }
  return undefined
}

/** Why a real value cannot be saved as the result. The range does not apply: the real value is what it is. */
export function resultProblem(prediction: Prediction, value: number): string | undefined {
  if (prediction.type === 'choice') return guessProblem(prediction, value)
  return Number.isFinite(value) ? undefined : 'Bir değer gir.'
}

/** Trip-dependent bounds the template needs that the trip settings do not have yet. */
export function missingParams(template: PredictionTemplate, params: Readonly<Record<string, number>>): TemplateParam[] {
  return [template.params?.min, template.params?.max].filter(
    (param): param is TemplateParam => param !== undefined && params[param.key] === undefined,
  )
}

/**
 * A trip prediction from a pack template. Bounds from the trip settings are copied in, so changing the settings
 * later leaves predictions that were already added alone. Check missingParams first.
 */
export function predictionFromTemplate(
  template: PredictionTemplate,
  params: Readonly<Record<string, number>>,
  id: string,
): Prediction {
  const { params: bounds, ...rest } = template
  return {
    ...rest,
    id,
    templateId: template.id,
    min: bounds?.min ? params[bounds.min.key] : template.min,
    max: bounds?.max ? params[bounds.max.key] : template.max,
    status: 'open',
    guesses: {},
  }
}

export interface CustomPredictionInput {
  text: string
  kind: 'number' | 'duration' | 'choice'
  unit?: string
  min?: number
  max?: number
  options?: string[]
}

/** Problems with a question the players wrote themselves, in Turkish. */
export function customPredictionProblems({ text, kind, min, max, options = [] }: CustomPredictionInput): string[] {
  const problems: string[] = []
  if (text.trim() === '') problems.push('Soruyu yaz.')
  if (kind === 'number' && min !== undefined && max !== undefined && min >= max) {
    problems.push('En az değer, en çok değerden küçük olmalı.')
  }
  if (kind === 'choice') {
    const filled = options.map((option) => option.trim()).filter(Boolean)
    if (filled.length < 2) problems.push('En az 2 seçenek yaz.')
    if (new Set(filled.map((option) => option.toLocaleLowerCase('tr'))).size !== filled.length) {
      problems.push('Aynı seçenek iki kez yazılmış.')
    }
  }
  return problems
}

/** A prediction the players wrote themselves; durations count whole minutes, numbers may have decimals. */
export function customPrediction(input: CustomPredictionInput, id: string): Prediction {
  const base = { id, text: input.text.trim(), status: 'open' as const, guesses: {} }
  if (input.kind === 'choice') {
    const options = (input.options ?? []).map((option) => option.trim()).filter(Boolean)
    return { ...base, type: 'choice', options }
  }
  if (input.kind === 'duration') return { ...base, type: 'number', format: 'duration', min: 0, step: 1 }
  const unit = input.unit?.trim()
  return { ...base, type: 'number', min: input.min, max: input.max, ...(unit && { unit }) }
}

function withPrediction(trip: TripState, id: string, change: (prediction: Prediction) => Prediction): TripState {
  return {
    ...trip,
    predictions: trip.predictions.map((prediction) => (prediction.id === id ? change(prediction) : prediction)),
  }
}

/**
 * Keeps a prediction in line with the current players: it locks once every player has guessed, and a
 * resolved one has its points worked out again (e.g. after a player was removed).
 */
function settle(prediction: Prediction, players: readonly Player[]): Prediction {
  if (prediction.status === 'open') {
    const everyoneGuessed = players.length > 0 && players.every((player) => player.id in prediction.guesses)
    return everyoneGuessed ? { ...prediction, status: 'locked' } : prediction
  }
  if (prediction.status === 'resolved') return { ...prediction, points: scorePrediction(prediction) }
  return prediction
}

export function settlePredictions(predictions: readonly Prediction[], players: readonly Player[]): Prediction[] {
  return predictions.map((prediction) => settle(prediction, players))
}

export function addPrediction(trip: TripState, prediction: Prediction): TripState {
  return { ...trip, predictions: [...trip.predictions, prediction] }
}

export function deletePrediction(trip: TripState, id: string): TripState {
  return { ...trip, predictions: trip.predictions.filter((prediction) => prediction.id !== id) }
}

/** Saves or replaces a player's guess while the prediction is open. The last missing guess locks it for good. */
export function submitGuess(trip: TripState, predictionId: string, playerId: string, value: number): TripState {
  return withPrediction(trip, predictionId, (prediction) =>
    prediction.status !== 'open' || guessProblem(prediction, value) !== undefined
      ? prediction
      : settle({ ...prediction, guesses: { ...prediction.guesses, [playerId]: value } }, trip.players),
  )
}

/** Enters or corrects the real value once everyone has guessed; the points are worked out again each time. */
export function setResult(trip: TripState, predictionId: string, result: number): TripState {
  return withPrediction(trip, predictionId, (prediction) =>
    prediction.status === 'open' || resultProblem(prediction, result) !== undefined
      ? prediction
      : settle({ ...prediction, status: 'resolved', result }, trip.players),
  )
}
