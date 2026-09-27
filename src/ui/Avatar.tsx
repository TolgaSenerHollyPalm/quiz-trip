import styles from './Avatar.module.css'

/** A player's initial in a teal circle. Decorative: the name is always written next to it. */
export default function Avatar({ name, large }: { name?: string; large?: boolean }) {
  const initial = (name?.trim().charAt(0) || '?').toLocaleUpperCase('tr')
  return (
    <span className={large ? `${styles.avatar} ${styles.large}` : styles.avatar} aria-hidden="true">
      {initial}
    </span>
  )
}
