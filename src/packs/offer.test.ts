import { describe, expect, it } from 'vitest'
import mardinFile from '../../public/packs/tr-mardin.json'
import sharmFile from '../../public/packs/eg-sharm-el-sheikh.json'
import { newTrip } from '../game/trip.ts'
import type { TripState } from '../game/types.ts'
import { offerWaitingPacks, takeBack, type OfferDeps } from './offer.ts'
import { fetchPackList, syncPacks, type Fetcher, type PackStore } from './sync.ts'
import type { Pack } from './types.ts'

const BASE = '/quiz-trip/'
const mardin = mardinFile as unknown as Pack
const sharm = sharmFile as unknown as Pack

const entry = (pack: Pack) => ({
  id: pack.id,
  title: pack.title,
  version: pack.version,
  file: `${pack.id}.json`,
  country: pack.country,
  cityId: pack.cityId,
  questionCount: pack.questions.length,
})

/** packs/ on a fake server; `down` answers every request with a network error, as in airplane mode. */
function server(packs: Pack[], { down = false } = {}) {
  const files = new Map<string, unknown>([['index.json', { schemaVersion: 1, packs: packs.map(entry) }]])
  for (const pack of packs) files.set(`${pack.id}.json`, pack)
  const requested: string[] = []
  const fetch: Fetcher = async (url) => {
    const name = url.slice(`${BASE}packs/`.length)
    requested.push(name)
    if (down) throw new TypeError('Failed to fetch')
    return files.has(name) ? new Response(JSON.stringify(files.get(name))) : new Response('', { status: 404 })
  }
  return { fetch, requested }
}

/** The app around offerWaitingPacks: trips and packs in memory, saves and toasts written down. */
function app(trips: TripState[], fetch: Fetcher, onPhone: Pack[] = []) {
  const state = { trips, packs: onPhone, toasts: [] as string[] }
  const store: PackStore = {
    versions: async () => new Map(state.packs.map((pack) => [pack.id, pack.version])),
    saveIfNewer: async () => true,
  }
  const deps: OfferDeps = {
    trips: () => state.trips,
    packs: () => state.packs,
    bundled: [sharm],
    list: (wanted) => fetchPackList({ fetch, store, baseUrl: BASE, wanted, timeoutMs: 50 }),
    // As the provider's downloadPacks: a pack the app carries is installed without the network.
    async download(ids) {
      const fromApp = [sharm].filter((pack) => ids.includes(pack.id))
      const rest = ids.filter((id) => !fromApp.some((pack) => pack.id === id))
      const result = rest.length > 0 ? await syncPacks({ fetch, store, baseUrl: BASE, wanted: (pin) => rest.includes(pin.id), timeoutMs: 50 }) : undefined
      const saved = [...fromApp, ...(result?.ok ? result.saved : [])]
      state.packs = [...state.packs, ...saved]
      return result && !result.ok ? result : { ok: true, outcomes: [], saved }
    },
    save: (trip) => {
      state.trips = state.trips.map((other) => (other.id === trip.id ? trip : other))
    },
    added: (trip, packs) => state.toasts.push(`${trip.id}: ${packs.map((pack) => pack.id).join(', ')}`),
  }
  return { state, deps }
}

const trip = (id: string, fields: Partial<TripState>): TripState => ({ ...newTrip(id, id), ...fields })

describe('offerWaitingPacks', () => {
  it('links the pack the rule picks, clears the offer and says so', async () => {
    const { fetch } = server([mardin, sharm])
    const { state, deps } = app([trip('t1', { country: 'TR', cityId: 'mardin', packOffer: 'waiting' })], fetch)
    await offerWaitingPacks(deps)
    expect(state.trips[0].packIds).toEqual(['tr-mardin'])
    expect(state.trips[0].packOffer).toBeUndefined()
    expect(state.packs.map((pack) => pack.id)).toEqual(['tr-mardin'])
    expect(state.toasts).toEqual(['t1: tr-mardin'])
  })

  it('keeps waiting while the list cannot be read', async () => {
    const { fetch } = server([mardin], { down: true })
    const waiting = trip('t1', { country: 'TR', cityId: 'mardin', packOffer: 'waiting' })
    const { state, deps } = app([waiting], fetch)
    await offerWaitingPacks(deps)
    expect(state.trips).toEqual([waiting])
    expect(state.toasts).toEqual([])
  })

  it('keeps waiting when the pack itself fails to download', async () => {
    const { fetch } = server([mardin])
    const broken: Fetcher = (url, init) => (url.endsWith('tr-mardin.json') ? Promise.reject(new TypeError('Failed to fetch')) : fetch(url, init))
    const waiting = trip('t1', { country: 'TR', cityId: 'mardin', packOffer: 'waiting' })
    const { state, deps } = app([waiting], broken)
    await offerWaitingPacks(deps)
    expect(state.trips).toEqual([waiting])
  })

  it('never touches a declined trip, and reads nothing when no trip waits', async () => {
    const { fetch, requested } = server([mardin])
    const declined = trip('t1', { country: 'TR', cityId: 'mardin', packOffer: 'declined' })
    const { state, deps } = app([declined, trip('t2', { country: 'TR', cityId: 'mardin' })], fetch)
    await offerWaitingPacks(deps)
    expect(state.trips[0]).toEqual(declined)
    expect(requested).toEqual([])
  })

  it('settles a trip the rule has nothing for, without a toast', async () => {
    const { fetch } = server([mardin])
    const { state, deps } = app([trip('t1', { country: 'TR', packOffer: 'waiting' }), trip('t2', { country: 'FR', packOffer: 'waiting' })], fetch)
    await offerWaitingPacks(deps)
    expect(state.trips.map((t) => [t.packIds, t.packOffer])).toEqual([[['tr-mardin'], undefined], [[], undefined]])
    expect(state.toasts).toEqual(['t1: tr-mardin'])
  })

  it('downloads nothing for a pack the app carries or the phone already has', async () => {
    const { fetch, requested } = server([mardin, sharm])
    const { state, deps } = app(
      [trip('t1', { country: 'EG', packOffer: 'waiting' }), trip('t2', { country: 'TR', cityId: 'mardin', packOffer: 'waiting' })],
      fetch,
      [mardin],
    )
    await offerWaitingPacks(deps)
    expect(state.trips.map((t) => t.packIds)).toEqual([['eg-sharm-el-sheikh'], ['tr-mardin']])
    expect(requested).toEqual(['index.json'])
  })

  it('leaves a trip the player settled or deleted while the pack came down', async () => {
    const { fetch } = server([mardin])
    const { state, deps } = app([trip('t1', { country: 'TR', cityId: 'mardin', packOffer: 'waiting' })], fetch)
    const download = deps.download
    deps.download = async (ids) => {
      const result = await download(ids)
      state.trips = []
      return result
    }
    await offerWaitingPacks(deps)
    expect(state.trips).toEqual([])
    expect(state.toasts).toEqual([])
  })
})

describe('takeBack', () => {
  it('removes the packs, turns the offer down and frees what no other trip plays with', () => {
    const mine = trip('t1', { country: 'TR', cityId: 'mardin', packIds: ['tr-mardin', 'eg-sharm-el-sheikh'] })
    const other = trip('t2', { packIds: ['eg-sharm-el-sheikh'] })
    const { trip: next, unused } = takeBack(mine, ['tr-mardin', 'eg-sharm-el-sheikh'], [mine, other])
    expect(next.packIds).toEqual([])
    expect(next.packOffer).toBe('declined')
    expect(unused).toEqual(['tr-mardin'])
  })
})
