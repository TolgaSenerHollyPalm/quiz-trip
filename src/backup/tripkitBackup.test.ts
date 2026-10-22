import { describe, expect, it } from 'vitest'
import sharm from '../../public/packs/eg-sharm-el-sheikh.json'
import { newTrip } from '../game/trip.ts'
import type { TripState } from '../game/types.ts'
import type { Pack } from '../packs/types.ts'
import { addNoteLists, migrateToMultiPack, migrateTrip, type LegacyTrip, type SinglePackTrip } from '../storage/migrations.ts'
import { latestChange, migrateTripkit, stampTrip, summarizeTripkit, validateTripkitData } from './tripkitBackup.ts'

const pack = sharm as unknown as Pack

const trip = (fields: Partial<TripState> = {}): TripState => ({
  ...newTrip('t1', 'Sharm el-Şeyh'),
  country: 'EG',
  packIds: [pack.id],
  checklist: [{ id: 'c1', text: 'Pasaport', group: 'pack', source: 'common', done: true }],
  souvenirs: [{ id: 's1', text: 'Papirüs', note: 'Kime: Ayşe', done: false }],
  tastes: [{ id: 'k1', text: 'Koşari', done: true }],
  players: [{ id: 'p1', nickname: 'Deniz' }],
  rounds: [{ id: 'r1', playedAt: '2026-09-20T18:00:00Z', scores: { p1: 6 } }],
  predictions: [{ id: 'x1', text: 'Kaç?', type: 'number', status: 'open', guesses: {} }],
  updatedAt: '2026-09-29T10:00:00.000Z',
  ...fields,
})

describe('stampTrip', () => {
  it('marks when the trip was last changed', () => {
    expect(stampTrip(trip(), new Date('2026-09-30T08:00:00.000Z')).updatedAt).toBe('2026-09-30T08:00:00.000Z')
  })
})

describe('validateTripkitData', () => {
  it('accepts trips and packs as the app stores them', () => {
    expect(validateTripkitData({ trips: [trip()], packs: [pack] })).toBe(true)
    expect(validateTripkitData({ trips: [], packs: [] })).toBe(true)
  })

  it('refuses the whole file for one missing field, one wrong type or an id used twice', () => {
    const { checklist: _unused, ...withoutChecklist } = trip()
    const cases = [
      { trips: [withoutChecklist], packs: [] },
      { trips: [trip({ checklist: [{ id: 'c1', text: 'Pasaport', group: 'pack', done: 'yes' as never }] })], packs: [] },
      { trips: [trip({ name: 7 as never })], packs: [] },
      { trips: [trip(), trip()], packs: [] },
      { trips: [], packs: [pack, pack] },
      { trips: [], packs: [{ ...pack, version: 0 }] },
      { trips: 'none', packs: [] },
    ]
    for (const data of cases) expect(validateTripkitData(data)).toBe(false)
  })

  it('takes saved phrases and suggestions with their place, and refuses them in the wrong type', () => {
    const suggestion = { id: 'eg-koshari', text: 'Koşari', note: 'Pirinç, makarna', source: 'EG', done: false }
    expect(validateTripkitData({ trips: [trip({ savedEnglish: ['airport-1', 'food-3'], tastes: [suggestion] })], packs: [pack] })).toBe(true)
    expect(validateTripkitData({ trips: [trip({ savedEnglish: 'x' as never })], packs: [pack] })).toBe(false)
    expect(validateTripkitData({ trips: [trip({ savedEnglish: [7] as never })], packs: [pack] })).toBe(false)
    expect(validateTripkitData({ trips: [trip({ dismissed: { checklist: ['common-id'], souvenirs: ['eg-papyrus'] } })], packs: [pack] })).toBe(true)
    expect(validateTripkitData({ trips: [trip({ dismissed: { elsewhere: ['x'] } as never })], packs: [pack] })).toBe(false)
    expect(validateTripkitData({ trips: [trip({ dismissed: { tastes: 'eg-ful' } as never })], packs: [pack] })).toBe(false)
    expect(validateTripkitData({ trips: [trip({ tastes: [{ ...suggestion, source: 3 as never }] })], packs: [pack] })).toBe(false)
  })

  it('takes a trip waiting for its pack or turning packs down, and refuses any other pack offer', () => {
    expect(validateTripkitData({ trips: [trip({ packOffer: 'waiting', packIds: [] })], packs: [] })).toBe(true)
    expect(validateTripkitData({ trips: [trip({ packOffer: 'declined' })], packs: [pack] })).toBe(true)
    expect(validateTripkitData({ trips: [trip({ packOffer: 'later' as never })], packs: [pack] })).toBe(false)
    expect(validateTripkitData({ trips: [trip({ packOffer: null as never })], packs: [pack] })).toBe(false)
  })

  // Our own backup must never read as damaged, including trips that came through every migration.
  it('accepts trips carried over from the oldest stored versions', () => {
    const legacy: LegacyTrip = {
      packId: 'eg-sharm-el-sheikh',
      players: [{ id: 'a', nickname: 'Ayşe' }],
      params: { minFloor: 1 },
      askedQuestionIds: ['eg-hist-001'],
      rounds: [{ id: 'r1', playedAt: '2026-09-19T10:00:00Z', scores: { a: 3 } }],
      predictions: [{ id: 'p1', text: 'Kaç?', type: 'number', status: 'open', guesses: {} }],
    }
    const singlePack: SinglePackTrip = {
      id: 'antalya',
      name: 'Antalya',
      packId: 'nick-land-of-legends',
      kind: 'hotel',
      checklist: [{ id: 'own-1', text: 'Fotoğraf makinesi', group: 'pack', done: false }],
      players: [{ id: 'a', nickname: 'Ayşe' }],
      params: { minFloor: 1 },
      askedQuestionIds: ['nlol-sb-001'],
      rounds: [],
      predictions: [{ id: 'p1', templateId: 'room-floor', text: 'Kaç?', type: 'number', status: 'open', guesses: {} }],
      quizSettings: { categories: ['spongebob'], difficulty: 'mixed', questionsPerPlayer: 3, timeLimit: 0 },
    }
    const trips = [
      addNoteLists(migrateToMultiPack(migrateTrip(legacy, 'Mısır — Sharm el-Şeyh'), pack)),
      addNoteLists(migrateToMultiPack(singlePack, { country: 'TR', cityId: 'antalya' })),
    ]
    expect(validateTripkitData({ trips, packs: [pack] })).toBe(true)
  })
})

describe('summarizeTripkit', () => {
  it('counts trips, packs and the items of all three lists', () => {
    expect(summarizeTripkit({ trips: [trip(), trip({ id: 't2', checklist: [] })], packs: [pack] })).toEqual([
      { key: 'trips', count: 2, label: 'seyahat' },
      { key: 'packs', count: 1, label: 'soru paketi' },
      { key: 'listItems', count: 5, label: 'liste maddesi' },
    ])
  })
})

describe('migrateTripkit and latestChange', () => {
  it('passes version 5 through and refuses one it does not know', () => {
    const data = { trips: [], packs: [] }
    expect(migrateTripkit(data, 5)).toBe(data)
    for (const from of [3, 6, 4.5]) expect(() => migrateTripkit(data, from)).toThrow()
  })

  it('fills the empty lists of a version 4 backup’s trips once, and nothing else', () => {
    const empty = trip({ id: 't1', souvenirs: [], tastes: [] })
    const own = trip({ id: 't2', tastes: [] })
    const nowhere = trip({ id: 't3', country: undefined, souvenirs: [], tastes: [] })
    const migrated = migrateTripkit({ trips: [empty, own, nowhere], packs: [pack] }, 4) as { trips: TripState[]; packs: Pack[] }

    expect(migrated.packs).toEqual([pack])
    expect([migrated.trips[0].souvenirs.length, migrated.trips[0].tastes.length]).toEqual([7, 4])
    expect(migrated.trips[1].souvenirs).toEqual(own.souvenirs)
    expect(migrated.trips[1].tastes.map((item) => item.source)).toEqual(['EG', 'EG', 'EG', 'EG'])
    expect(migrated.trips[2]).toBe(nowhere)
    expect(validateTripkitData(migrated)).toBe(true)
  })

  it('leaves a damaged version 4 backup for validation to refuse', () => {
    expect(migrateTripkit('nope', 4)).toBe('nope')
    const migrated = migrateTripkit({ trips: [{ id: 'x' }], packs: [] }, 4)
    expect(migrated).toEqual({ trips: [{ id: 'x' }], packs: [] })
    expect(validateTripkitData(migrated)).toBe(false)
  })

  it('takes the latest change of any trip, ignoring trips never stamped', () => {
    const trips = [trip({ updatedAt: '2026-09-02T10:00:00.000Z' }), trip({ updatedAt: '2026-09-29T10:00:00.000Z' }), trip({ updatedAt: undefined })]
    expect(latestChange(trips)).toBe('2026-09-29T10:00:00.000Z')
    expect(latestChange([trip({ updatedAt: undefined })])).toBeUndefined()
  })
})
