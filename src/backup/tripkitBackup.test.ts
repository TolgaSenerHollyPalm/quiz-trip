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
  it('passes version 4 through and refuses one it does not know', () => {
    const data = { trips: [], packs: [] }
    expect(migrateTripkit(data, 4)).toBe(data)
    expect(() => migrateTripkit(data, 3)).toThrow()
  })

  it('takes the latest change of any trip, ignoring trips never stamped', () => {
    const trips = [trip({ updatedAt: '2026-09-02T10:00:00.000Z' }), trip({ updatedAt: '2026-09-29T10:00:00.000Z' }), trip({ updatedAt: undefined })]
    expect(latestChange(trips)).toBe('2026-09-29T10:00:00.000Z')
    expect(latestChange([trip({ updatedAt: undefined })])).toBeUndefined()
  })
})
