import { useId, useState, type ReactNode } from 'react'
import { ChevronDownIcon } from './icons.tsx'
import styles from './Disclosure.module.css'

/** A titled part of a screen that folds away, e.g. "Tamamlananlar · 3". */
export default function Disclosure({ title, children }: { title: string; children: ReactNode }) {
  const id = useId()
  const [open, setOpen] = useState(true)
  return (
    <section className={open ? styles.section : `${styles.section} ${styles.closed}`}>
      <button type="button" className={styles.toggle} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        <span className={styles.chevron}>
          <ChevronDownIcon />
        </span>
        {title}
      </button>
      <div id={id} hidden={!open}>
        {children}
      </div>
    </section>
  )
}
