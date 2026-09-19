import styles from './OnlineBadge.module.css'
import { useOnline } from './useOnline.ts'

export default function OnlineBadge() {
  const online = useOnline()
  return (
    <span className={`${styles.badge} ${online ? styles.online : styles.offline}`}>
      {online ? 'Çevrimiçi' : 'Çevrimdışı'}
    </span>
  )
}
