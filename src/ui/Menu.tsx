import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { IconButton } from './IconButton.tsx'
import { DotsIcon } from './icons.tsx'
import styles from './Menu.module.css'

export interface MenuItem {
  label: string
  onSelect: () => void
  danger?: boolean // deleting or resetting; these still ask in a ConfirmDialog
}

/** The "…" button with a screen's rarer actions: editing, resetting, deleting. */
export default function Menu({ items, label = 'Diğer işlemler' }: { items: MenuItem[]; label?: string }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const list = useRef<HTMLUListElement>(null)

  const entries = () => [...(list.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [])]
  const close = (returnFocus: boolean) => {
    setOpen(false)
    if (returnFocus) trigger.current?.focus()
  }

  // Opening puts focus on the first action; a tap anywhere else closes the menu.
  useEffect(() => {
    if (!open) return undefined
    entries()[0]?.focus()
    const outside = (event: PointerEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])

  const onKeyDown = (event: KeyboardEvent) => {
    const all = entries()
    const at = all.indexOf(document.activeElement as HTMLButtonElement)
    const move = (to: number) => {
      event.preventDefault()
      all[(to + all.length) % all.length]?.focus()
    }
    if (event.key === 'ArrowDown') move(at + 1)
    else if (event.key === 'ArrowUp') move(at - 1)
    else if (event.key === 'Home') move(0)
    else if (event.key === 'End') move(all.length - 1)
    else if (event.key === 'Escape') {
      event.preventDefault()
      close(true)
    } else if (event.key === 'Tab') close(false)
  }

  return (
    <div className={styles.wrap} ref={wrap}>
      <IconButton
        ref={trigger}
        label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen(!open)}
      >
        <DotsIcon />
      </IconButton>
      {open && (
        <ul id={id} ref={list} className={styles.menu} role="menu" aria-label={label} onKeyDown={onKeyDown}>
          {items.map((item) => (
            <li key={item.label} role="none">
              <button
                type="button"
                role="menuitem"
                className={item.danger ? `${styles.item} ${styles.danger}` : styles.item}
                onClick={() => {
                  close(false)
                  item.onSelect()
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
