/** Minutes as HH:MM, e.g. 90 -> "01:30". */
export function formatDuration(minutes: number): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
}

// Groups thousands only from five digits, so a room number stays "1205" but steps read "12.300".
const numberFormat = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 3, useGrouping: 'min2' })

/** A value as players read it: 23,5 / 12.300 / 01:30. */
export function formatValue(value: number, format?: 'duration'): string {
  return format === 'duration' ? formatDuration(value) : numberFormat.format(value)
}

/** Reads "23,5" or "23.5"; anything but a plain number gives undefined. */
export function parseNumber(text: string): number | undefined {
  const trimmed = text.trim()
  return /^-?\d+([.,]\d+)?$/.test(trimmed) ? Number(trimmed.replace(',', '.')) : undefined
}

/** Reads hours and minutes typed into two fields; an empty field counts as 0, both empty as nothing. */
export function parseDuration(hours: string, minutes: string): number | undefined {
  const h = hours.trim()
  const m = minutes.trim()
  if ((h === '' && m === '') || !/^\d{0,2}$/.test(h) || !/^\d{0,2}$/.test(m)) return undefined
  if (Number(m) > 59) return undefined
  return Number(h) * 60 + Number(m)
}
