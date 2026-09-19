import egSharmElSheikh from '../../public/packs/eg-sharm-el-sheikh.json'
import type { Pack } from './types.ts'
import { validatePack } from './validate.ts'

// Packs built into the app, so a fresh install has something to play before it ever syncs.
export const bundledPackData: unknown[] = [egSharmElSheikh]

export function bundledPacks(): Pack[] {
  return bundledPackData.flatMap((data) => {
    const result = validatePack(data)
    if (!result.ok) console.error('A bundled pack is invalid', result.errors)
    return result.ok ? [result.pack] : []
  })
}
