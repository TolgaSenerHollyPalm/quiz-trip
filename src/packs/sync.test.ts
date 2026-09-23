import { describe, expect, it } from 'vitest'
import { countUpdatablePacks, mergePacks, syncPacks, type Fetcher, type PackStore } from './sync.ts'
import type { Pack } from './types.ts'

const BASE = '/quiz-trip/'

function pack(id: string, version: number, overrides: Partial<Pack> = {}): Pack {
  return {
    schemaVersion: 1,
    id,
    title: `Paket ${id}`,
    country: 'EG',
    city: 'Test',
    version,
    updatedAt: '2026-09-19',
    questions: [
      {
        id: 'q1',
        category: 'history',
        difficulty: 'easy',
        text: 'Soru?',
        options: ['A', 'B', 'C', 'D'],
        answerIndex: 0,
        explanation: 'Çünkü.',
      },
    ],
    predictionTemplates: [],
    ...overrides,
  }
}

const entry = (p: Pack, file = `${p.id}.json`) => ({
  id: p.id,
  title: p.title,
  country: p.country,
  version: p.version,
  file,
  questionCount: p.questions.length,
  updatedAt: p.updatedAt,
})

const index = (...entries: unknown[]) => ({ schemaVersion: 1, packs: entries })

type Reply = (init: RequestInit) => Promise<Response>

/** A fake web server for packs/: objects are sent as JSON, strings as they are, functions for special cases. */
function server(files: Record<string, unknown>) {
  const requests: { url: string; cache?: RequestCache }[] = []
  const fetch: Fetcher = async (url, init) => {
    requests.push({ url, cache: init.cache })
    const name = url.slice(`${BASE}packs/`.length)
    if (!(name in files)) return new Response('<html>Not found</html>', { status: 404 })
    const body = files[name]
    if (typeof body === 'function') return (body as Reply)(init)
    return new Response(typeof body === 'string' ? body : JSON.stringify(body))
  }
  const requested = () => requests.map((request) => request.url.slice(`${BASE}packs/`.length))
  return { fetch, requests, requested }
}

/** The phone's pack storage, in memory. */
function device(packs: Pack[] = [], { failOn }: { failOn?: string } = {}) {
  const stored = new Map(packs.map((p) => [p.id, p]))
  const store: PackStore = {
    async versions() {
      return new Map([...stored.values()].map((p) => [p.id, p.version]))
    },
    async saveIfNewer(p) {
      if (p.id === failOn) throw new DOMException('Disk full', 'QuotaExceededError')
      const current = stored.get(p.id)
      if (current && current.version >= p.version) return false
      stored.set(p.id, p)
      return true
    },
  }
  return { store, stored }
}

const run = (fetch: Fetcher, store: PackStore) => syncPacks({ fetch, store, baseUrl: BASE, timeoutMs: 50 })

describe('syncPacks', () => {
  it('downloads a pack that is new to the device', async () => {
    const a = pack('a', 1)
    const b = pack('b', 1)
    const { fetch, requests, requested } = server({ 'index.json': index(entry(a), entry(b)), 'b.json': b })
    const { store, stored } = device([a])

    const result = await run(fetch, store)

    expect(result).toEqual({ ok: true, outcomes: [{ id: 'b', title: 'Paket b', status: 'added', version: 1 }], saved: [b] })
    expect(stored.get('b')).toEqual(b)
    expect(requested()).toEqual(['index.json', 'b.json'])
    expect(requests.every((request) => request.cache === 'no-store')).toBe(true)
  })

  it('updates a pack whose version went up', async () => {
    const newer = pack('a', 2, { title: 'Yeni başlık' })
    const { fetch } = server({ 'index.json': index(entry(newer)), 'a.json': newer })
    const { store, stored } = device([pack('a', 1)])

    const result = await run(fetch, store)

    expect(result).toMatchObject({ ok: true, outcomes: [{ id: 'a', title: 'Yeni başlık', status: 'updated', version: 2 }] })
    expect(stored.get('a')?.version).toBe(2)
  })

  it('leaves packs at the same or an older version alone', async () => {
    const onDevice = [pack('a', 3), pack('b', 2)]
    const { fetch, requested } = server({ 'index.json': index(entry(pack('a', 3)), entry(pack('b', 1))) })
    const { store, stored } = device(onDevice)

    expect(await run(fetch, store)).toEqual({ ok: true, outcomes: [], saved: [] })
    expect(requested()).toEqual(['index.json'])
    expect([...stored.values()]).toEqual(onDevice)
  })

  it('keeps packs that are no longer listed', async () => {
    const { fetch } = server({ 'index.json': index(entry(pack('a', 1))) })
    const { store, stored } = device([pack('a', 1), pack('c', 1)])

    await run(fetch, store)

    expect(stored.has('c')).toBe(true)
  })

  it('keeps the old copy when the new file is not valid JSON', async () => {
    const old = pack('a', 1)
    const { fetch } = server({ 'index.json': index(entry(pack('a', 2))), 'a.json': '{"schemaVersion": 1, "id": ' })
    const { store, stored } = device([old])

    const result = await run(fetch, store)

    expect(result).toMatchObject({
      ok: true,
      outcomes: [{ id: 'a', status: 'failed', reason: 'Paket dosyası bozuk, okunamıyor.' }],
      saved: [],
    })
    expect(stored.get('a')).toBe(old)
  })

  it('keeps the old copy when the new file breaks the pack rules', async () => {
    const broken = pack('a', 2)
    broken.questions[0].answerIndex = 7
    const { fetch } = server({ 'index.json': index(entry(broken)), 'a.json': broken })
    const { store, stored } = device([pack('a', 1)])

    const result = await run(fetch, store)

    expect(result).toMatchObject({
      ok: true,
      outcomes: [{ id: 'a', status: 'failed', reason: expect.stringContaining('Dosyada hata var: Soru q1: answerIndex') }],
    })
    expect(stored.get('a')?.version).toBe(1)
  })

  it('updates the good packs even when another one fails', async () => {
    const goodA = pack('a', 2)
    const { fetch } = server({ 'index.json': index(entry(goodA), entry(pack('b', 2))), 'a.json': goodA, 'b.json': '<html>' })
    const { store, stored } = device([pack('a', 1), pack('b', 1)])

    const result = await run(fetch, store)

    expect(result).toMatchObject({
      ok: true,
      outcomes: [
        { id: 'a', status: 'updated' },
        { id: 'b', status: 'failed', reason: expect.stringContaining('web sayfası') },
      ],
    })
    expect(stored.get('a')?.version).toBe(2)
    expect(stored.get('b')?.version).toBe(1)
  })

  it('never lets a file overwrite a different pack', async () => {
    const { fetch } = server({ 'index.json': index(entry(pack('b', 1))), 'b.json': pack('a', 5) })
    const { store, stored } = device([pack('a', 1)])

    const result = await run(fetch, store)

    expect(result).toMatchObject({ outcomes: [{ id: 'b', status: 'failed', reason: expect.stringContaining('aynı değil') }] })
    expect(stored.get('a')?.version).toBe(1)
    expect(stored.has('b')).toBe(false)
  })

  it('asks to try again later while the server still hands out the previous file', async () => {
    const { fetch } = server({ 'index.json': index(entry(pack('a', 2))), 'a.json': pack('a', 1) })
    const { store, stored } = device([pack('a', 1)])

    const result = await run(fetch, store)

    expect(result).toMatchObject({ outcomes: [{ status: 'failed', reason: expect.stringContaining('henüz güncellenmemiş') }] })
    expect(stored.get('a')?.version).toBe(1)
  })

  it.each<[string, Record<string, unknown>, string]>([
    ['is missing', {}, 'bulunamadı'],
    ['is an HTML page, e.g. a Wi-Fi login', { 'index.json': '<!doctype html><title>Giriş</title>' }, 'Wi-Fi'],
    ['comes with a server error', { 'index.json': () => Promise.resolve(new Response('', { status: 503 })) }, 'HTTP 503'],
    ['is for a newer app', { 'index.json': { schemaVersion: 2, packs: [] } }, 'uygulamayı güncelle'],
    ['has the wrong shape', { 'index.json': { packs: 'x' } }, 'bozuk'],
    ['is cut off halfway', { 'index.json': '{"schemaVersion": 1, "packs": [' }, 'Paket listesi bozuk'],
  ])('changes nothing when index.json %s', async (_case, files, reason) => {
    const { fetch } = server(files)
    const { store, stored } = device([pack('a', 1)])

    const result = await run(fetch, store)

    expect(result).toEqual({ ok: false, reason: expect.stringContaining(reason) })
    expect(stored.get('a')?.version).toBe(1)
  })

  it('changes nothing when the server cannot be reached', async () => {
    const fetch: Fetcher = () => Promise.reject(new TypeError('Failed to fetch'))
    const { store } = device()
    expect(await run(fetch, store)).toEqual({ ok: false, reason: expect.stringContaining('ulaşılamadı') })
  })

  it('gives up on a file that never finishes downloading', async () => {
    const neverAnswers: Reply = (init) =>
      new Promise((_, reject) => {
        init.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
      })
    const { fetch } = server({ 'index.json': index(entry(pack('a', 1))), 'a.json': neverAnswers })
    const { store } = device()

    const result = await run(fetch, store)

    expect(result).toMatchObject({ outcomes: [{ id: 'a', status: 'failed', reason: expect.stringContaining('zamanında') }] })
  })

  it('skips broken or doubled index entries and still handles the rest', async () => {
    const b = pack('b', 1)
    const { fetch, requested } = server({
      'index.json': index(
        { id: 'x', title: 'Eksik' },
        { ...entry(pack('evil', 1)), file: '../index.html' },
        entry(pack('d', 1)),
        entry(pack('d', 2)),
        entry(b),
      ),
      'b.json': b,
    })
    const { store, stored } = device()

    const result = await run(fetch, store)

    expect(result).toMatchObject({
      ok: true,
      outcomes: [
        { id: 'x', status: 'failed' },
        { id: 'evil', status: 'failed' },
        { id: 'd', status: 'failed', reason: expect.stringContaining('iki kez') },
        { id: 'b', status: 'added' },
      ],
    })
    expect(requested()).toEqual(['index.json', 'b.json'])
    expect([...stored.keys()]).toEqual(['b'])
  })

  it('reports a pack that cannot be saved and carries on with the others', async () => {
    const a = pack('a', 1)
    const b = pack('b', 1)
    const { fetch } = server({ 'index.json': index(entry(a), entry(b)), 'a.json': a, 'b.json': b })
    const { store, stored } = device([], { failOn: 'a' })

    const result = await run(fetch, store)

    expect(result).toMatchObject({
      outcomes: [
        { id: 'a', status: 'failed', reason: expect.stringContaining('kaydedilemedi') },
        { id: 'b', status: 'added' },
      ],
    })
    expect([...stored.keys()]).toEqual(['b'])
  })
})

describe('countUpdatablePacks', () => {
  const count = (fetch: Fetcher, store: PackStore) => countUpdatablePacks({ fetch, store, baseUrl: BASE, timeoutMs: 50 })

  it('counts the packs that are new or newer, without downloading any of them', async () => {
    const { fetch, requested } = server({
      'index.json': index(entry(pack('a', 2)), entry(pack('b', 1)), entry(pack('c', 1))),
    })
    const { store } = device([pack('a', 1), pack('c', 1)])

    expect(await count(fetch, store)).toBe(2) // a is newer, b is new, c is up to date
    expect(requested()).toEqual(['index.json'])
  })

  it('counts nothing when every pack is up to date', async () => {
    const { fetch } = server({ 'index.json': index(entry(pack('a', 2))) })
    const { store } = device([pack('a', 2)])
    expect(await count(fetch, store)).toBe(0)
  })

  it('answers "unknown" when the list cannot be read', async () => {
    const offline: Fetcher = () => Promise.reject(new TypeError('Failed to fetch'))
    expect(await count(offline, device().store)).toBeUndefined()
    const { fetch } = server({ 'index.json': '<html>Giriş</html>' })
    expect(await count(fetch, device().store)).toBeUndefined()
  })
})

describe('mergePacks', () => {
  it('replaces updated packs, adds new ones and keeps Turkish title order', () => {
    const current = [pack('eg', 1, { title: 'Mısır' }), pack('cz', 1, { title: 'Cezayir' })]
    const saved = [pack('eg', 2, { title: 'Mısır' }), pack('cn', 1, { title: 'Çin' })]
    const merged = mergePacks(current, saved)
    expect(merged.map((p) => `${p.title} v${p.version}`)).toEqual(['Cezayir v1', 'Çin v1', 'Mısır v2'])
  })
})
