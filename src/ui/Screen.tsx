import type { ReactNode } from 'react'
import { href, type Route } from '../app/router.ts'
import styles from './Screen.module.css'

interface ScreenProps {
  title: string
  back?: Route
  aside?: ReactNode // right side of the header
  children: ReactNode
}

export default function Screen({ title, back, aside, children }: ScreenProps) {
  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        {back && (
          <a className={styles.back} href={href(back)} aria-label="Geri">
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}
        <h1 className={styles.title}>{title}</h1>
        {aside}
      </header>
      <main className={styles.content}>{children}</main>
    </div>
  )
}
