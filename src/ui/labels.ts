import type { DifficultyChoice } from '../game/types.ts'
import type { Category } from '../packs/types.ts'

export const CATEGORY_LABELS: Record<Category, string> = {
  history: 'Tarih',
  mythology: 'Mitoloji',
  geography: 'Coğrafya',
  food: 'Yemek',
  language: 'Dil',
  culture: 'Kültür',
}

export const DIFFICULTY_LABELS: Record<DifficultyChoice, string> = {
  mixed: 'Karışık',
  easy: 'Kolay',
  medium: 'Orta',
  hard: 'Zor',
}

export const OPTION_LETTERS = ['A', 'B', 'C', 'D']
