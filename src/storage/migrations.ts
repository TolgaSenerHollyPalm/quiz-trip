import type { TripState } from '../game/types.ts'
import { qualify } from '../packs/collection.ts'
import type { Pack } from '../packs/types.ts'
import type { TripKind } from '../trips/types.ts'

/** A trip as the first version stored it: keyed by its pack, with no plan of its own. */
export interface LegacyTrip extends Omit<SinglePackTrip, 'id' | 'name' | 'packId' | 'checklist'> {
  packId: string
}

/** Turns a pack-keyed trip into a trip of its own. The pack stays linked and every score is kept. */
export function migrateTrip(legacy: LegacyTrip, packTitle?: string): SinglePackTrip {
  return {
    ...legacy,
    id: legacy.packId,
    packId: legacy.packId,
    name: packTitle ?? 'Gezi',
    checklist: [],
  }
}

/** A trip as version 2 stored it: at most one pack, and ids that were unique only inside that pack. */
export interface SinglePackTrip extends Omit<TripState, 'packIds' | 'country' | 'cityId' | 'kind'> {
  packId?: string
  kind?: TripKind | 'hotel' // "Otel tatili" before it became "Eğlence"
}

/**
 * Opens a one-pack trip up to several: the pack it had becomes the first of its list, and everything that
 * named a question, category or template of that pack is qualified with the pack id, so the trip keeps its
 * history. The destination is taken from the pack, which is where the trip was going all along.
 */
export function migrateToMultiPack(legacy: SinglePackTrip, pack?: Pick<Pack, 'country' | 'cityId'>): TripState {
  const { packId, kind, ...rest } = legacy
  const mine = (id: string) => (packId ? qualify(packId, id) : id)

  return {
    ...rest,
    packIds: packId ? [packId] : [],
    ...(pack?.country && { country: pack.country }),
    ...(pack?.cityId && { cityId: pack.cityId }),
    ...(kind && { kind: kind === 'hotel' ? ('fun' as const) : kind }),
    askedQuestionIds: legacy.askedQuestionIds.map(mine),
    predictions: legacy.predictions.map((prediction) =>
      prediction.templateId ? { ...prediction, templateId: mine(prediction.templateId) } : prediction,
    ),
    ...(legacy.quizSettings && {
      quizSettings: { ...legacy.quizSettings, categories: legacy.quizSettings.categories.map(mine) },
    }),
    ...(legacy.currentRound && {
      currentRound: {
        ...legacy.currentRound,
        settings: { ...legacy.currentRound.settings, categories: legacy.currentRound.settings.categories.map(mine) },
        turns: legacy.currentRound.turns.map((turn) => ({
          ...turn,
          question: { ...turn.question, id: mine(turn.question.id), category: mine(turn.question.category) },
        })),
      },
    }),
  }
}
