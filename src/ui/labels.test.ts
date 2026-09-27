import { describe, expect, it } from 'vitest'
import { checklistBasis, sourceLabel } from './labels.ts'

describe('checklistBasis', () => {
  it('names both the journey and the holiday', () => {
    expect(checklistBasis('plane', 'beach')).toBe('Uçak ve deniz tatiline göre önerildi')
    expect(checklistBasis('bus', 'city')).toBe('Otobüs ve şehir gezisine göre önerildi')
    expect(checklistBasis('ferry', 'business')).toBe('Vapur ve iş seyahatine göre önerildi')
  })

  it('names only what was chosen, capitalised the Turkish way', () => {
    expect(checklistBasis('car')).toBe('Araba yolculuğuna göre önerildi')
    expect(checklistBasis(undefined, 'business')).toBe('İş seyahatine göre önerildi')
    expect(checklistBasis('other', 'winter')).toBe('Kış tatiline göre önerildi')
  })

  it('calls it your own list when nothing, or only "diğer", was chosen', () => {
    expect(checklistBasis()).toBe('Kendi listen')
    expect(checklistBasis('other', 'other')).toBe('Kendi listen')
  })
})

describe('sourceLabel', () => {
  it('reads the suggestion list an item came from', () => {
    expect(sourceLabel('common')).toBe('Genel')
    expect(sourceLabel('plane')).toBe('Uçak')
    expect(sourceLabel('beach')).toBe('Deniz')
    expect(sourceLabel(undefined)).toBeUndefined()
  })
})
