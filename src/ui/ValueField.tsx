import { useState } from 'react'
import type { Prediction } from '../game/types.ts'
import { parseDuration, parseNumber } from '../game/values.ts'
import styles from './ValueField.module.css'

interface ValueFieldProps {
  prediction: Pick<Prediction, 'type' | 'format' | 'unit' | 'options'>
  label: string
  invalid?: boolean
  onChange: (value: number | undefined) => void // undefined while the text is not a value yet
}

/** Where a guess or the real value is entered: a number, hours and minutes, or one of the options. */
export default function ValueField({ prediction, label, invalid, onChange }: ValueFieldProps) {
  if (prediction.type === 'choice') {
    return <ChoiceField options={prediction.options ?? []} label={label} onChange={onChange} />
  }
  if (prediction.format === 'duration') return <DurationField label={label} invalid={invalid} onChange={onChange} />
  return <NumberField unit={prediction.unit} label={label} invalid={invalid} onChange={onChange} />
}

interface FieldProps {
  label: string
  invalid?: boolean
  onChange: (value: number | undefined) => void
}

function NumberField({ unit, label, invalid, onChange }: FieldProps & { unit?: string }) {
  const [text, setText] = useState('')
  return (
    <div className={styles.row}>
      <input
        className={styles.input}
        inputMode="decimal"
        autoComplete="off"
        aria-label={label}
        aria-invalid={invalid}
        value={text}
        onChange={(event) => {
          setText(event.target.value)
          onChange(parseNumber(event.target.value))
        }}
      />
      {unit && <span className={styles.unit}>{unit}</span>}
    </div>
  )
}

// Two fields, because the numeric keyboard on Android has no ":" key.
function DurationField({ label, invalid, onChange }: FieldProps) {
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
  const update = (nextHours: string, nextMinutes: string) => {
    setHours(nextHours)
    setMinutes(nextMinutes)
    onChange(parseDuration(nextHours, nextMinutes))
  }
  return (
    <div className={styles.row} role="group" aria-label={label}>
      <label className={styles.part}>
        <input
          className={styles.input}
          inputMode="numeric"
          maxLength={2}
          placeholder="SS"
          aria-invalid={invalid}
          value={hours}
          onChange={(event) => update(event.target.value, minutes)}
        />
        <span className={styles.unit}>saat</span>
      </label>
      <span className={styles.colon}>:</span>
      <label className={styles.part}>
        <input
          className={styles.input}
          inputMode="numeric"
          maxLength={2}
          placeholder="DD"
          aria-invalid={invalid}
          value={minutes}
          onChange={(event) => update(hours, event.target.value)}
        />
        <span className={styles.unit}>dakika</span>
      </label>
    </div>
  )
}

function ChoiceField({ options, label, onChange }: Omit<FieldProps, 'invalid'> & { options: string[] }) {
  const [selected, setSelected] = useState<number>()
  return (
    <div className={styles.choices} role="radiogroup" aria-label={label}>
      {options.map((option, index) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={selected === index}
          className={styles.choice}
          onClick={() => {
            setSelected(index)
            onChange(index)
          }}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
