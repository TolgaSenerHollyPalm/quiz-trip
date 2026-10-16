import { describe, expect, it } from 'vitest'
import { BUNDLED_DESTINATIONS } from '../trips/destinations.ts'
import { addNoteLists, fillPlaceLists, migrateToMultiPack, migrateTrip, type LegacyTrip, type SinglePackTrip } from './migrations.ts'

const legacy: LegacyTrip = {
  packId: 'eg-sharm-el-sheikh',
  players: [{ id: 'a', nickname: 'Ayşe' }],
  params: { minFloor: 1 },
  askedQuestionIds: ['eg-hist-001'],
  rounds: [{ id: 'r1', playedAt: '2026-09-19T10:00:00Z', scores: { a: 3 } }],
  predictions: [{ id: 'p1', text: 'Kaç?', type: 'number', status: 'open', guesses: {} }],
}

describe('migrateTrip', () => {
  it('keeps everything that was played and links the pack', () => {
    expect(migrateTrip(legacy, 'Mısır — Sharm el-Şeyh')).toEqual({
      ...legacy,
      id: 'eg-sharm-el-sheikh',
      packId: 'eg-sharm-el-sheikh',
      name: 'Mısır — Sharm el-Şeyh',
      checklist: [],
    })
  })

  it('falls back to a plain name when the pack is gone', () => {
    expect(migrateTrip(legacy).name).toBe('Seyahat')
  })
})

const singlePack: SinglePackTrip = {
  id: 'antalya',
  name: 'Antalya',
  packId: 'nick-land-of-legends',
  kind: 'hotel',
  checklist: [{ id: 'own-1', text: 'Fotoğraf makinesi', group: 'pack', done: false }],
  players: [{ id: 'a', nickname: 'Ayşe' }],
  params: { minFloor: 1 },
  askedQuestionIds: ['nlol-sb-001'],
  rounds: [{ id: 'r1', playedAt: '2026-09-19T10:00:00Z', scores: { a: 3 } }],
  predictions: [{ id: 'p1', templateId: 'room-floor', text: 'Kaç?', type: 'number', status: 'open', guesses: {} }],
  quizSettings: { categories: ['spongebob'], difficulty: 'mixed', questionsPerPlayer: 3, timeLimit: 0 },
}

describe('migrateToMultiPack', () => {
  const pack = { country: 'TR', cityId: 'antalya' }

  it('turns the one pack into a list and takes the destination from it', () => {
    const trip = migrateToMultiPack(singlePack, pack)
    expect(trip.packIds).toEqual(['nick-land-of-legends'])
    expect(trip).toMatchObject({ country: 'TR', cityId: 'antalya' })
  })

  it('qualifies everything that named something inside that pack', () => {
    const trip = migrateToMultiPack(singlePack, pack)
    expect(trip.askedQuestionIds).toEqual(['nick-land-of-legends:nlol-sb-001'])
    expect(trip.quizSettings?.categories).toEqual(['nick-land-of-legends:spongebob'])
    expect(trip.predictions[0].templateId).toBe('nick-land-of-legends:room-floor')
  })

  it('carries a round in progress over, question by question', () => {
    const question = {
      id: 'nlol-sb-002',
      category: 'spongebob' as const,
      difficulty: 'easy' as const,
      text: '?',
      options: ['A', 'B', 'C', 'D'],
      answerIndex: 0,
      explanation: '.',
    }
    const trip = migrateToMultiPack(
      {
        ...singlePack,
        currentRound: {
          id: 'r2',
          startedAt: '2026-09-19T10:00:00Z',
          settings: { categories: ['spongebob'], difficulty: 'mixed', questionsPerPlayer: 1, timeLimit: 0 },
          turns: [{ playerId: 'a', question, optionOrder: [0, 1, 2, 3] }],
          answers: [],
        },
      },
      pack,
    )
    expect(trip.currentRound?.turns[0].question).toMatchObject({
      id: 'nick-land-of-legends:nlol-sb-002',
      category: 'nick-land-of-legends:spongebob',
    })
    expect(trip.currentRound?.settings.categories).toEqual(['nick-land-of-legends:spongebob'])
  })

  it('renames the old hotel holiday and keeps the checklist as it is', () => {
    const trip = migrateToMultiPack(singlePack, pack)
    expect(trip.kind).toBe('fun')
    expect(trip.checklist).toEqual(singlePack.checklist)
  })

  it('leaves a trip without a pack alone, ids and all', () => {
    const trip = migrateToMultiPack({ ...singlePack, packId: undefined })
    expect(trip.packIds).toEqual([])
    expect(trip.country).toBeUndefined()
    expect(trip.askedQuestionIds).toEqual(['nlol-sb-001'])
  })
})

describe('addNoteLists', () => {
  const stored = migrateToMultiPack(singlePack, { country: 'TR', cityId: 'antalya' })

  it('gives a stored trip two empty lists and changes nothing else', () => {
    expect(addNoteLists(stored)).toEqual({ ...stored, souvenirs: [], tastes: [] })
  })

  it('keeps lists a trip already has', () => {
    const souvenirs = [{ id: 's1', text: 'Baharat', done: false }]
    expect(addNoteLists({ ...stored, souvenirs }).souvenirs).toBe(souvenirs)
  })

  it('also completes a trip migrated all the way from the first version', () => {
    const trip = addNoteLists(migrateToMultiPack(migrateTrip(legacy, 'Mısır'), { country: 'EG' }))
    expect(trip.souvenirs).toEqual([])
    expect(trip.tastes).toEqual([])
    expect(trip.checklist).toEqual([])
  })
})

describe('fillPlaceLists', () => {
  const stored = addNoteLists(migrateToMultiPack(singlePack, { country: 'EG', cityId: 'sharm-el-sheikh' }))

  it('fills both empty lists of a trip with its place’s suggestions, unticked', () => {
    const trip = fillPlaceLists(stored, BUNDLED_DESTINATIONS)
    expect([trip.souvenirs.length, trip.tastes.length]).toEqual([7, 4])
    expect([...trip.souvenirs, ...trip.tastes].every((item) => item.source === 'EG' && !item.done)).toBe(true)
    expect({ ...trip, souvenirs: [], tastes: [] }).toEqual(stored)
  })

  it('never touches a list that has anything in it', () => {
    const souvenirs = [{ id: 's1', text: 'Lokum', done: false }]
    const trip = fillPlaceLists({ ...stored, souvenirs }, BUNDLED_DESTINATIONS)
    expect(trip.souvenirs).toBe(souvenirs)
    expect(trip.tastes).toHaveLength(4)
  })

  it('leaves a trip without a country, or with nothing to suggest, as it is', () => {
    const { country: _country, cityId: _cityId, ...nowhere } = stored
    expect(fillPlaceLists(nowhere, BUNDLED_DESTINATIONS)).toBe(nowhere)
    const antalya = { ...stored, country: 'TR', cityId: 'antalya' }
    expect(fillPlaceLists(antalya, BUNDLED_DESTINATIONS)).toBe(antalya)
  })

  it('fills a trip carried over from the first version, its place taken from the pack', () => {
    const trip = fillPlaceLists(addNoteLists(migrateToMultiPack(migrateTrip(legacy, 'Mısır'), { country: 'EG' })), BUNDLED_DESTINATIONS)
    expect([trip.souvenirs.length, trip.tastes.length]).toEqual([7, 4])
  })

  it('changes nothing the second time', () => {
    const once = fillPlaceLists(stored, BUNDLED_DESTINATIONS)
    expect(fillPlaceLists(once, BUNDLED_DESTINATIONS)).toBe(once)
  })
})
