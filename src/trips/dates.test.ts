import { describe, expect, it } from 'vitest'
import { daysBetween, formatDate, formatDateRange, todayIso } from './dates.ts'

describe('dates', () => {
  it('reads today from the device clock in its own timezone', () => {
    expect(todayIso(new Date('2026-10-12T22:30:00'))).toBe('2026-10-12')
  })

  it('writes dates the Turkish way', () => {
    expect(formatDate('2026-10-12')).toBe('12 Ekim 2026')
  })

  it('shortens a range that stays in the same month or year', () => {
    expect(formatDateRange('2026-10-12')).toBe('12 Ekim 2026')
    expect(formatDateRange('2026-10-12', '2026-10-12')).toBe('12 Ekim 2026')
    expect(formatDateRange('2026-10-12', '2026-10-19')).toBe('12 – 19 Ekim 2026')
    expect(formatDateRange('2026-10-28', '2026-11-03')).toBe('28 Ekim – 3 Kasım 2026')
    expect(formatDateRange('2026-12-28', '2027-01-03')).toBe('28 Aralık 2026 – 3 Ocak 2027')
  })

  it('counts whole days, including across a daylight saving change', () => {
    expect(daysBetween('2026-10-12', '2026-10-22')).toBe(10)
    expect(daysBetween('2026-10-12', '2026-10-12')).toBe(0)
    expect(daysBetween('2026-10-12', '2026-10-11')).toBe(-1)
    expect(daysBetween('2026-03-20', '2026-04-05')).toBe(16)
  })
})
