import type { ReactNode } from 'react'
import type { Transport } from '../trips/types.ts'
import { TRANSPORT_LABELS } from './labels.ts'

/** Drawn here rather than loaded, so they work offline and follow the text colour. */
const ICONS: Partial<Record<Transport, ReactNode>> = {
  car: (
    <>
      <path d="M4 16.4v-2.6l1.9-4.5a2 2 0 0 1 1.8-1.3h8.6a2 2 0 0 1 1.8 1.3l1.9 4.5v2.6" />
      <path d="M4 13.8h16" />
      <circle cx="7.6" cy="16.6" r="1.7" />
      <circle cx="16.4" cy="16.6" r="1.7" />
      <path d="M9.4 16.6h5.2" />
    </>
  ),
  plane: (
    <path d="M12 2.6a1.6 1.6 0 0 1 1.6 1.6v4.4l6.8 3.9v2.2l-6.8-2v3.5l2.3 1.9v1.6L12 19l-3.9 1.1v-1.6l2.3-1.9v-3.5l-6.8 2v-2.2l6.8-3.9V4.2A1.6 1.6 0 0 1 12 2.6z" />
  ),
  bus: (
    <>
      <rect x="3.2" y="4.6" width="17.6" height="11.6" rx="2.4" />
      <path d="M3.2 10.2h17.6" />
      <path d="M12 10.2v6" />
      <circle cx="7.4" cy="18" r="1.6" />
      <circle cx="16.6" cy="18" r="1.6" />
    </>
  ),
  ferry: (
    <>
      <path d="M3.4 14.4h17.2l-2 4.3a2 2 0 0 1-1.8 1.1H7.2a2 2 0 0 1-1.8-1.1z" />
      <path d="M7.2 14.4V9.8h6.4l2.8 4.6" />
      <path d="M9.6 12.2h2.4" />
      <path d="M10.4 9.8V7.2h3.6" />
    </>
  ),
}

interface TransportIconProps {
  transport?: Transport
  size?: number
  decorative?: boolean // next to the vehicle's name, where reading the icon out too would repeat it
}

/** Nothing is drawn for "diğer" or for a trip with no vehicle yet. */
export default function TransportIcon({ transport, size = 24, decorative = false }: TransportIconProps) {
  if (!transport) return null
  const icon = ICONS[transport]
  if (!icon) return null
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : TRANSPORT_LABELS[transport]}
      aria-hidden={decorative || undefined}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icon}
    </svg>
  )
}
