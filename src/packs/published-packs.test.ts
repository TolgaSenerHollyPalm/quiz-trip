import { describe, expect, it } from 'vitest'
import { bundledPackData } from './bundled.ts'
import { validatePack } from './validate.ts'

// Runs on every deploy, so a broken pack in public/packs never reaches the phones.
const files = import.meta.glob<unknown>('../../public/packs/*.json', { eager: true, import: 'default' })
const fileName = (path: string) => path.slice(path.lastIndexOf('/') + 1)
const packFiles = Object.entries(files).filter(([path]) => fileName(path) !== 'index.json')

interface IndexEntry {
  id: string
  title: string
  country: string
  version: number
  file: string
  questionCount: number
  updatedAt: string
}
const index = files['../../public/packs/index.json'] as { schemaVersion: number; packs: IndexEntry[] }

describe('packs in public/packs', () => {
  it.each(packFiles)('%s is a valid pack', (_path, data) => {
    const result = validatePack(data)
    expect(result.ok ? [] : result.errors).toEqual([])
  })

  it('are all listed in index.json with matching details', () => {
    expect(index.schemaVersion).toBe(1)
    expect(index.packs.map((entry) => entry.file).sort()).toEqual(packFiles.map(([path]) => fileName(path)).sort())
    for (const entry of index.packs) {
      const result = validatePack(files[`../../public/packs/${entry.file}`])
      if (!result.ok) continue // reported by the test above
      const { pack } = result
      expect(entry).toEqual({
        id: pack.id,
        title: pack.title,
        country: pack.country,
        version: pack.version,
        file: entry.file,
        questionCount: pack.questions.length,
        updatedAt: pack.updatedAt,
      })
    }
  })

  it('include every pack built into the app', () => {
    for (const data of bundledPackData) expect(validatePack(data).ok).toBe(true)
  })
})
