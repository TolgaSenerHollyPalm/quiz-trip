/** Today in the device's own timezone, as YYYY-MM-DD. */
export function todayIso(now: Date = new Date()): string {
  return now.toLocaleDateString('en-CA')
}

const dayMonth = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long' })
const dayMonthYear = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })

const asDate = (iso: string) => new Date(`${iso}T00:00:00`)

/** "12 Ekim 2026" */
export function formatDate(iso: string): string {
  return dayMonthYear.format(asDate(iso))
}

/** "12 Ekim 2026" or "12 – 19 Ekim 2026", dropping the repeated year and month. */
export function formatDateRange(start: string, end?: string): string {
  if (!end || end === start) return formatDate(start)
  const sameYear = start.slice(0, 4) === end.slice(0, 4)
  const sameMonth = sameYear && start.slice(0, 7) === end.slice(0, 7)
  if (sameMonth) return `${asDate(start).getDate()} – ${formatDate(end)}`
  return `${sameYear ? dayMonth.format(asDate(start)) : formatDate(start)} – ${formatDate(end)}`
}

/** Whole days from one date to another; negative once the first date is in the past. */
export function daysBetween(from: string, to: string): number {
  const day = 24 * 60 * 60 * 1000
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / day)
}
