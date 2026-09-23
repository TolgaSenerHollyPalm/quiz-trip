import type { TripState } from '../game/types.ts'
import { daysBetween } from './dates.ts'

/** Where a trip stands today. */
export type TripPhase =
  | { kind: 'undated' }
  | { kind: 'before'; daysLeft: number }
  | { kind: 'today' }
  | { kind: 'during'; day: number } // 2 on the day after departure
  | { kind: 'after'; daysAgo: number }

type Dates = Pick<TripState, 'startDate' | 'endDate'>

/** A trip without a return date lasts its departure day only — the same rule the trip list sorts by. */
export function tripPhase(trip: Dates, today: string): TripPhase {
  if (!trip.startDate) return { kind: 'undated' }
  const daysLeft = daysBetween(today, trip.startDate)
  if (daysLeft > 0) return { kind: 'before', daysLeft }
  if (daysLeft === 0) return { kind: 'today' }
  const daysAgo = daysBetween(trip.endDate ?? trip.startDate, today)
  return daysAgo > 0 ? { kind: 'after', daysAgo } : { kind: 'during', day: 1 - daysLeft }
}

export interface CountdownMessage {
  title: string
  message: string
}

/** The countdown card's two lines: where the trip is, and what to do about it today. */
export function countdownMessage(phase: TripPhase): CountdownMessage {
  switch (phase.kind) {
    case 'undated':
      return { title: 'Tarih girilmedi', message: 'Gidiş tarihini eklersen sayaç başlar.' }
    case 'before':
      return phase.daysLeft === 1
        ? { title: 'Yarın yoldasın!', message: 'Son kontrol: kimlik, bilet, şarj aleti.' }
        : { title: `${phase.daysLeft} gün kaldı`, message: beforeMessage(phase.daysLeft) }
    case 'today':
      return { title: 'Bugün yola çıkıyorsun!', message: 'İyi yolculuk. Listede işaretlenmemiş bir şey kaldı mı?' }
    case 'during':
      return {
        title: `Gezinin ${phase.day}. günü`,
        message: 'Keyfini çıkar. Canın sıkılırsa bilgi yarışması ve tahminler burada.',
      }
    case 'after':
      return {
        title: 'Gezi tamamlandı',
        message: phase.daysAgo === 1 ? 'Dün döndün. Umarız harikaydı.' : 'Umarız harikaydı. Skorlara bakmayı unutma.',
      }
  }
}

/** The short form for the trip list; an undated trip has nothing to show. */
export function countdownBadge(phase: TripPhase): string | undefined {
  switch (phase.kind) {
    case 'undated':
      return undefined
    case 'before':
      return `${phase.daysLeft} gün`
    case 'today':
      return 'Bugün'
    case 'during':
      return `${phase.day}. gün`
    case 'after':
      return 'Bitti'
  }
}

/** The closer the trip, the more concrete the nudge. */
function beforeMessage(daysLeft: number): string {
  if (daysLeft > 30) return 'Vakit bol. Rotayı ve hazırlık listesini şimdiden şekillendirebilirsin.'
  if (daysLeft > 14) return 'Sayılı günler başladı. Listeye göz at, eksikleri not et.'
  if (daysLeft > 7) return 'Valizi gözden geçirme zamanı. Alınacakları tamamla.'
  if (daysLeft > 2) return 'Son bir hafta! Eksik ne varsa bu hafta hallet.'
  return 'İki gün sonra yoldasın. Yarın bavulu kapatmaya bak.'
}
