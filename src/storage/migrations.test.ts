import { describe, expect, it } from 'vitest'
import { migrateTrip, type LegacyTrip } from './migrations.ts'

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
    expect(migrateTrip(legacy).name).toBe('Gezi')
  })
})
