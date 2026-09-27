import type { ReactNode } from 'react'
import type { TripKind } from '../trips/types.ts'

/** One line icon per holiday type, in the design's style: a 24px grid, round ends. */
const ICONS: Record<TripKind, ReactNode> = {
  // Waves under the sun.
  beach: (
    <>
      <path d="M2 16c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 20c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2" />
      <circle cx="16" cy="7" r="3" />
    </>
  ),
  // A Ferris wheel: a theme park's own sign.
  fun: (
    <>
      <circle cx="12" cy="10" r="6.5" />
      <path d="M12 3.5v13M5.5 10h13M7.4 5.4l9.2 9.2M16.6 5.4l-9.2 9.2" />
      <path d="M8.5 21l3.5-5 3.5 5M6.5 21h11" />
    </>
  ),
  winter: <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5" />,
  // Two buildings.
  city: (
    <>
      <path d="M3 21h18M5 21V8l6-3v16M11 21V10h8v11" />
      <path d="M14 13.5h2M14 17h2M7.5 11h1M7.5 14.5h1" />
    </>
  ),
  // A pine.
  nature: (
    <>
      <path d="M12 3l5.5 8H14l4 6H6l4-6H6.5z" />
      <path d="M12 17v4" />
    </>
  ),
  // A presentation board, so it does not look like the packing list's suitcase.
  business: (
    <>
      <rect x="3.5" y="4" width="17" height="11" rx="1.5" />
      <path d="M7.5 11.5l3-3 2 2 4-4M12 15v3M8.5 21l3.5-3 3.5 3" />
    </>
  ),
  // A map pin.
  other: (
    <>
      <path d="M12 21s6-5.6 6-11a6 6 0 1 0-12 0c0 5.4 6 11 6 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </>
  ),
}

/** Decorative: the holiday type's name is always written next to it. */
export default function TripKindIcon({ kind, size = 14 }: { kind: TripKind; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[kind]}
    </svg>
  )
}
