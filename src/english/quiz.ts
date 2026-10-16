import type { TripState } from '../game/types.ts'
import { shuffle, type Rng } from '../game/random.ts'
import { categoryLabel, qualify, type CategoryGroup, type TripPacks } from '../packs/collection.ts'
import type { Difficulty, Question } from '../packs/types.ts'
import { ENGLISH_TOPICS, hasGap } from './content.ts'
import { isAbroad } from './english.ts'

export const ENGLISH_PACK_ID = 'travel-english'
export const ENGLISH_CATEGORY = qualify(ENGLISH_PACK_ID, 'english')

export const ENGLISH_GROUP: CategoryGroup = {
  packId: ENGLISH_PACK_ID,
  packTitle: 'Seyahat İngilizcesi',
  categories: [{ id: ENGLISH_CATEGORY, label: 'İngilizce' }],
}

/** Longer English is harder to pick out: up to 4 words easy, 5–6 medium, more hard. */
export function englishDifficulty(en: string): Difficulty {
  const words = en.trim().split(/\s+/).length
  if (words <= 4) return 'easy'
  return words <= 6 ? 'medium' : 'hard'
}

/** One question per phrase without a gap; the wrong options are other phrases of the same topic. */
export function englishQuestions(rng: Rng): Question[] {
  return ENGLISH_TOPICS.flatMap((topic) => {
    const phrases = topic.phrases.filter((phrase) => !hasGap(phrase))
    return phrases.flatMap((phrase): Question[] => {
      const others = [...new Set(phrases.map((other) => other.en))].filter((en) => en !== phrase.en)
      if (others.length < 3) return []
      const options = shuffle([phrase.en, ...shuffle(others, rng).slice(0, 3)], rng)
      return [
        {
          id: qualify(ENGLISH_PACK_ID, phrase.id),
          category: ENGLISH_CATEGORY,
          difficulty: englishDifficulty(phrase.en),
          text: `“${phrase.tr}” İngilizce nasıl söylenir?`,
          options,
          answerIndex: options.indexOf(phrase.en),
          explanation: `“${phrase.tr}” → ${phrase.en}${phrase.note ? ` · ${phrase.note}` : ''}`,
        },
      ]
    })
  })
}

/** A trip abroad that has a pack on the device also plays the travel English questions, as a group of their own. */
export function withEnglish(collection: TripPacks, trip: Pick<TripState, 'country'>, rng: Rng): TripPacks {
  if (!isAbroad(trip) || collection.packs.length === 0) return collection
  return {
    ...collection,
    questions: [...collection.questions, ...englishQuestions(rng)],
    categoryGroups: [...collection.categoryGroups, ENGLISH_GROUP],
  }
}

/** A question's category name; English needs no pack, so it keeps its name once the trip is no longer abroad. */
export const quizCategoryLabel = (collection: TripPacks, id: string): string =>
  id === ENGLISH_CATEGORY ? ENGLISH_GROUP.categories[0].label : categoryLabel(collection, id)
