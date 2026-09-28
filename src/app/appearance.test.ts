import { describe, expect, it } from 'vitest'
import { parseAppearance, resolveScheme } from './appearance.ts'

describe('parseAppearance', () => {
  it('keeps a fixed choice and follows the phone otherwise', () => {
    expect(parseAppearance('light')).toBe('light')
    expect(parseAppearance('dark')).toBe('dark')
    expect(parseAppearance(null)).toBe('system')
    expect(parseAppearance('sepia')).toBe('system')
  })
})

describe('resolveScheme', () => {
  it('uses the phone setting only when asked to', () => {
    expect(resolveScheme('system', true)).toBe('dark')
    expect(resolveScheme('system', false)).toBe('light')
    expect(resolveScheme('light', true)).toBe('light')
    expect(resolveScheme('dark', false)).toBe('dark')
  })
})
