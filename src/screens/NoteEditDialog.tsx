import { useEffect, useId, useRef, useState } from 'react'
import type { NoteItem } from '../trips/types.ts'
import { Button } from '../ui/Button.tsx'
import RequiredMark from '../ui/RequiredMark.tsx'
import styles from './NoteEditDialog.module.css'

interface NoteEditDialogProps {
  item?: NoteItem // open while there is one
  notePlaceholder: string
  onSave: (change: { text: string; note: string }) => void
  onClose: () => void
}

/** Renames an item and writes its note, in a panel from the bottom of the screen. */
export default function NoteEditDialog({ item, notePlaceholder, onSave, onClose }: NoteEditDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const id = useId()
  const [text, setText] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (item && !element.open) {
      setText(item.text)
      setNote(item.note ?? '')
      element.showModal()
    }
    if (!item && element.open) element.close()
  }, [item])

  return (
    <dialog
      ref={dialog}
      className={styles.sheet}
      aria-labelledby={`${id}-title`}
      onCancel={(event) => {
        // Escape or the Android back gesture: let React state decide whether the panel is open.
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        // A tap on the dimmed page around the panel closes it, as on any sheet.
        if (event.target === dialog.current) onClose()
      }}
    >
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault()
          if (text.trim() !== '') onSave({ text, note })
        }}
      >
        <h2 id={`${id}-title`} className={styles.title}>
          Maddeyi düzenle
        </h2>
        <label className={styles.field}>
          <span className={styles.label}>
            Ad
            <RequiredMark />
          </span>
          <input className={styles.input} value={text} maxLength={80} onChange={(event) => setText(event.target.value)} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Not</span>
          <input
            className={styles.input}
            value={note}
            maxLength={120}
            placeholder={notePlaceholder}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
        <div className={styles.actions}>
          <Button onClick={onClose}>Vazgeç</Button>
          <Button type="submit" variant="primary" disabled={text.trim() === ''}>
            Kaydet
          </Button>
        </div>
      </form>
    </dialog>
  )
}
