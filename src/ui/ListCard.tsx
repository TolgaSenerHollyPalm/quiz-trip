import type { ReactNode } from 'react'
import { href, type Route } from '../app/router.ts'
import { ChevronRightIcon } from './icons.tsx'
import styles from './ListCard.module.css'

interface ListCardProps {
  as?: 'ul' | 'nav' | 'div'
  label?: string // names a nav for screen readers
  children: ReactNode
}

/** A white card of rows: LinkRows in a nav, ItemRows in a ul. */
export function ListCard({ as: Tag = 'ul', label, children }: ListCardProps) {
  return (
    <Tag className={styles.card} aria-label={label}>
      {children}
    </Tag>
  )
}

interface LinkRowProps {
  to: Route
  tile: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  meta?: ReactNode // right of the title, e.g. "4 / 9"
  bar?: ReactNode // a thin ProgressBar under the title
  trailing?: ReactNode // takes the arrow's place, e.g. a chip
  small?: boolean
}

export function LinkRow({ to, tile, title, subtitle, meta, bar, trailing, small }: LinkRowProps) {
  return (
    <a href={href(to)} className={small ? `${styles.link} ${styles.small}` : styles.link}>
      {tile}
      <span className={bar ? `${styles.body} ${styles.withBar}` : styles.body}>
        <span className={styles.top}>
          <span className={styles.title}>{title}</span>
          {meta && <span className={styles.meta}>{meta}</span>}
        </span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        {bar}
      </span>
      {trailing ?? (
        <span className={styles.chevron}>
          <ChevronRightIcon />
        </span>
      )}
    </a>
  )
}

interface ItemRowProps {
  control: ReactNode // the CheckButton
  text: ReactNode
  note?: ReactNode
  done?: boolean
  strong?: boolean // the lists the user writes put the item in bold
  trailing?: ReactNode // e.g. a delete button while editing
}

export function ItemRow({ control, text, note, done, strong, trailing }: ItemRowProps) {
  const textClass = [strong && styles.strong, done && styles.done].filter(Boolean).join(' ')
  return (
    <li className={styles.item}>
      {control}
      <span className={styles.itemText}>
        <span className={textClass || undefined}>{text}</span>
        {note && <span className={styles.note}>{note}</span>}
      </span>
      {trailing}
    </li>
  )
}
