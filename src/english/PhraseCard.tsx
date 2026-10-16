import { useId, type ReactNode } from 'react'
import { StarIcon } from '../ui/icons.tsx'
import type { EnglishItem } from './content.ts'
import styles from './PhraseCard.module.css'

/** The cards of a topic, a search or the saved items, one under another. */
export function PhraseList({ children }: { children: ReactNode }) {
  return <ul className={styles.list}>{children}</ul>
}

interface PhraseCardProps {
  item: EnglishItem
  to: string // the item shown large
  saved: boolean
  onToggleSaved: () => void
}

/** A phrase or a word: Turkish over its English, the note under them, and the star beside. */
export function PhraseCard({ item, to, saved, onToggleSaved }: PhraseCardProps) {
  const englishId = useId()
  return (
    <li className={styles.card}>
      <a className={styles.open} href={to}>
        <span className={styles.tr}>{item.tr}</span>
        <span id={englishId} className={styles.en} lang="en">
          {item.en}
        </span>
        {item.note && <span className={styles.note}>{item.note}</span>}
      </a>
      <span className={styles.starSlot}>
        <StarButton saved={saved} onToggle={onToggleSaved} describedBy={englishId} />
      </span>
    </li>
  )
}

interface StarButtonProps {
  saved: boolean
  onToggle: () => void
  describedBy?: string // the English it saves, so a list of stars is not a list of identical buttons
}

export function StarButton({ saved, onToggle, describedBy }: StarButtonProps) {
  return (
    <button
      type="button"
      className={styles.star}
      aria-pressed={saved}
      aria-label={saved ? 'Kaydedildi' : 'Kaydet'}
      aria-describedby={describedBy}
      onClick={onToggle}
    >
      <StarIcon size={22} strokeWidth={1.8} filled={saved} />
    </button>
  )
}
