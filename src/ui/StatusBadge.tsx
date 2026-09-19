import type { Prediction } from '../game/types.ts'
import styles from './StatusBadge.module.css'

const LABELS: Record<Prediction['status'], string> = {
  open: 'Açık',
  locked: 'Kilitli',
  resolved: 'Sonuçlandı',
}

export default function StatusBadge({ status }: { status: Prediction['status'] }) {
  return <span className={`${styles.badge} ${styles[status]}`}>{LABELS[status]}</span>
}
