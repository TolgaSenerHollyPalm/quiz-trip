import { describe, expect, it } from 'vitest'
import { categoryLabel, collectPacks, ownId, qualify } from './collection.ts'
import type { Pack } from './types.ts'

const pack = (id: string, title: string, extra: Partial<Pack> = {}): Pack => ({
  schemaVersion: 1,
  id,
  title,
  country: 'TR',
  city: 'Test',
  version: 1,
  updatedAt: '2026-09-23',
  questions: [
    {
      id: 'q1',
      category: 'history',
      difficulty: 'easy',
      text: 'Soru?',
      options: ['A', 'B', 'C', 'D'],
      answerIndex: 0,
      explanation: '.',
    },
  ],
  predictionTemplates: [{ id: 't1', type: 'number', text: 'Kaç?' }],
  ...extra,
})

const themed = pack('nick', 'Land of Legends', {
  categories: [
    { id: 'spongebob', label: 'SpongeBob' },
    { id: 'tmnt', label: 'Ninja Kaplumbağalar' }, // no questions, so it is not offered
  ],
  questions: [
    {
      id: 'q1', // the same id as the other pack's question
      category: 'spongebob',
      difficulty: 'hard',
      text: 'Bikini Bottom?',
      options: ['A', 'B', 'C', 'D'],
      answerIndex: 1,
      explanation: '.',
    },
  ],
})

describe('collectPacks', () => {
  it('keeps two packs apart even when they use the same ids', () => {
    const collection = collectPacks([pack('eg', 'Mısır'), themed])
    expect(collection.questions.map((question) => question.id)).toEqual(['eg:q1', 'nick:q1'])
    expect(collection.questions.map((question) => question.category)).toEqual(['eg:history', 'nick:spongebob'])
    expect(collection.templates.map((template) => template.id)).toEqual(['eg:t1', 'nick:t1'])
  })

  it('groups the categories by pack and leaves out the ones without questions', () => {
    const collection = collectPacks([themed])
    expect(collection.categoryGroups).toEqual([
      { packId: 'nick', packTitle: 'Land of Legends', categories: [{ id: 'nick:spongebob', label: 'SpongeBob' }] },
    ])
  })

  it('falls back to the built-in categories for a pack that names none', () => {
    const collection = collectPacks([pack('eg', 'Mısır')])
    expect(collection.categoryGroups[0].categories).toEqual([{ id: 'eg:history', label: 'Tarih' }])
  })

  it('is empty for a trip with no packs on the device', () => {
    expect(collectPacks([])).toEqual({ packs: [], questions: [], templates: [], categoryGroups: [] })
  })
})

describe('category labels', () => {
  it('reads the label from the pack the category belongs to', () => {
    const collection = collectPacks([pack('eg', 'Mısır'), themed])
    expect(categoryLabel(collection, 'nick:spongebob')).toBe('SpongeBob')
    expect(categoryLabel(collection, 'eg:history')).toBe('Tarih')
  })

  it('shows the bare id when that pack is no longer on the device', () => {
    expect(categoryLabel(collectPacks([]), 'eg:history')).toBe('history')
  })
})

describe('qualified ids', () => {
  it('put the pack in front and take it off again', () => {
    expect(qualify('eg', 'q1')).toBe('eg:q1')
    expect(ownId(qualify('eg', 'q1'))).toBe('q1')
  })
})
