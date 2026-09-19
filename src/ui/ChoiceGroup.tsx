import styles from './ChoiceGroup.module.css'

interface ChoiceGroupProps<T extends string | number> {
  label: string
  options: { value: T; label: string }[]
  selected: readonly T[]
  onToggle: (value: T) => void
}

/** Large toggle buttons; the caller decides whether one or several can be on. */
export default function ChoiceGroup<T extends string | number>({ label, options, selected, onToggle }: ChoiceGroupProps<T>) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.options}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={styles.option}
            aria-pressed={selected.includes(option.value)}
            onClick={() => onToggle(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
