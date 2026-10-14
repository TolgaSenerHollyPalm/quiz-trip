import type { TripState } from '../game/types.ts'
import { defaultPacks, matchesDestination, type PackPin } from '../trips/packMatch.ts'
import type { PackList, SyncResult } from './sync.ts'
import type { Pack } from './types.ts'

/** The trip without its pack offer: what it becomes once the offer is settled either way. */
export function settled(trip: TripState): TripState {
  const next = { ...trip }
  delete next.packOffer
  return next
}

export interface OfferDeps {
  trips: () => readonly TripState[] // as they are right now; read again after every wait
  packs: () => readonly Pack[] // on the device right now
  bundled: readonly Pack[]
  list: (wanted: (pin: PackPin) => boolean) => Promise<PackList>
  download: (packIds: string[]) => Promise<SyncResult>
  save: (trip: TripState) => void
  added: (trip: TripState, packs: Pack[]) => void
}

/**
 * Plan 10: a trip made before the pack list could be read gets the packs the rule picks once a list can be
 * read. Without a list, or when the download fails, it keeps waiting; declined trips are never touched.
 */
export async function offerWaitingPacks(deps: OfferDeps): Promise<void> {
  const waiting = deps.trips().filter((trip) => trip.packOffer === 'waiting')
  if (waiting.length === 0) return
  const listing = await deps
    .list((pin) => waiting.some((trip) => matchesDestination(pin, trip)))
    .catch((): PackList => ({ ok: false, reason: '' }))
  if (!listing.ok) return
  const candidates = [...listing.entries, ...deps.bundled, ...deps.packs()]
  for (const { id } of waiting) {
    const trip = deps.trips().find((candidate) => candidate.id === id)
    if (trip?.packOffer !== 'waiting') continue
    const wanted = defaultPacks(trip, candidates).filter((packId) => !trip.packIds.includes(packId))
    if (wanted.length === 0) {
      deps.save(settled(trip))
      continue
    }
    const missing = wanted.filter((packId) => !deps.packs().some((pack) => pack.id === packId))
    const result = missing.length > 0 ? await deps.download(missing) : undefined
    const onPhone = [...(result?.ok ? result.saved : []), ...deps.packs()]
    const added = wanted.flatMap((packId) => onPhone.find((pack) => pack.id === packId) ?? [])
    // Deleted, or settled by the player, while the packs came down.
    const latest = deps.trips().find((candidate) => candidate.id === id)
    if (added.length === 0 || latest?.packOffer !== 'waiting') continue
    const linked = added.filter((pack) => !latest.packIds.includes(pack.id))
    deps.save({ ...settled(latest), packIds: [...latest.packIds, ...linked.map((pack) => pack.id)] })
    deps.added(latest, added)
  }
}

/** "Geri al": the trip without these packs, never offered one again, and the packs no other trip plays with. */
export function takeBack(trip: TripState, packIds: readonly string[], trips: readonly TripState[]): { trip: TripState; unused: string[] } {
  return {
    trip: { ...trip, packIds: trip.packIds.filter((id) => !packIds.includes(id)), packOffer: 'declined' },
    unused: packIds.filter((id) => !trips.some((other) => other.id !== trip.id && other.packIds.includes(id))),
  }
}
