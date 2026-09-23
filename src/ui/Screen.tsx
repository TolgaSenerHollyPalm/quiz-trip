import { useEffect, type ReactNode } from 'react'
import { href, type Route } from '../app/router.ts'
import styles from './Screen.module.css'

interface ScreenProps {
  title: string
  back?: Route
  aside?: ReactNode // right side of the header
  wide?: boolean // a list screen, which may spread out on a desktop window
  theme?: string // a trip's colour set, from tripTheme()
  children: ReactNode
}

export default function Screen({ title, back, aside, wide, theme, children }: ScreenProps) {
  // The page behind the screen is painted by <html>, so the trip's colour has to reach that far up.
  useEffect(() => {
    if (!theme) return undefined
    document.documentElement.classList.add(theme)
    return () => document.documentElement.classList.remove(theme)
  }, [theme])

  const classes = [styles.screen, wide && styles.wide, theme].filter(Boolean).join(' ')
  return (
    <div className={classes}>
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
