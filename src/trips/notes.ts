import type { NoteItem } from './types.ts'

/** Adds an item at the end, as the packing list does. Blank text adds nothing. */
export function addNote(items: NoteItem[], text: string, id: string): NoteItem[] {
  const trimmed = text.trim()
  return trimmed === '' ? items : [...items, { id, text: trimmed, done: false }]
}

export function toggleNote(items: NoteItem[], id: string): NoteItem[] {
  return items.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
}

/**
 * Renames an item and sets its note. A blank name is refused; a blank note removes the note.
 * A suggestion the player changes becomes theirs: it loses its source, so a new place never takes it away.
 */
export function editNote(items: NoteItem[], id: string, change: { text: string; note: string }): NoteItem[] {
  const text = change.text.trim()
  const note = change.note.trim()
  if (text === '') return items
  return items.map((item) => {
    if (item.id !== id || (item.text === text && (item.note ?? '') === note)) return item
    const { note: _note, source: _source, ...rest } = item
    return note === '' ? { ...rest, text } : { ...rest, text, note }
  })
}
