import { describe, expect, it } from 'vitest'
import { daysBetween, formatDate, formatDateRange, formatDateRangeShort, todayIso, tripLength } from './dates.ts'

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

describe('formatDateRangeShort', () => {
  it('leaves the year out when every date is in this year', () => {
    expect(formatDateRangeShort('2026-10-14', '2026-10-21', '2026-09-27')).toBe('14 – 21 Ekim')
    expect(formatDateRangeShort('2026-10-28', '2026-11-03', '2026-09-27')).toBe('28 Ekim – 3 Kasım')
    expect(formatDateRangeShort('2026-10-14', undefined, '2026-09-27')).toBe('14 Ekim')
  })

  it('keeps the year for a trip in another year', () => {
    expect(formatDateRangeShort('2027-01-03', '2027-01-06', '2026-09-27')).toBe('3 – 6 Ocak 2027')
    expect(formatDateRangeShort('2026-12-28', '2027-01-03', '2026-09-27')).toBe('28 Aralık 2026 – 3 Ocak 2027')
  })
})

describe('tripLength', () => {
  it('counts both the first and the last day', () => {
    expect(tripLength('2026-10-14', '2026-10-21')).toBe(8)
    expect(tripLength('2026-10-14', '2026-10-14')).toBe(1)
    expect(tripLength('2026-10-14')).toBe(1)
  })
})
