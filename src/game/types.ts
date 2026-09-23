import type { Category, Difficulty, Question } from '../packs/types.ts'
import type { ChecklistItem, Transport, TripKind } from '../trips/types.ts'

export interface Player {
  id: string
  nickname: string
}

export type DifficultyChoice = Difficulty | 'mixed'

export interface QuizSettings {
  categories: Category[] // at least one
  difficulty: DifficultyChoice
  questionsPerPlayer: number // 1–10
  timeLimit: 0 | 15 | 30 // seconds per question, 0 = no limit
}

export interface RoundTurn {
  playerId: string
  question: Question // copied so a pack update never changes a round in progress
  optionOrder: number[] // on-screen position -> index in question.options
}

export interface TurnAnswer {
  choice: number | null // on-screen position of the chosen option, null when time ran out
  points: number
}

/** A round that has started but not finished; saved so it survives the app being closed. */
export interface CurrentRound {
  id: string
  startedAt: string
  settings: QuizSettings
  turns: RoundTurn[]
  answers: TurnAnswer[] // one per finished turn, in turn order
}

export interface QuizRound {
  id: string
  playedAt: string
  scores: Record<string, number> // playerId -> points
}

export interface Prediction {
  id: string
  templateId?: string // empty when the user wrote the question
  text: string
  type: 'number' | 'choice'
  format?: 'duration' // minutes, entered and shown as HH:MM
  min?: number
  max?: number
  step?: number
  unit?: string
  options?: string[]
  status: 'open' | 'locked' | 'resolved'
  guesses: Record<string, number> // playerId -> value (option index for choice)
  result?: number
  points?: Record<string, number>
}

export interface TripState {
  id: string
  name: string
  packId?: string // the question pack played on this trip, if one is linked
  startDate?: string // YYYY-MM-DD, the day the trip starts
  endDate?: string // YYYY-MM-DD, optional
  transport?: Transport
  kind?: TripKind
  checklist: ChecklistItem[]
  players: Player[]
  params: Record<string, number> // values for parameterised prediction templates
  askedQuestionIds: string[] // oldest first
  rounds: QuizRound[]
  predictions: Prediction[]
  quizSettings?: QuizSettings // last used, offered again next time
  currentRound?: CurrentRound
}
