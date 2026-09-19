import { describe, expect, it } from 'vitest'
import { formatDuration, formatValue, parseDuration, parseNumber } from './values.ts'

describe('durations', () => {
  it.each([
    [0, '00:00'],
    [30, '00:30'],
    [60, '01:00'],
    [90, '01:30'],
    [600, '10:00'],
  ])('shows %i minutes as %s', (minutes, text) => {
    expect(formatDuration(minutes)).toBe(text)
  })

  it('reads hours and minutes from two fields', () => {
    expect(parseDuration('1', '30')).toBe(90)
    expect(parseDuration('01', '05')).toBe(65)
    expect(parseDuration('', '45')).toBe(45)
    expect(parseDuration('2', '')).toBe(120)
  })

  it('rejects empty, non-numeric and impossible durations', () => {
    expect(parseDuration('', '')).toBeUndefined()
    expect(parseDuration('1', '60')).toBeUndefined()
    expect(parseDuration('a', '1')).toBeUndefined()
    expect(parseDuration('100', '0')).toBeUndefined()
  })
})

describe('numbers', () => {
  it('reads a decimal comma or point', () => {
    expect(parseNumber('23,5')).toBe(23.5)
    expect(parseNumber(' 23.5 ')).toBe(23.5)
    expect(parseNumber('-2')).toBe(-2)
    expect(parseNumber('0')).toBe(0)
  })

  it('rejects anything that is not a plain number', () => {
    for (const text of ['', ' ', 'abc', '1,2,3', '12a', '--1', ',5']) expect(parseNumber(text)).toBeUndefined()
  })

  it('shows numbers the Turkish way, keeping room numbers ungrouped', () => {
    expect(formatValue(23.5)).toBe('23,5')
    expect(formatValue(1205)).toBe('1205')
    expect(formatValue(12300)).toBe('12.300')
    expect(formatValue(90, 'duration')).toBe('01:30')
  })
})
