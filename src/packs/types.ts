export interface PackCategory {
  id: string
  label: string // what players see on the quiz settings screen
}

/** Packs that do not bring their own categories use these. */
export const BUILT_IN_CATEGORIES: PackCategory[] = [
  { id: 'history', label: 'Tarih' },
  { id: 'mythology', label: 'Mitoloji' },
  { id: 'geography', label: 'Coğrafya' },
  { id: 'food', label: 'Yemek' },
  { id: 'language', label: 'Dil' },
  { id: 'culture', label: 'Kültür' },
]

/** A category id from the pack the question belongs to. */
export type Category = string

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
  categories?: PackCategory[] // a themed pack brings its own; otherwise the built-in ones are used
  questions: Question[]
  predictionTemplates: PredictionTemplate[]
}

/** The categories this pack's questions can use. */
export function categoriesOf(pack: Pick<Pack, 'categories'>): PackCategory[] {
  return pack.categories ?? BUILT_IN_CATEGORIES
}

/** What this pack calls the category, or the bare id if the pack never named it. */
export function categoryLabel(pack: Pick<Pack, 'categories'>, id: Category): string {
  return categoriesOf(pack).find((category) => category.id === id)?.label ?? id
}
