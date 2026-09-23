import egSharmElSheikh from '../../public/packs/eg-sharm-el-sheikh.json'
import type { Pack } from './types.ts'
import { validatePack } from './validate.ts'

// Packs built into the app, so a fresh install has something to play before it ever syncs.
export const bundledPackData: unknown[] = [egSharmElSheikh]

let checked: Pack[] | undefined

export function bundledPacks(): Pack[] {
  checked ??= bundledPackData.flatMap((data) => {
    const result = validatePack(data)
    if (!result.ok) console.error('A bundled pack is invalid', result.errors)
    return result.ok ? [result.pack] : []
  })
  return checked
}

/** A bundled pack comes back (empty) the next time the app starts, even after it is deleted. */
export function isBundledPack(packId: string): boolean {
  return bundledPacks().some((pack) => pack.id === packId)
}
