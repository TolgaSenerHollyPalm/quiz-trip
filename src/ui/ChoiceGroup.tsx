import { useId, type ReactNode } from 'react'
import styles from './ChoiceGroup.module.css'
import RequiredMark from './RequiredMark.tsx'
import text from './text.module.css'

/** Past this many options a wall of buttons is harder to use than a dropdown. */
export const COLLAPSE_AT = 20

interface ChoiceGroupProps<T extends string | number> {
  label: string
  /** Under a heading that already says it: screen readers still hear the label. */
  hideLabel?: boolean
  options: { value: T; label: string; icon?: ReactNode }[]
  selected: readonly T[]
  onToggle: (value: T) => void
  /** Exactly one of these is chosen, which is what lets a long list collapse into a dropdown. */
  pickOne?: boolean
  placeholder?: string // shown by the dropdown while nothing is chosen
  required?: boolean
}

/** Large toggle buttons; the caller decides whether one or several can be on. */
export default function ChoiceGroup<T extends string | number>({
  label,
  hideLabel,
  options,
  selected,
  onToggle,
  pickOne,
  placeholder = 'Seç…',
  required,
}: ChoiceGroupProps<T>) {
  const id = useId()
  const labelClass = hideLabel ? text.visuallyHidden : styles.legend

  if (pickOne && options.length >= COLLAPSE_AT) {
    const chosen = options.find((option) => selected.includes(option.value))
    return (
      <div className={styles.group}>
        <label className={labelClass} htmlFor={id}>
          {label}
          {required && <RequiredMark />}
        </label>
        <select
          id={id}
          className={styles.select}
          value={chosen ? String(chosen.value) : ''}
          onChange={(event) => {
            const picked = options.find((option) => String(option.value) === event.target.value)
            if (picked) onToggle(picked.value)
          }}
        >
          {/* Without this the browser would show the first option while nothing is actually chosen. */}
          {!chosen && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <fieldset className={styles.group}>
      <legend className={labelClass}>
        {label}
        {required && <RequiredMark />}
      </legend>
      <div className={styles.options}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={styles.option}
            aria-pressed={selected.includes(option.value)}
            onClick={() => onToggle(option.value)}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
