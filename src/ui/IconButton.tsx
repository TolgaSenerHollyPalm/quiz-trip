import type { ComponentPropsWithRef, ReactNode } from 'react'
import { href, type Route } from '../app/router.ts'
import styles from './IconButton.module.css'

interface IconButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'aria-label' | 'children'> {
  label: string // all a screen reader has to go on, so it says what the button does
  children: ReactNode
}

/** A 44px round button that shows only an icon. */
export function IconButton({ label, children, type = 'button', ...props }: IconButtonProps) {
  return (
    <button type={type} className={styles.icon} aria-label={label} {...props}>
      {children}
    </button>
  )
}

/** The same button as a link, so the back gesture and long-press work as on any link. */
export function IconLink({ to, label, children }: { to: Route; label: string; children: ReactNode }) {
  return (
    <a href={href(to)} className={styles.icon} aria-label={label}>
      {children}
    </a>
  )
}
