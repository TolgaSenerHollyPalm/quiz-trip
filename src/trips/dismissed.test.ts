import { describe, expect, it } from 'vitest'
import { newTrip } from '../game/trip.ts'
import type { TripState } from '../game/types.ts'
import { applySuggestions } from './checklist.ts'
import { BUNDLED_DESTINATIONS } from './destinations.ts'
import { deleteItem, forgetDismissed } from './dismissed.ts'
import { applyPlaceLists } from './placeSuggestions.ts'

// An Egypt trip by plane, its lists as the wizard fills them.
const egypt = (): TripState => {
  const trip: TripState = { ...newTrip('t1', 'Sharm'), country: 'EG', transport: 'plane' }
  return { ...trip, checklist: applySuggestions(trip), ...applyPlaceLists(trip, BUNDLED_DESTINATIONS) }
}
const own = '0b8f5c2e-9d1a-4c3b-8e7f-123456789abc'

describe('deleting a suggestion (Tolga, 2026-10-22: it came back with "Önerileri yenile")', () => {
  it('keeps a deleted place suggestion out when the suggestions are refreshed', () => {
    const trip = deleteItem(egypt(), 'souvenirs', 'eg-papyrus')
    expect(trip.souvenirs.map((item) => item.id)).not.toContain('eg-papyrus')
    expect(trip.dismissed).toEqual({ souvenirs: ['eg-papyrus'] })
    expect(applyPlaceLists(trip, BUNDLED_DESTINATIONS).souvenirs.map((item) => item.id)).not.toContain('eg-papyrus')
    expect(applyPlaceLists(trip, BUNDLED_DESTINATIONS).souvenirs).toHaveLength(6)
  })

  it('keeps a deleted checklist suggestion out, through a change of transport too', () => {
    const trip = deleteItem(egypt(), 'checklist', 'common-id')
    expect(applySuggestions(trip).map((item) => item.id)).not.toContain('common-id')
    expect(applySuggestions({ ...trip, transport: 'car' }).map((item) => item.id)).not.toContain('common-id')
  })

  it('remembers an edited suggestion too, but not an item the player wrote', () => {
    const edited = { ...egypt(), tastes: egypt().tastes.map((item, i) => (i === 0 ? { id: item.id, text: 'Benim koşarim', done: false } : item)) }
    const first = edited.tastes[0].id
    expect(deleteItem(edited, 'tastes', first).dismissed).toEqual({ tastes: [first] })
    const mine = { ...egypt(), tastes: [...egypt().tastes, { id: own, text: 'Lokum', done: false }] }
    const after = deleteItem(mine, 'tastes', own)
    expect(after.dismissed).toBeUndefined()
    expect(after.tastes).toHaveLength(4)
  })

  it('leaves the trip as it was for an id it does not have, and remembers an id once', () => {
    const trip = egypt()
    expect(deleteItem(trip, 'souvenirs', 'nowhere')).toBe(trip)
    const twice = deleteItem({ ...deleteItem(trip, 'souvenirs', 'eg-papyrus'), souvenirs: trip.souvenirs }, 'souvenirs', 'eg-papyrus')
    expect(twice.dismissed).toEqual({ souvenirs: ['eg-papyrus'] })
  })

  it('brings every suggestion back when an empty list asks for the suggested list', () => {
    let trip = egypt()
    for (const item of trip.souvenirs) trip = deleteItem(trip, 'souvenirs', item.id)
    trip = deleteItem(trip, 'tastes', 'eg-koshari')
    const asked = forgetDismissed({ ...trip, souvenirs: [] }, 'souvenirs')
    expect(applyPlaceLists(asked, BUNDLED_DESTINATIONS).souvenirs).toHaveLength(7)
    expect(asked.dismissed).toEqual({ tastes: ['eg-koshari'] })
    expect(forgetDismissed(forgetDismissed(asked, 'tastes'), 'souvenirs').dismissed).toBeUndefined()
  })
})
