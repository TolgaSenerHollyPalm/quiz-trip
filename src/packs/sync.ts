import type { Pack } from './types.ts'
import { validatePack } from './validate.ts'

/** What syncing needs from the device's storage: only the packs, never the trips. */
export interface PackStore {
  versions(): Promise<Map<string, number>>
  /** Saves the pack in its own transaction unless the device already has that version or a newer one. */
  saveIfNewer(pack: Pack): Promise<boolean>
}

export type Fetcher = (url: string, init: RequestInit) => Promise<Response>

export type PackOutcome =
  | { id: string; title: string; status: 'added' | 'updated'; version: number }
  | { id: string; title: string; status: 'failed'; reason: string }

export type SyncResult =
  | { ok: true; outcomes: PackOutcome[]; saved: Pack[] } // no outcomes: everything was already up to date
  | { ok: false; reason: string } // index.json was unusable, so nothing changed

interface SyncOptions {
  fetch: Fetcher
  store: PackStore
  baseUrl: string // Vite's BASE_URL, e.g. "/quiz-trip/"
  /** Which packs this device has a use for; the trips decide, by where they go. */
  wanted: (pin: { id: string; country?: string; cityId?: string }) => boolean
  timeoutMs?: number
}

interface IndexEntry {
  id: string
  title: string
  version: number
  file: string
  country?: string
  cityId?: string // missing in an index written before packs were pinned
}

// A plain file name inside packs/, so an entry can never point outside that folder.
const SAFE_FILE = /^[A-Za-z0-9][A-Za-z0-9._-]*\.json$/

type Download =
  | { ok: true; data: unknown }
  | { ok: false; problem: 'timeout' | 'network' | 'not-found' | 'web-page' | 'broken' | number }

/**
 * Fetches a JSON file past the browser cache. The timeout also covers reading the body, so a stalled
 * connection (e.g. a captive in-flight Wi-Fi) cannot hang the sync.
 */
async function download(fetcher: Fetcher, url: string, timeoutMs: number): Promise<Download> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetcher(url, { cache: 'no-store', signal: controller.signal })
    if (!response.ok) return { ok: false, problem: response.status === 404 ? 'not-found' : response.status }
    const text = await response.text()
    try {
      return { ok: true, data: JSON.parse(text) }
    } catch {
      // A web page instead of JSON usually means a Wi-Fi login page; anything else is a damaged file.
      return { ok: false, problem: text.trimStart().startsWith('<') ? 'web-page' : 'broken' }
    }
  } catch {
    return { ok: false, problem: controller.signal.aborted ? 'timeout' : 'network' }
  } finally {
    clearTimeout(timer)
  }
}

function explain(problem: Exclude<Download, { ok: true }>['problem'], what: 'liste' | 'dosya'): string {
  switch (problem) {
    case 'timeout':
      return 'Sunucu zamanında yanıt vermedi. Bağlantını kontrol edip tekrar dene.'
    case 'network':
      return 'Sunucuya ulaşılamadı. Bağlantını kontrol edip tekrar dene.'
    case 'not-found':
      return what === 'liste' ? 'Paket listesi sunucuda bulunamadı.' : 'Paket dosyası sunucuda bulunamadı.'
    case 'web-page':
      return 'Sunucu yerine bir web sayfası geldi. Otel ya da uçak Wi-Fi’ında önce giriş yapman gerekebilir.'
    case 'broken':
      return what === 'liste' ? 'Paket listesi bozuk.' : 'Paket dosyası bozuk, okunamıyor.'
    default:
      return `Sunucu hata verdi (HTTP ${problem}). Biraz sonra tekrar dene.`
  }
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const newerSchema = (data: unknown) =>
  isObject(data) && typeof data.schemaVersion === 'number' && data.schemaVersion > 1

/** Reads index.json: the usable entries, plus a failure for every entry that is broken or listed twice. */
function readIndex(data: unknown): { entries: IndexEntry[]; failures: PackOutcome[] } | { reason: string } {
  if (newerSchema(data)) return { reason: 'Paket listesi uygulamanın daha yeni bir sürümü için hazırlanmış. Önce uygulamayı güncelle.' }
  if (!isObject(data) || data.schemaVersion !== 1 || !Array.isArray(data.packs)) {
    return { reason: 'Paket listesi bozuk.' }
  }
  const failures: PackOutcome[] = []
  const candidates: IndexEntry[] = []
  for (const raw of data.packs) {
    const entry = isObject(raw) ? raw : {}
    const id = typeof entry.id === 'string' && entry.id.trim() !== '' ? entry.id : undefined
    const title = typeof entry.title === 'string' && entry.title.trim() !== '' ? entry.title : (id ?? '?')
    const { version, file } = entry
    const country = typeof entry.country === 'string' ? entry.country : undefined
    const cityId = typeof entry.cityId === 'string' ? entry.cityId : undefined
    if (!id || typeof version !== 'number' || !Number.isInteger(version) || version < 1 || typeof file !== 'string' || !SAFE_FILE.test(file) || file === 'index.json') {
      failures.push({ id: id ?? '?', title, status: 'failed', reason: 'Paket listesindeki bilgileri eksik ya da hatalı.' })
      continue
    }
    candidates.push({ id, title, version, file, ...(country && { country }), ...(cityId && { cityId }) })
  }
  // An id listed twice is ambiguous: skip every copy rather than guess which one is meant.
  const counts = new Map<string, number>()
  for (const entry of candidates) counts.set(entry.id, (counts.get(entry.id) ?? 0) + 1)
  const entries = candidates.filter((entry) => counts.get(entry.id) === 1)
  for (const entry of candidates.filter((c) => counts.get(c.id)! > 1)) {
    if (!failures.some((failure) => failure.id === entry.id)) {
      failures.push({ id: entry.id, title: entry.title, status: 'failed', reason: 'Paket listesinde iki kez yazılmış.' })
    }
  }
  return { entries, failures }
}

async function syncOne(entry: IndexEntry, isNew: boolean, options: Required<SyncOptions>): Promise<{ outcome?: PackOutcome; pack?: Pack }> {
  const { id, title, version } = entry
  const fail = (reason: string) => ({ outcome: { id, title, status: 'failed' as const, reason } })

  const file = await download(options.fetch, `${options.baseUrl}packs/${entry.file}`, options.timeoutMs)
  if (!file.ok) return fail(explain(file.problem, 'dosya'))
  if (newerSchema(file.data)) return fail('Bu paket uygulamanın daha yeni bir sürümünü gerektiriyor. Önce uygulamayı güncelle.')

  const check = validatePack(file.data)
  if (!check.ok) {
    const more = check.errors.length > 1 ? ` (ve ${check.errors.length - 1} hata daha)` : ''
    return fail(`Dosyada hata var: ${check.errors[0]}${more}`)
  }
  const { pack } = check
  if (pack.id !== id) return fail('Dosyadaki paket, listedeki paketle aynı değil.')
  // Right after a deploy the CDN may still hand out the previous file for up to ten minutes.
  if (pack.version !== version) return fail('Sunucudaki dosya henüz güncellenmemiş. Birkaç dakika sonra tekrar dene.')

  try {
    if (!(await options.store.saveIfNewer(pack))) return {} // a newer copy got there first
  } catch {
    return fail('Telefona kaydedilemedi. Telefonda yer kalmamış olabilir.')
  }
  return { outcome: { id, title: pack.title, status: isNew ? 'added' : 'updated', version }, pack }
}

/**
 * Brings the device's wanted packs up to date with packs/index.json. Every pack is handled on its own: one that fails
 * to download, is broken or cannot be saved keeps its old copy while the others still update. Packs missing
 * from the index stay on the device, and a pack is never replaced by an older version.
 */
export async function syncPacks(options: SyncOptions): Promise<SyncResult> {
  const settings = { timeoutMs: 20_000, ...options }
  const index = await download(settings.fetch, `${settings.baseUrl}packs/index.json`, settings.timeoutMs)
  if (!index.ok) return { ok: false, reason: explain(index.problem, 'liste') }
  const read = readIndex(index.data)
  if ('reason' in read) return { ok: false, reason: read.reason }

  let local: Map<string, number>
  try {
    local = await settings.store.versions()
  } catch {
    return { ok: false, reason: 'Telefondaki paketler okunamadı.' }
  }

  const outcomes = [...read.failures]
  const saved: Pack[] = []
  for (const entry of read.entries.filter(settings.wanted)) {
    const current = local.get(entry.id)
    if (current !== undefined && current >= entry.version) continue
    const { outcome, pack } = await syncOne(entry, current === undefined, settings)
    if (outcome) outcomes.push(outcome)
    if (pack) saved.push(pack)
  }
  return { ok: true, outcomes, saved }
}

/**
 * Reads only index.json (a few hundred bytes, no pack files) and counts the wanted packs the device is
 * missing or has in an older version. undefined means the check itself did not work, e.g. there is no usable connection.
 */
export async function countUpdatablePacks(options: SyncOptions): Promise<number | undefined> {
  const settings = { timeoutMs: 20_000, ...options }
  const index = await download(settings.fetch, `${settings.baseUrl}packs/index.json`, settings.timeoutMs)
  if (!index.ok) return undefined
  const read = readIndex(index.data)
  if ('reason' in read) return undefined
  try {
    const local = await settings.store.versions()
    return read.entries.filter(settings.wanted).filter((entry) => {
      const current = local.get(entry.id)
      return current === undefined || current < entry.version
    }).length
  } catch {
    return undefined
  }
}

/** The in-memory pack list after a sync: saved packs replace their old copies, the list stays sorted by title. */
export function mergePacks(current: readonly Pack[], saved: readonly Pack[]): Pack[] {
  const byId = new Map(current.map((pack) => [pack.id, pack]))
  for (const pack of saved) byId.set(pack.id, pack)
  return [...byId.values()].sort((a, b) => a.title.localeCompare(b.title, 'tr'))
}
