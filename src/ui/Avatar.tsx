import styles from './Avatar.module.css'

/** A player's initial in a teal circle. Decorative: the name is always written next to it. */
export default function Avatar({ name }: { name?: string }) {
  const initial = (name?.trim().charAt(0) || '?').toLocaleUpperCase('tr')
  return (
    <span className={styles.avatar} aria-hidden="true">
      {initial}
    </span>
  )
}
