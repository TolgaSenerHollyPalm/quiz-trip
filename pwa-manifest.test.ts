import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { manifest } from './pwa-manifest.ts'

const icons = manifest.icons ?? []

// Width and height are the first two fields of a PNG's IHDR chunk.
function pngSize(file: string) {
  const png = readFileSync(new URL(`./public/${file}`, import.meta.url))
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) }
}

describe('web app manifest', () => {
  it('points every icon at a file in public/ with the declared size', () => {
    for (const icon of icons) {
      const [width, height] = (icon.sizes ?? '').split('x').map(Number)
      expect(pngSize(icon.src), icon.src).toEqual({ width, height })
    }
  })

  // Chrome offers "Install app" only with 192px and 512px icons; Android launchers use the maskable one.
  it('has the icons Android needs to install the app', () => {
    expect(icons.some((i) => i.sizes === '192x192' && i.purpose === 'any')).toBe(true)
    expect(icons.some((i) => i.sizes === '512x512' && i.purpose === 'any')).toBe(true)
    expect(icons.some((i) => i.sizes === '512x512' && i.purpose === 'maskable')).toBe(true)
  })
})
