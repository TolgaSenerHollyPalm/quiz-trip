import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { href, type Route } from '../app/router.ts'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'danger'

const className = (variant: Variant, big = false) =>
  [styles.button, styles[variant], big && styles.big].filter(Boolean).join(' ')

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  big?: boolean
}

export function Button({ variant = 'secondary', big, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={className(variant, big)} {...props} />
}

interface LinkButtonProps {
  to: Route
  variant?: Variant
  big?: boolean
  children: ReactNode
}

/** Looks like a button but navigates, so the back button and long-press work as on any link. */
export function LinkButton({ to, variant = 'secondary', big, children }: LinkButtonProps) {
  return (
    <a href={href(to)} className={className(variant, big)}>
      {children}
    </a>
  )
}
