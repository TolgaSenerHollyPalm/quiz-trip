import { categoriesOf, type Pack, type PackCategory, type PredictionTemplate, type Question } from './types.ts'

/**
 * A trip can be played with several packs at once — Türkiye brings every Turkish pack — and two packs may
 * well use the same question or category id. Everything the trip plays with is therefore qualified with the
 * pack it came from: "pack-id:its-own-id".
 */
export const qualify = (packId: string, id: string) => `${packId}:${id}`

/** The part after the first colon; a pack id never contains one. */
export const ownId = (qualified: string) => qualified.slice(qualified.indexOf(':') + 1)

export interface CategoryGroup {
  packId: string
  packTitle: string
  categories: PackCategory[] // ids qualified
}

export interface TripPacks {
  packs: Pack[]
  questions: Question[] // ids and categories qualified
  templates: PredictionTemplate[] // ids qualified
  categoryGroups: CategoryGroup[] // one per pack, only the categories that have questions
}

export const NO_PACKS: TripPacks = { packs: [], questions: [], templates: [], categoryGroups: [] }

/** Merges the trip's packs into one pool: one quiz and one list of prediction questions. */
export function collectPacks(packs: readonly Pack[]): TripPacks {
  return {
    packs: [...packs],
    questions: packs.flatMap((pack) =>
      pack.questions.map((question) => ({
        ...question,
        id: qualify(pack.id, question.id),
        category: qualify(pack.id, question.category),
      })),
    ),
    templates: packs.flatMap((pack) =>
      pack.predictionTemplates.map((template) => ({ ...template, id: qualify(pack.id, template.id) })),
    ),
    categoryGroups: packs.map((pack) => ({
      packId: pack.id,
      packTitle: pack.title,
      categories: categoriesOf(pack)
        .filter((category) => pack.questions.some((question) => question.category === category.id))
        .map((category) => ({ id: qualify(pack.id, category.id), label: category.label })),
    })),
  }
}

/** What the pack calls this category; the bare id if that pack is no longer on the device. */
export function categoryLabel(collection: TripPacks, id: string): string {
  for (const group of collection.categoryGroups) {
    const found = group.categories.find((category) => category.id === id)
    if (found) return found.label
  }
  return ownId(id)
}
