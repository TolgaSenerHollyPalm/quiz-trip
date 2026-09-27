import { describe, expect, it } from 'vitest'
import { dative, locative } from './turkish.ts'

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

describe('dative', () => {
  it('adds a y after a vowel and follows the last vowel', () => {
    expect(dative('Ada')).toBe('Ada’ya')
    expect(dative('Tolga')).toBe('Tolga’ya')
    expect(dative('Ayşe')).toBe('Ayşe’ye')
    expect(dative('Deniz')).toBe('Deniz’e')
    expect(dative('Burak')).toBe('Burak’a')
    expect(dative('Öykü')).toBe('Öykü’ye')
  })

  it('gives up where a suffix cannot be judged', () => {
    expect(dative('Ali2')).toBeUndefined()
  })
})
