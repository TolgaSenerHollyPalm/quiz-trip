import type { TripState } from '../game/types.ts'
import { ENGLISH_TOPICS, findItem, type FoundItem } from './content.ts'

/** Travel English is for trips abroad: a country is chosen and it is not Türkiye. */
export const isAbroad = (trip: Pick<TripState, 'country'>): boolean => trip.country !== undefined && trip.country !== 'TR'

// Turkish case rules, so "İ" and "I" find "i" and "ı"; punctuation and the gap mark do not count.
export function searchable(text: string, locale: 'tr' | 'en' = 'tr'): string {
  return text
    .toLocaleLowerCase(locale)
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Phrases and words whose Turkish or English holds the query, grouped by topic in the content's order. */
export function searchEnglish(query: string): { topicId: string; found: FoundItem[] }[] {
  const wanted = searchable(query)
  if (wanted === '') return []
  // English keeps its own case rule too, so "CHECK-IN" typed on a Turkish keyboard still finds "check-in".
  const english = searchable(query, 'en')
  const matches = ({ item }: FoundItem) =>
    searchable(item.tr).includes(wanted) || searchable(item.en).includes(wanted) || searchable(item.en, 'en').includes(english)
  return ENGLISH_TOPICS.map((topic) => ({
    topicId: topic.id,
    found: [
      ...topic.phrases.map((item): FoundItem => ({ item, topic, kind: 'phrase' })),
      ...topic.words.map((item): FoundItem => ({ item, topic, kind: 'word' })),
    ].filter(matches),
  })).filter((group) => group.found.length > 0)
}

export const isSaved = (trip: Pick<TripState, 'savedEnglish'>, id: string): boolean => trip.savedEnglish?.includes(id) ?? false

/** Stars an item, or takes the star off; saved items keep the order they were starred in. */
export function toggleSaved<T extends Pick<TripState, 'savedEnglish'>>(trip: T, id: string): T {
  const saved = trip.savedEnglish ?? []
  return { ...trip, savedEnglish: saved.includes(id) ? saved.filter((other) => other !== id) : [...saved, id] }
}

/** The saved items still in the content, in the order they were saved; an id the content dropped is skipped. */
export const savedItems = (trip: Pick<TripState, 'savedEnglish'>): FoundItem[] =>
  (trip.savedEnglish ?? []).flatMap((id) => findItem(id) ?? [])
