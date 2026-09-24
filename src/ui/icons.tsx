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

export function PlusIcon({ size = 22 }: { size?: number }) {
  return (
    <svg {...box} width={size} height={size}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function CheckIcon({ size = 22 }: { size?: number }) {
  return (
    <svg {...box} width={size} height={size}>
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
      <rect x="2.6" y="7.2" width="18.8" height="12.8" rx="3.2" fill="var(--color-accent)" />
      <rect x="2.6" y="12.1" width="18.8" height="2.6" fill="currentColor" />
      <circle cx="12" cy="13.4" r="0.9" fill="var(--color-accent)" />
    </svg>
  )
}
