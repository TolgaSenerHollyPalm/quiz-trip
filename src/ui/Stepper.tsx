import styles from './Stepper.module.css'

interface StepperProps {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}

export default function Stepper({ label, value, min, max, onChange }: StepperProps) {
  return (
    <div className={styles.stepper} role="group" aria-label={label}>
      <span className={styles.label}>{label}</span>
      <div className={styles.controls}>
        <button type="button" aria-label="Azalt" disabled={value <= min} onClick={() => onChange(value - 1)}>
          −
        </button>
        <output className={styles.value} aria-live="polite">
          {value}
        </output>
        <button type="button" aria-label="Artır" disabled={value >= max} onClick={() => onChange(value + 1)}>
          +
        </button>
      </div>
    </div>
  )
}
