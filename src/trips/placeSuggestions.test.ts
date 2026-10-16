import { describe, expect, it } from 'vitest'
import { BUNDLED_DESTINATIONS, type Country } from './destinations.ts'
import { editNote, toggleNote } from './notes.ts'
import { applyPlaceLists, applyPlaceSuggestions, placeNames, placeSuggestions } from './placeSuggestions.ts'
import type { NoteItem } from './types.ts'

const egypt = { country: 'EG', cityId: 'sharm-el-sheikh' }
const mardin = { country: 'TR', cityId: 'mardin' }
const fill = (items: NoteItem[], destination: { country?: string; cityId?: string }, list: 'souvenirs' | 'tastes') =>
  applyPlaceSuggestions(items, placeSuggestions(BUNDLED_DESTINATIONS, destination, list))
const ids = (items: NoteItem[]) => items.map((item) => item.id)

describe('placeSuggestions', () => {
  it('gives an Egypt trip the country’s lists, whichever city it goes to', () => {
    for (const destination of [egypt, { country: 'EG' }]) {
      const [souvenirs] = placeSuggestions(BUNDLED_DESTINATIONS, destination, 'souvenirs')
      expect(souvenirs.source).toBe('EG')
      expect(souvenirs.items).toHaveLength(7)
      expect(placeSuggestions(BUNDLED_DESTINATIONS, destination, 'tastes')[0].items).toHaveLength(4)
    }
  })

  it('gives a city’s list to that city only', () => {
    expect(placeSuggestions(BUNDLED_DESTINATIONS, mardin, 'souvenirs').map((place) => place.source)).toEqual(['TR/mardin'])
    expect(placeSuggestions(BUNDLED_DESTINATIONS, { country: 'TR', cityId: 'antalya' }, 'souvenirs')).toEqual([])
    expect(placeSuggestions(BUNDLED_DESTINATIONS, { country: 'TR' }, 'tastes')).toEqual([])
    expect(placeSuggestions(BUNDLED_DESTINATIONS, {}, 'tastes')).toEqual([])
  })

  it('puts the country’s list before the city’s when both have one', () => {
    const countries: Country[] = [
      {
        code: 'IT',
        name: 'İtalya',
        tastes: [{ id: 'it-gelato', text: 'Gelato' }],
        cities: [{ id: 'napoli', name: 'Napoli', tastes: [{ id: 'napoli-pizza', text: 'Pizza' }] }],
      },
    ]
    const lists = placeSuggestions(countries, { country: 'IT', cityId: 'napoli' }, 'tastes')
    expect(lists.map((place) => place.source)).toEqual(['IT', 'IT/napoli'])
    expect(placeNames(countries, lists)).toEqual(['İtalya', 'Napoli'])
  })
})

describe('placeNames', () => {
  it('names the country for a country list and the city for a city list', () => {
    expect(placeNames(BUNDLED_DESTINATIONS, placeSuggestions(BUNDLED_DESTINATIONS, egypt, 'tastes'))).toEqual(['Mısır'])
    expect(placeNames(BUNDLED_DESTINATIONS, placeSuggestions(BUNDLED_DESTINATIONS, mardin, 'tastes'))).toEqual(['Mardin'])
  })
})

describe('applyPlaceSuggestions', () => {
  it('fills a new Egypt trip’s lists with 7 and 4 unticked items and their notes', () => {
    const souvenirs = fill([], egypt, 'souvenirs')
    const tastes = fill([], egypt, 'tastes')
    expect([souvenirs.length, tastes.length]).toEqual([7, 4])
    expect(souvenirs[0]).toEqual({
      id: 'eg-papyrus',
      text: 'Papirüs resmi',
      note: 'Gerçeği bükülünce çatlamaz, ışıkta lifleri görünür',
      source: 'EG',
      done: false,
    })
    expect([...souvenirs, ...tastes].every((item) => !item.done && item.source === 'EG')).toBe(true)
  })

  it('moving from Egypt to Mardin keeps what was ticked or written and swaps the rest', () => {
    const own: NoteItem = { id: 'own-1', text: 'Lokum', done: false }
    const egyptList = toggleNote([own, ...fill([], egypt, 'souvenirs')], 'eg-cotton')
    const items = fill(egyptList, mardin, 'souvenirs')

    expect(items.slice(0, 2)).toEqual([own, { ...egyptList.find((item) => item.id === 'eg-cotton'), done: true }])
    expect(ids(items).filter((id) => id.startsWith('eg-'))).toEqual(['eg-cotton'])
    expect(ids(items.slice(2))).toEqual(['mardin-telkari', 'mardin-copper', 'mardin-bittim', 'mardin-almond', 'mardin-menengic'])
    expect(items.slice(2).every((item) => item.source === 'TR/mardin' && !item.done)).toBe(true)
  })

  it('keeps a suggestion the player edited, without adding it again', () => {
    const edited = editNote(fill([], egypt, 'tastes'), 'eg-koshari', { text: 'Koşari', note: 'Abou Tarek’te' })
    const items = fill(edited, mardin, 'tastes')
    expect(items.find((item) => item.id === 'eg-koshari')).toEqual({ id: 'eg-koshari', text: 'Koşari', note: 'Abou Tarek’te', done: false })
    expect(fill(items, egypt, 'tastes').filter((item) => item.id === 'eg-koshari')).toHaveLength(1)
  })

  it('changes nothing when applied twice', () => {
    const once = fill([{ id: 'own-1', text: 'Lokum', done: true }], egypt, 'souvenirs')
    expect(fill(once, egypt, 'souvenirs')).toEqual(once)
  })

  it('takes a place’s untouched suggestions away when the place has none for the list', () => {
    const items = fill(fill([], egypt, 'tastes'), { country: 'TR', cityId: 'antalya' }, 'tastes')
    expect(items).toEqual([])
  })
})

describe('applyPlaceLists', () => {
  it('brings both lists of a trip in line with its place', () => {
    const lists = applyPlaceLists({ ...mardin, souvenirs: [], tastes: [{ id: 'own-1', text: 'Künefe', done: false }] }, BUNDLED_DESTINATIONS)
    expect(lists.souvenirs).toHaveLength(5)
    expect(ids(lists.tastes)).toEqual(['own-1', 'mardin-kaburga', 'mardin-sembusek', 'mardin-harire', 'mardin-mirra'])
  })
})
