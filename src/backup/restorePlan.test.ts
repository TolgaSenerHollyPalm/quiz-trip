import { describe, expect, it } from 'vitest'
import { newTrip } from '../game/trip.ts'
import type { TripState } from '../game/types.ts'
import type { Pack } from '../packs/types.ts'
import { planRestore } from './restorePlan.ts'

const trip = (id: string, updatedAt?: string, name = id): TripState => ({ ...newTrip(id, name), ...(updatedAt && { updatedAt }) })
const pack = (id: string, version: number) => ({ id, version }) as Pack

describe('planRestore: merge', () => {
  const local = {
    trips: [trip('a', '2026-09-10T10:00:00Z', 'a here'), trip('b', '2026-09-20T10:00:00Z', 'b here'), trip('c', undefined, 'c here')],
    packs: [pack('eg', 4), pack('tr', 3)],
  }
  const incoming = {
    trips: [trip('a', '2026-09-15T10:00:00Z', 'a there'), trip('b', '2026-09-01T10:00:00Z', 'b there'), trip('d', '2026-08-01T10:00:00Z')],
    packs: [pack('eg', 5), pack('tr', 2), pack('gr', 1)],
  }
  const plan = planRestore(local, incoming, 'merge')

  it('writes only what is new or newer, and deletes nothing', () => {
    expect(plan.clear).toBe(false)
    expect(plan.trips.map((t) => t.name)).toEqual(['a there', 'd'])
    expect(plan.packs).toEqual([pack('eg', 5), pack('gr', 1)])
  })

  it('counts what changed and what the device ends up with', () => {
    expect(plan.counts).toEqual([
      { key: 'trips', label: 'seyahat', added: 1, updated: 1, total: 4 },
      { key: 'packs', label: 'soru paketi', added: 1, updated: 1, total: 3 },
    ])
  })

  it('finds nothing to do when the device already has it all', () => {
    const again = planRestore(local, local, 'merge')
    expect(again.trips).toEqual([])
    expect(again.packs).toEqual([])
    expect(again.counts.every((c) => c.added === 0 && c.updated === 0)).toBe(true)
  })
})

describe('planRestore: replace', () => {
  it('empties both stores and writes the backup as it is', () => {
    const incoming = { trips: [trip('x', '2026-01-01T00:00:00Z')], packs: [pack('eg', 1)] }
    const plan = planRestore({ trips: [trip('a'), trip('b')], packs: [pack('eg', 5)] }, incoming, 'replace')
    expect(plan).toEqual({
      clear: true,
      trips: incoming.trips,
      packs: incoming.packs,
      counts: [
        { key: 'trips', label: 'seyahat', added: 1, updated: 0, total: 1 },
        { key: 'packs', label: 'soru paketi', added: 1, updated: 0, total: 1 },
      ],
    })
  })
})
