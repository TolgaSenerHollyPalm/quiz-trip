import { describe, expect, it } from 'vitest'
import { applySuggestions } from './checklist.ts'
import type { ChecklistItem } from './types.ts'

const ids = (items: ChecklistItem[]) => items.map((item) => item.id)

describe('applySuggestions', () => {
  it('suggests the common items even without a vehicle or a holiday type', () => {
    const items = applySuggestions({ checklist: [], transport: undefined, kind: undefined })
    expect(items.every((item) => item.source === 'common')).toBe(true)
    expect(ids(items)).toContain('common-id')
    expect(items.every((item) => !item.done)).toBe(true)
  })

  it('adds the vehicle’s and the holiday type’s own items', () => {
    const items = applySuggestions({ checklist: [], transport: 'plane', kind: 'beach' })
    expect(ids(items)).toContain('plane-checkin')
    expect(ids(items)).toContain('beach-sunscreen')
    expect(items.filter((item) => item.group === 'do').map((item) => item.source)).toContain('plane')
  })

  it('suggests nothing extra for "diğer"', () => {
    const items = applySuggestions({ checklist: [], transport: 'other', kind: 'other' })
    expect(new Set(items.map((item) => item.source))).toEqual(new Set(['common']))
  })

  it('drops the old vehicle’s untouched suggestions and brings the new one’s', () => {
    const packed = applySuggestions({ checklist: [], transport: 'plane', kind: undefined })
    const items = applySuggestions({ checklist: packed, transport: 'car', kind: undefined })
    expect(ids(items)).not.toContain('plane-checkin')
    expect(ids(items)).toContain('car-toll')
    expect(ids(items)).toContain('common-id') // the common ones are never touched
  })

  it('keeps a ticked suggestion even when its vehicle is gone', () => {
    const packed = applySuggestions({ checklist: [], transport: 'plane', kind: undefined }).map((item) =>
      item.id === 'plane-headphones' ? { ...item, done: true } : item,
    )
    const items = applySuggestions({ checklist: packed, transport: 'bus', kind: undefined })
    expect(items.find((item) => item.id === 'plane-headphones')).toEqual({
      id: 'plane-headphones',
      text: 'Kulaklık ve boyun yastığı',
      group: 'pack',
      source: 'plane',
      done: true,
    })
  })

  it('never touches what the player wrote', () => {
    const own: ChecklistItem = { id: 'own-1', text: 'Fotoğraf makinesi', group: 'pack', done: false }
    const items = applySuggestions({ checklist: [own], transport: 'ferry', kind: 'city' })
    expect(items[0]).toEqual(own)
  })

  it('does not add an item twice when the choices stay the same', () => {
    const once = applySuggestions({ checklist: [], transport: 'car', kind: 'winter' })
    const twice = applySuggestions({ checklist: once, transport: 'car', kind: 'winter' })
    expect(ids(twice)).toEqual(ids(once))
  })

  it('has a list for every vehicle and holiday type it claims to know', () => {
    for (const kind of ['beach', 'hotel', 'winter', 'city', 'nature', 'business'] as const) {
      const items = applySuggestions({ checklist: [], transport: undefined, kind })
      expect(items.some((item) => item.source === kind)).toBe(true)
    }
    for (const transport of ['plane', 'car', 'bus', 'ferry'] as const) {
      const items = applySuggestions({ checklist: [], transport, kind: undefined })
      expect(items.some((item) => item.source === transport)).toBe(true)
    }
  })

  it('gives every suggestion its own id', () => {
    const items = applySuggestions({ checklist: [], transport: 'plane', kind: 'hotel' })
    expect(new Set(ids(items)).size).toBe(items.length)
  })
})
