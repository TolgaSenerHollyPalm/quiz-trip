import { useRef, type KeyboardEvent } from 'react'
import styles from './SegmentedTabs.module.css'

interface SegmentedTabsProps<T extends string> {
  label: string // names the choice for screen readers, e.g. "Liste türü"
  options: { value: T; label: string }[]
  selected: T
  onSelect: (value: T) => void
  panelId: string // the element the tabs show
}

/** Two or three views of one list; the arrow keys move between them, as in any tab list. */
export default function SegmentedTabs<T extends string>({ label, options, selected, onSelect, panelId }: SegmentedTabsProps<T>) {
  const list = useRef<HTMLDivElement>(null)

  const onKeyDown = (event: KeyboardEvent) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (step === 0) return
    event.preventDefault()
    const at = options.findIndex((option) => option.value === selected)
    const next = options[(at + step + options.length) % options.length]
    onSelect(next.value)
    list.current?.querySelector<HTMLButtonElement>(`[data-value="${next.value}"]`)?.focus()
  }

  return (
    <div ref={list} className={styles.tabs} role="tablist" aria-label={label} onKeyDown={onKeyDown}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          data-value={option.value}
          className={styles.tab}
          aria-selected={option.value === selected}
          aria-controls={panelId}
          tabIndex={option.value === selected ? 0 : -1}
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
