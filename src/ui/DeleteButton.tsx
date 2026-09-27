import styles from './DeleteButton.module.css'
import { CloseIcon } from './icons.tsx'

/** Removes one item straight away; lists only show it in their edit mode, so a stray tap cannot. */
export default function DeleteButton({ item, onDelete }: { item: string; onDelete: () => void }) {
  return (
    <button type="button" className={styles.delete} aria-label={`Sil: ${item}`} onClick={onDelete}>
      <CloseIcon size={20} />
    </button>
  )
}
