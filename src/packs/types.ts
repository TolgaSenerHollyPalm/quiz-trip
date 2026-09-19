export const CATEGORIES = ['history', 'mythology', 'geography', 'food', 'language', 'culture'] as const
export type Category = (typeof CATEGORIES)[number]

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const
export type Difficulty = (typeof DIFFICULTIES)[number]

export interface Question {
  id: string // stable within the pack, never reused
  category: Category
  difficulty: Difficulty
  text: string
  options: string[] // exactly 4
  answerIndex: number // index of the right option
  explanation: string // shown after answering
}

/** A bound that depends on the trip, e.g. the hotel's lowest floor; its value is entered in the trip settings. */
export interface TemplateParam {
  key: string // templates needing the same value share the key
  label: string // shown in the trip settings
}

export interface PredictionTemplate {
  id: string
  type: 'number' | 'choice'
  text: string
  unit?: string
  format?: 'duration' // a number of minutes, entered and shown as HH:MM
  min?: number
  max?: number
  step?: number
  params?: { min?: TemplateParam; max?: TemplateParam }
  options?: string[] // type === 'choice'
}

export interface Pack {
  schemaVersion: 1
  id: string
  title: string
  country: string // ISO 3166-1 alpha-2
  city: string
  version: number // bumped on every content change
  updatedAt: string // YYYY-MM-DD
  questions: Question[]
  predictionTemplates: PredictionTemplate[]
}
