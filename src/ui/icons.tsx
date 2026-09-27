/** Small line icons drawn here rather than loaded, so they work offline and follow the text colour. */
const box = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export function PlusIcon({ size = 22, strokeWidth = 2.4 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg {...box} strokeWidth={strokeWidth} width={size} height={size}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function CheckIcon({ size = 22, strokeWidth = 2.4 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg {...box} strokeWidth={strokeWidth} width={size} height={size}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  )
}

export function GearIcon({ size = 24 }: { size?: number }) {
  return (
    <svg {...box} strokeWidth={1.9} width={size} height={size}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.8v2.4M12 18.8v2.4M4.5 4.5l1.7 1.7M17.8 17.8l1.7 1.7M2.8 12h2.4M18.8 12h2.4M4.5 19.5l1.7-1.7M17.8 6.2l1.7-1.7" />
    </svg>
  )
}

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

interface IconProps {
  size?: number
  strokeWidth?: number
}

/** The new design's line icons: a 24px grid, round ends, 1.7–2px lines. */
function line(size: number, strokeWidth: number) {
  return { ...box, width: size, height: size, strokeWidth }
}

export function BackIcon({ size = 20, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth)}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

export function ChevronRightIcon({ size = 18, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth)}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

export function ChevronDownIcon({ size = 16, strokeWidth = 2.2 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth)}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function DotsIcon({ size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="19" cy="12" r="1.7" />
    </svg>
  )
}

export function CloseIcon({ size = 18, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth)}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function ArrowRightIcon({ size = 18, strokeWidth = 2.2 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function RefreshIcon({ size = 17, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth)}>
      <path d="M20 11a8 8 0 1 0-2.3 5.7M20 4.5V11h-6.5" />
    </svg>
  )
}

export function StopwatchIcon({ size = 15, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth)}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2M9.5 2.5h5" />
    </svg>
  )
}

export function SlidersIcon({ size = 20, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth)}>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2.2" />
      <circle cx="9" cy="17" r="2.2" />
    </svg>
  )
}

/** The packing list. */
export function SuitcaseIcon({ size = 22, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth)}>
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h18" />
    </svg>
  )
}

/** Things to buy before coming home. */
export function BagIcon({ size = 22, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth)}>
      <path d="M5.5 8h13l-1 12.5h-11z" />
      <path d="M9 10V7a3 3 0 0 1 6 0v3" />
    </svg>
  )
}

/** Things to taste before coming home. */
export function ForkKnifeIcon({ size = 22, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth)}>
      <path d="M7 3v6a2 2 0 0 0 2 2v10M11 3v6a2 2 0 0 1-2 2M9 3v5M17 21V3c-2.2 1.4-3.2 4-3.2 7.5H17" />
    </svg>
  )
}

/** The quiz. */
export function QuizIcon({ size = 22, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth)}>
      <path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <path d="M9.6 8.6a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.3" />
      <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** The predictions. */
export function TargetIcon({ size = 22, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth)}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function TrophyIcon({ size = 19, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth)}>
      <path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3.2 4M16 6h3a3 3 0 0 1-3.2 4M12 13v4M9 21h6M10 17h4" />
    </svg>
  )
}

export function PeopleIcon({ size = 19, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth)}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16 14.2a5 5 0 0 1 5 5.3" />
    </svg>
  )
}

/** A question pack. */
export function BoxIcon({ size = 19, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...line(size, strokeWidth)}>
      <path d="M3 7.5l9-4.5 9 4.5-9 4.5zM3 7.5v9l9 4.5 9-4.5v-9M12 12v9" />
    </svg>
  )
}
