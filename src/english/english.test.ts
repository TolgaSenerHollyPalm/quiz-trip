import { describe, expect, it } from 'vitest'
import { newTrip } from '../game/trip.ts'
import { isAbroad, isSaved, savedItems, searchEnglish, toggleSaved } from './english.ts'

const ids = (groups: ReturnType<typeof searchEnglish>) => groups.flatMap((group) => group.found.map((found) => found.item.id))

describe('isAbroad', () => {
  it('is true for a country other than Türkiye', () => {
    expect(isAbroad({ country: 'EG' })).toBe(true)
  })

  it('is false in Türkiye and for a trip with no country', () => {
    expect(isAbroad({ country: 'TR' })).toBe(false)
    expect(isAbroad({})).toBe(false)
  })
})

describe('searchEnglish', () => {
  it('finds English typed in capitals on a Turkish keyboard', () => {
    const ids = (query: string) => searchEnglish(query).flatMap((group) => group.found.map((found) => found.item.id))
    expect(ids('CHECK-IN')).toEqual(ids('check-in'))
    expect(ids('CHECK-IN').length).toBeGreaterThan(0)
  })

  it('finds the 4 tickets, grouped by topic in content order, phrases before words', () => {
    const groups = searchEnglish('bilet')
    expect(groups.map((group) => group.topicId)).toEqual(['passport', 'transport'])
    expect(ids(groups)).toEqual(['passport-p06', 'passport-w07', 'transport-p10', 'transport-w04'])
    expect(groups[1].found.map((found) => found.kind)).toEqual(['phrase', 'word'])
  })

  it('matches case by the Turkish rules', () => {
    expect(ids(searchEnglish('BİLET'))).toEqual(ids(searchEnglish('bilet')))
    expect(ids(searchEnglish('Bilet'))).toEqual(ids(searchEnglish('bilet')))
  })

  it('ignores punctuation in the query and in the content', () => {
    expect(ids(searchEnglish('check-in'))).toContain('airport-p01')
    expect(ids(searchEnglish('check-in'))).toEqual(ids(searchEnglish('check in')))
    expect(ids(searchEnglish('bilet, lütfen.'))).toEqual(['transport-p10'])
  })

  it('searches the English too', () => {
    expect(ids(searchEnglish('bill'))).toEqual(['restaurant-p12', 'restaurant-p18', 'restaurant-w02'])
  })

  it('finds nothing for an empty query', () => {
    expect(searchEnglish('')).toEqual([])
    expect(searchEnglish('  ?! ')).toEqual([])
  })

  it('does not find suffixed forms', () => {
    expect(ids(searchEnglish('hesap'))).not.toContain('restaurant-p12') // "Hesabı alabilir miyiz?"
  })
})

describe('saving', () => {
  it('adds in the order starred and takes the star off again', () => {
    const trip = newTrip('t', 'Mısır')
    const one = toggleSaved(trip, 'restaurant-p12')
    const two = toggleSaved(one, 'basics-p01')
    expect(two.savedEnglish).toEqual(['restaurant-p12', 'basics-p01'])
    expect(isSaved(two, 'basics-p01')).toBe(true)
    const back = toggleSaved(two, 'restaurant-p12')
    expect(back.savedEnglish).toEqual(['basics-p01'])
    expect(isSaved(back, 'restaurant-p12')).toBe(false)
    expect(trip.savedEnglish).toBeUndefined()
  })

  it('is empty when the trip has never saved anything', () => {
    const trip = newTrip('t', 'Mısır')
    expect(isSaved(trip, 'basics-p01')).toBe(false)
    expect(savedItems(trip)).toEqual([])
  })

  it('lists saved items in saved order and skips an id the content no longer has', () => {
    const trip = { ...newTrip('t', 'Mısır'), savedEnglish: ['restaurant-p12', 'gone-p99', 'transport-w04'] }
    const items = savedItems(trip)
    expect(items.map((found) => found.item.id)).toEqual(['restaurant-p12', 'transport-w04'])
    expect(items.map((found) => [found.topic.id, found.kind])).toEqual([
      ['restaurant', 'phrase'],
      ['transport', 'word'],
    ])
  })
})
