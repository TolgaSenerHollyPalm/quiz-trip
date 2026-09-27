import { describe, expect, it } from 'vitest'
import { addNote, editNote, removeNote, toggleNote } from './notes.ts'
import type { NoteItem } from './types.ts'

const papyrus: NoteItem = { id: 'a', text: 'Papirüs tablo', note: 'Eski Pazar’da bakılacak', done: false }
const spice: NoteItem = { id: 'b', text: 'Baharat', done: false }

describe('addNote', () => {
  it('adds a trimmed item at the end, not yet done', () => {
    expect(addNote([papyrus], '  Karkade  ', 'c')).toEqual([papyrus, { id: 'c', text: 'Karkade', done: false }])
  })

  it('adds nothing for blank text', () => {
    const items = [papyrus]
    expect(addNote(items, '   ', 'c')).toBe(items)
  })
})

describe('toggleNote', () => {
  it('ticks an item and unticks it again, leaving the others alone', () => {
    const ticked = toggleNote([papyrus, spice], 'b')
    expect(ticked).toEqual([papyrus, { ...spice, done: true }])
    expect(toggleNote(ticked, 'b')).toEqual([papyrus, spice])
  })
})

describe('editNote', () => {
  it('renames an item and sets its note, both trimmed', () => {
    expect(editNote([spice], 'b', { text: ' Kimyon ', note: ' Baharatçıdan ' })).toEqual([
      { id: 'b', text: 'Kimyon', note: 'Baharatçıdan', done: false },
    ])
  })

  it('removes the note when it is left blank', () => {
    const [edited] = editNote([papyrus], 'a', { text: 'Papirüs tablo', note: '  ' })
    expect(edited).toEqual({ id: 'a', text: 'Papirüs tablo', done: false })
    expect('note' in edited).toBe(false)
  })

  it('refuses a blank name', () => {
    const items = [papyrus]
    expect(editNote(items, 'a', { text: '  ', note: 'x' })).toBe(items)
  })

  it('keeps a ticked item ticked', () => {
    expect(editNote([{ ...spice, done: true }], 'b', { text: 'Baharat', note: '' })[0].done).toBe(true)
  })
})

describe('removeNote', () => {
  it('removes only the given item', () => {
    expect(removeNote([papyrus, spice], 'a')).toEqual([spice])
  })
})
