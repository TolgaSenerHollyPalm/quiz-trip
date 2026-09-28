import { describe, expect, it } from 'vitest'
import { locative } from './turkish.ts'

describe('locative', () => {
  it('follows the last vowel and hardens after a voiceless consonant', () => {
    expect(locative('Deniz')).toBe('Deniz’de')
    expect(locative('Ada')).toBe('Ada’da')
    expect(locative('Tolga')).toBe('Tolga’da')
    expect(locative('Ayşe')).toBe('Ayşe’de')
    expect(locative('Murat')).toBe('Murat’ta')
    expect(locative('Zeynep')).toBe('Zeynep’te')
    expect(locative('Işık')).toBe('Işık’ta')
    expect(locative('Ümit')).toBe('Ümit’te')
  })

  it('gives up on names that end in a digit or have no vowel', () => {
    expect(locative('Ali2')).toBeUndefined()
    expect(locative('TRT')).toBeUndefined()
    expect(locative('  ')).toBeUndefined()
  })
})
