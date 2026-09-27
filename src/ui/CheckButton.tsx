import { CheckIcon } from './icons.tsx'
import { toneClass, type Tone } from './tone.ts'
import styles from './CheckButton.module.css'

interface CheckButtonProps {
  checked: boolean
  item: string // the item's own text, so the button can say "Powerbank: işaretle"
  tone: Tone
  onToggle: () => void
}

export default function CheckButton({ checked, item, tone, onToggle }: CheckButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.check} ${toneClass(tone)}`}
      aria-label={`${item}: ${checked ? 'işareti kaldır' : 'işaretle'}`}
      onClick={onToggle}
    >
      <span className={checked ? `${styles.ring} ${styles.checked}` : styles.ring}>
        {checked && <CheckIcon size={14} strokeWidth={3} />}
      </span>
    </button>
  )
}
