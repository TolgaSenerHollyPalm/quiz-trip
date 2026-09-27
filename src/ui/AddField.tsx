import { useId, useRef, useState, type FormEvent } from 'react'
import { PlusIcon } from './icons.tsx'
import text from './text.module.css'
import { toneClass, type Tone } from './tone.ts'
import styles from './AddField.module.css'

interface AddFieldProps {
  label: string // read by screen readers only, e.g. "Yeni madde"
  placeholder: string
  tone: Tone
  onAdd: (text: string) => void
  inRow?: boolean // the last row of a list card rather than a card of its own
}

/** Adds an item on Enter or the button; blank text is ignored, and the field empties and keeps focus. */
export default function AddField({ label, placeholder, tone, onAdd, inRow }: AddFieldProps) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = value.trim()
    if (trimmed !== '') onAdd(trimmed)
    setValue('')
    input.current?.focus()
  }

  const form = (
    <form className={`${inRow ? styles.row : styles.card} ${toneClass(tone)}`} onSubmit={submit}>
      <label htmlFor={id} className={text.visuallyHidden}>
        {label}
      </label>
      {inRow && (
        <span className={styles.plus}>
          <PlusIcon size={20} strokeWidth={2} />
        </span>
      )}
      <input
        ref={input}
        id={id}
        className={styles.input}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(event) => setValue(event.target.value)}
      />
      {!inRow && (
        <button type="submit" className={styles.add} aria-label="Listeye ekle">
          <PlusIcon size={20} strokeWidth={2.4} />
        </button>
      )}
    </form>
  )
  return inRow ? <li className={styles.rowItem}>{form}</li> : form
}
