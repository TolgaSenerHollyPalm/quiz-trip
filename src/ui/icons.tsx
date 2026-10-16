/** TripKit's own icons; the shared ones come from kitshelf-ui/ui/icons.tsx. */
import { lineIcon, type IconProps } from 'kitshelf-ui/ui/iconBase.ts'

/** The app's own mark: the suitcase from the icon, in the logo's two colours. */
export function AppMark({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M8.7 7.2V5.6A1.6 1.6 0 0 1 10.3 4h3.4a1.6 1.6 0 0 1 1.6 1.6v1.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect x="2.6" y="7.2" width="18.8" height="12.8" rx="3.2" fill="var(--color-coral)" />
      <rect x="2.6" y="12.1" width="18.8" height="2.6" fill="currentColor" />
      <circle cx="12" cy="13.4" r="0.9" fill="var(--color-coral)" />
    </svg>
  )
}

export function StopwatchIcon({ size = 15, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2M9.5 2.5h5" />
    </svg>
  )
}

/** The packing list. */
export function SuitcaseIcon({ size = 22, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h18" />
    </svg>
  )
}

/** Things to buy before coming home. */
export function BagIcon({ size = 22, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M5.5 8h13l-1 12.5h-11z" />
      <path d="M9 10V7a3 3 0 0 1 6 0v3" />
    </svg>
  )
}

/** Things to taste before coming home. */
export function ForkKnifeIcon({ size = 22, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M7 3v6a2 2 0 0 0 2 2v10M11 3v6a2 2 0 0 1-2 2M9 3v5M17 21V3c-2.2 1.4-3.2 4-3.2 7.5H17" />
    </svg>
  )
}

/** The quiz. */
export function QuizIcon({ size = 22, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <path d="M9.6 8.6a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.3" />
      <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** The predictions. */
export function TargetIcon({ size = 22, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function TrophyIcon({ size = 19, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3.2 4M16 6h3a3 3 0 0 1-3.2 4M12 13v4M9 21h6M10 17h4" />
    </svg>
  )
}

export function PeopleIcon({ size = 19, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16 14.2a5 5 0 0 1 5 5.3" />
    </svg>
  )
}

/** A download that waits for a connection. */
export function CloudIcon({ size = 20, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M7 18.5h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.1 9.6 4.5 4.5 0 0 0 7 18.5z" />
      <path d="M12 11v5M9.8 14l2.2 2.2 2.2-2.2" />
    </svg>
  )
}

/** A question pack. */
export function BoxIcon({ size = 19, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M3 7.5l9-4.5 9 4.5-9 4.5zM3 7.5v9l9 4.5 9-4.5v-9M12 12v9" />
    </svg>
  )
}

/** The app's icon as the home screen shows it beside the name: the suitcase on the teal tile. */
export function AppIcon({ size = 32 }: IconProps) {
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} aria-hidden="true">
      <rect width="512" height="512" rx="112" fill="#0a7d76" />
      <path d="M212 154v-28a26 26 0 0 1 26-26h36a26 26 0 0 1 26 26v28" fill="none" stroke="#cff8f2" strokeWidth="22" strokeLinecap="round" />
      <rect x="112" y="154" width="288" height="216" rx="40" fill="#ff6b57" />
      <rect x="112" y="236" width="288" height="44" fill="#0a7d76" />
      <circle cx="256" cy="258" r="14" fill="#cff8f2" />
    </svg>
  )
}

/** A speech bubble: travel English and its "Temel ifadeler" topic; with lines, the trip screen's row. */
export function ChatIcon({ size = 22, strokeWidth = 1.7, lines = false }: IconProps & { lines?: boolean }) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-8.5L6 20v-3.5H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5z" />
      {lines && <path d="M8.5 9.8h7M8.5 12.8h5" />}
    </svg>
  )
}

/** An aeroplane seat. */
export function SeatIcon({ size = 22, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M8 3.5h1.5a1.5 1.5 0 0 1 1.5 1.5v7.5h5.5a2 2 0 0 1 2 2v1.5H9.5A2.5 2.5 0 0 1 7 13.5V4.5a1 1 0 0 1 1-1zM10 16v4.5M16.5 16v4.5M8 20.5h10" />
    </svg>
  )
}

export function PassportIcon({ size = 22, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M6.5 3.5h10.5a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H6.5z" />
      <path d="M12.2 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM9.5 17h5.5" />
    </svg>
  )
}

export function BedIcon({ size = 22, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M3.5 18.5v-12M3.5 14.5h17v4M20.5 14.5V12a2.5 2.5 0 0 0-2.5-2.5h-7v5" />
      <circle cx="7.2" cy="11" r="1.6" />
    </svg>
  )
}

/** A map pin: asking the way. */
export function PinIcon({ size = 22, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2" />
    </svg>
  )
}

export function ClockIcon({ size = 22, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}

/** The first-aid cross: health and emergencies. */
export function MedicalIcon({ size = 22, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M9.5 4h5v5.5H20v5h-5.5V20h-5v-5.5H4v-5h5.5z" />
    </svg>
  )
}

/** Saved or not: filled once something is starred. */
export function StarIcon({ size = 22, strokeWidth = 1.7, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill={filled ? 'currentColor' : 'none'} />
    </svg>
  )
}

export function SearchIcon({ size = 20, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <circle cx="10.5" cy="10.5" r="7" />
      <path d="M20.5 20.5l-5-5" />
    </svg>
  )
}

/** Four corners: tapping shows the thing large. */
export function ExpandIcon({ size = 16, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...lineIcon(size, strokeWidth)}>
      <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" />
    </svg>
  )
}
