import egSharmElSheikh from '../../public/packs/eg-sharm-el-sheikh.json'
import type { Pack } from './types.ts'
import { validatePack } from './validate.ts'

// Packs that travel inside the app: a trip can add one with no network at all. Nothing is installed
// until a trip asks for it, so a device never carries a pack it has no use for.
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
