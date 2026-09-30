import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { TRIP_KINDS } from './src/trips/types.ts'

// Read from disk, with Node's types: Vitest turns CSS imports into empty modules, even with ?raw.
const stylesheet = (file: string) => readFileSync(new URL(`./src/${file}`, import.meta.url), 'utf8')
const themeCss = stylesheet('ui/tripTheme.module.css')
const homeCss = stylesheet('screens/HomeScreen.module.css')
const countdownCss = stylesheet('ui/CountdownCard.module.css')

type Rgb = [number, number, number]

/** WCAG 2 relative luminance of an sRGB colour with 0–255 channels. */
function luminance(colour: Rgb): number {
  const [r, g, b] = colour.map((value) => {
    const c = value / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: Rgb, b: Rgb): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

/** What a translucent colour looks like laid over an opaque one. */
function over(top: Rgb, alpha: number, below: Rgb): Rgb {
  return top.map((value, i) => alpha * value + (1 - alpha) * below[i]) as Rgb
}

function hex(value: string | undefined): Rgb {
  expect(value).toMatch(/^#[0-9a-f]{6}$/i)
  return [1, 3, 5].map((i) => parseInt(value!.slice(i, i + 2), 16)) as Rgb
}

/** Every declaration block of `.name` in a stylesheet, e.g. its light and its dark one. */
function blocks(css: string, name: string): string[] {
  return [...css.matchAll(new RegExp(`\\.${name}\\s*\\{([^}]*)\\}`, 'g'))].map((match) => match[1])
}

function declaration(block: string | undefined, property: string): string | undefined {
  return new RegExp(`(?:^|;|\\s)${property}:\\s*([^;]+);`).exec(block ?? '')?.[1].trim()
}

const tripColours = TRIP_KINDS.flatMap((kind) =>
  blocks(themeCss, kind).flatMap((block) => {
    const colour = declaration(block, '--trip-color')
    return colour ? [{ kind, colour: hex(colour) }] : []
  }),
)

describe('text on a trip colour', () => {
  it('reads a colour for each of the seven holiday types', () => {
    expect(new Set(tripColours.map(({ kind }) => kind)).size).toBe(7)
  })

  it('keeps the featured trip label ("Sıradaki seyahat") at 4.5:1 or more on every one', () => {
    const veil = /^rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)$/.exec(declaration(blocks(homeCss, 'next')[0], 'background') ?? '')
    expect(veil).not.toBeNull()
    const [, r, g, b, alpha] = (veil ?? []).map(Number)
    const text = hex(declaration(blocks(homeCss, 'top')[0], 'color'))
    for (const { kind, colour } of tripColours) {
      expect(contrast(text, over([r, g, b], alpha, colour)), kind).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('keeps the plain white text of the countdown card and the featured trip at 4.5:1 or more', () => {
    const texts = [declaration(blocks(homeCss, 'top')[0], 'color'), declaration(blocks(countdownCss, 'card')[0], 'color')]
    for (const text of texts) {
      for (const { kind, colour } of tripColours) expect(contrast(hex(text), colour), kind).toBeGreaterThanOrEqual(4.5)
    }
  })
})
