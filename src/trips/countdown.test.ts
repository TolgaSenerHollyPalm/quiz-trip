import { describe, expect, it } from 'vitest'
import { countdownBadge, countdownMessage, tripPhase } from './countdown.ts'

const TODAY = '2026-10-12'

describe('tripPhase', () => {
  it('counts the days to departure', () => {
    expect(tripPhase({ startDate: '2026-10-22' }, TODAY)).toEqual({ kind: 'before', daysLeft: 10 })
    expect(tripPhase({ startDate: '2026-10-13' }, TODAY)).toEqual({ kind: 'before', daysLeft: 1 })
  })

  it('knows the departure day and the days of the trip', () => {
    expect(tripPhase({ startDate: TODAY, endDate: '2026-10-19' }, TODAY)).toEqual({ kind: 'today' })
    expect(tripPhase({ startDate: '2026-10-10', endDate: '2026-10-19' }, TODAY)).toEqual({ kind: 'during', day: 3 })
    // The last day still counts as being on the trip.
    expect(tripPhase({ startDate: '2026-10-05', endDate: TODAY }, TODAY)).toEqual({ kind: 'during', day: 8 })
  })

  it('counts the days since the trip ended', () => {
    expect(tripPhase({ startDate: '2026-10-01', endDate: '2026-10-09' }, TODAY)).toEqual({ kind: 'after', daysAgo: 3 })
  })

  it('treats a trip with no return date as a single day', () => {
    expect(tripPhase({ startDate: '2026-10-11' }, TODAY)).toEqual({ kind: 'after', daysAgo: 1 })
  })

  it('has nothing to count without a departure date', () => {
    expect(tripPhase({}, TODAY)).toEqual({ kind: 'undated' })
  })
})

describe('countdownMessage', () => {
  const messageFor = (daysLeft: number) => countdownMessage({ kind: 'before', daysLeft })

  it('gets more concrete as the trip gets closer', () => {
    expect(messageFor(60).message).toContain('Vakit bol')
    expect(messageFor(25).message).toContain('Sayılı günler')
    expect(messageFor(10).message).toContain('Valizi gözden geçirme')
    expect(messageFor(4).message).toContain('Son bir hafta')
    expect(messageFor(2).message).toContain('İki gün sonra')
  })

  it('says the day count in the title, except on the eve', () => {
    expect(messageFor(12).title).toBe('12 gün kaldı')
    expect(messageFor(1).title).toBe('Yarın yoldasın!')
  })

  it('numbers the days of the trip and celebrates the departure', () => {
    expect(countdownMessage({ kind: 'today' }).title).toBe('Bugün yola çıkıyorsun!')
    expect(countdownMessage({ kind: 'during', day: 3 }).title).toBe('Gezinin 3. günü')
  })

  it('has a line for a finished and for an undated trip', () => {
    expect(countdownMessage({ kind: 'after', daysAgo: 1 })).toEqual({
      title: 'Gezi tamamlandı',
      message: expect.stringContaining('Dün döndün'),
    })
    expect(countdownMessage({ kind: 'undated' }).message).toContain('Gidiş tarihini')
  })
})

describe('countdownBadge', () => {
  it('is a couple of words for the trip list', () => {
    expect(countdownBadge({ kind: 'before', daysLeft: 12 })).toBe('12 gün')
    expect(countdownBadge({ kind: 'today' })).toBe('Bugün')
    expect(countdownBadge({ kind: 'during', day: 2 })).toBe('2. gün')
    expect(countdownBadge({ kind: 'after', daysAgo: 4 })).toBe('Bitti')
    expect(countdownBadge({ kind: 'undated' })).toBeUndefined()
  })
})
