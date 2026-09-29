import { useState, type ComponentType } from 'react'
import { href } from '../app/router.ts'
import { useTrip } from '../app/appData.ts'
import { addNote, editNote, removeNote, toggleNote } from '../trips/notes.ts'
import type { NoteItem } from '../trips/types.ts'
import AddField from 'kitshelf-ui/ui/AddField.tsx'
import { Button } from 'kitshelf-ui/ui/Button.tsx'
import CheckButton from 'kitshelf-ui/ui/CheckButton.tsx'
import DeleteButton from 'kitshelf-ui/ui/DeleteButton.tsx'
import Disclosure from 'kitshelf-ui/ui/Disclosure.tsx'
import { BagIcon, ForkKnifeIcon } from '../ui/icons.tsx'
import { ItemRow, ListCard } from 'kitshelf-ui/ui/ListCard.tsx'
import Missing from 'kitshelf-ui/ui/Missing.tsx'
import ProgressBar from 'kitshelf-ui/ui/ProgressBar.tsx'
import Screen from 'kitshelf-ui/ui/Screen.tsx'
import Tile from 'kitshelf-ui/ui/Tile.tsx'
import { toneClass, type Tone } from 'kitshelf-ui/ui/tone.ts'
import NoteEditDialog from './NoteEditDialog.tsx'
import styles from './NoteListScreen.module.css'

export type NoteList = 'souvenirs' | 'tastes'

interface ListWords {
  title: string
  subtitle: string
  addLabel: string // what the add field asks for, for screen readers
  addPlaceholder: string
  doneWord: string // "2 / 6 alındı"
  doneTitle: string // "Alındı · 2"
  notePlaceholder: string
  empty: string
  tone: Tone
  Icon: ComponentType<{ size?: number }>
}

const NOTE_LISTS: Record<NoteList, ListWords> = {
  souvenirs: {
    title: 'Almadan gelme',
    subtitle: 'Eve dönmeden alınacaklar',
    addLabel: 'Almak istediğin şey',
    addPlaceholder: 'Ne almak istiyorsun?',
    doneWord: 'alındı',
    doneTitle: 'Alındı',
    notePlaceholder: 'Not, ör. nereden, kime',
    empty: 'Hediyelik, baharat, tekstil… Eve götürmek istediklerini yaz.',
    tone: 'coral',
    Icon: BagIcon,
  },
  tastes: {
    title: 'Tatmadan gelme',
    subtitle: 'Mutlaka denenecek tatlar',
    addLabel: 'Tatmak istediğin şey',
    addPlaceholder: 'Ne tatmak istiyorsun?',
    doneWord: 'tadıldı',
    doneTitle: 'Tadıldı',
    notePlaceholder: 'Not, ör. nerede, nasıldı',
    empty: 'Yöresel yemekler, tatlılar, içecekler… Tattıkça işaretle.',
    tone: 'amber',
    Icon: ForkKnifeIcon,
  },
}

/** A list the user writes alone: nothing is suggested, and ticked items move down under their own heading. */
export default function NoteListScreen({ tripId, list }: { tripId: string; list: NoteList }) {
  const { trip, saveTrip } = useTrip(tripId)
  const [editing, setEditing] = useState(false)
  const [openId, setOpenId] = useState<string>()
  if (!trip) return <Missing message="Bu seyahat bulunamadı." back={href({ screen: 'home' })} />

  const words = NOTE_LISTS[list]
  const items = trip[list]
  const save = (next: NoteItem[]) => saveTrip({ ...trip, [list]: next })
  const pending = items.filter((item) => !item.done)
  const done = items.filter((item) => item.done)
  const inEditMode = editing && items.length > 0

  const row = (item: NoteItem) => (
    <ItemRow
      key={item.id}
      control={<CheckButton checked={item.done} item={item.text} tone={words.tone} onToggle={() => save(toggleNote(items, item.id))} />}
      text={item.text}
      note={item.note}
      done={item.done}
      strong={!item.done}
      onOpen={() => setOpenId(item.id)}
      openLabel={`${item.text}${item.note ? `, ${item.note}` : ''}: düzenle`}
      trailing={
        inEditMode && (
          <DeleteButton item={item.text} onDelete={() => save(removeNote(items, item.id))} />
        )
      }
    />
  )

  return (
    <Screen
      title={words.title}
      subtitle={words.subtitle}
      mark={
        <Tile tone={words.tone} size="large">
          <words.Icon size={24} />
        </Tile>
      }
      back={href({ screen: 'trip', tripId })}
      aside={
        items.length > 0 && (
          <Button variant="text" onClick={() => setEditing(!inEditMode)}>
            {inEditMode ? 'Bitti' : 'Düzenle'}
          </Button>
        )
      }
    >
      {items.length > 0 && (
        <div className={`${styles.progress} ${toneClass(words.tone)}`}>
          <ProgressBar value={done.length} max={items.length} tone={words.tone} label={words.title} thick />
          <span className={styles.count}>
            {done.length} / {items.length} {words.doneWord}
          </span>
        </div>
      )}

      <AddField
        label={words.addLabel}
        placeholder={words.addPlaceholder}
        tone={words.tone}
        onAdd={(itemText) => save(addNote(items, itemText, crypto.randomUUID()))}
      />

      {items.length === 0 && <p className={styles.empty}>{words.empty}</p>}
      {pending.length > 0 && <ListCard>{pending.map(row)}</ListCard>}
      {done.length > 0 && (
        <div className={styles.done}>
          <Disclosure title={`${words.doneTitle} · ${done.length}`}>
            <ListCard>{done.map(row)}</ListCard>
          </Disclosure>
        </div>
      )}

      <NoteEditDialog
        item={items.find((item) => item.id === openId)}
        notePlaceholder={words.notePlaceholder}
        onSave={(change) => {
          if (openId) save(editNote(items, openId, change))
          setOpenId(undefined)
        }}
        onClose={() => setOpenId(undefined)}
      />
    </Screen>
  )
}
