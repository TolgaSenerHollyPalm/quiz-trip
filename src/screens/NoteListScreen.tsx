import { useState, type ComponentType } from 'react'
import { href } from '../app/router.ts'
import { useAppData, useTrip } from '../app/appData.ts'
import { addNote, editNote, toggleNote } from '../trips/notes.ts'
import { deleteItem, forgetDismissed } from '../trips/dismissed.ts'
import { moveAmong } from '../trips/order.ts'
import { applyPlaceSuggestions, placeNames, placeSuggestions } from '../trips/placeSuggestions.ts'
import type { NoteItem } from '../trips/types.ts'
import AddField from 'kitshelf-ui/ui/AddField.tsx'
import { Button } from 'kitshelf-ui/ui/Button.tsx'
import CheckButton from 'kitshelf-ui/ui/CheckButton.tsx'
import DeleteButton from 'kitshelf-ui/ui/DeleteButton.tsx'
import Disclosure from 'kitshelf-ui/ui/Disclosure.tsx'
import { RefreshIcon } from 'kitshelf-ui/ui/icons.tsx'
import { BagIcon, ForkKnifeIcon } from '../ui/icons.tsx'
import { ItemRow, ListCard } from 'kitshelf-ui/ui/ListCard.tsx'
import Missing from 'kitshelf-ui/ui/Missing.tsx'
import Screen from 'kitshelf-ui/ui/Screen.tsx'
import SortHandle from 'kitshelf-ui/ui/SortHandle.tsx'
import Tile from 'kitshelf-ui/ui/Tile.tsx'
import text from 'kitshelf-ui/ui/text.module.css'
import type { Tone } from 'kitshelf-ui/ui/tone.ts'
import ListProgress from '../ui/ListProgress.tsx'
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

/** A list the trip's place may fill with suggestions and the player adds to; ticked items move down under their own heading. */
export default function NoteListScreen({ tripId, list }: { tripId: string; list: NoteList }) {
  const { destinations } = useAppData()
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
  const sort = (from: number, to: number) => save(moveAmong(items, pending.map((item) => item.id), from, to))
  const suggested = placeSuggestions(destinations, trip, list)
  // On an empty list the button asks for the whole suggested list again, deleted suggestions included.
  const suggest = () => {
    const base = items.length === 0 ? forgetDismissed(trip, list) : trip
    saveTrip({ ...base, [list]: applyPlaceSuggestions(items, suggested, base.dismissed?.[list]) })
  }

  const row = (item: NoteItem) => (
    <ItemRow
      key={item.id}
      control={
        // While editing, the open items are sorted by a handle in the check's place.
        inEditMode && !item.done ? (
          <SortHandle id={item.id} item={item.text} onMove={sort} />
        ) : (
          <CheckButton checked={item.done} item={item.text} tone={words.tone} onToggle={() => save(toggleNote(items, item.id))} />
        )
      }
      text={item.text}
      note={item.note}
      done={item.done}
      strong={!item.done}
      onOpen={() => setOpenId(item.id)}
      openLabel={`${item.text}${item.note ? `, ${item.note}` : ''}: düzenle`}
      trailing={
        inEditMode && (
          <DeleteButton item={item.text} onDelete={() => saveTrip(deleteItem(trip, list, item.id))} />
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
      {items.length > 0 ? (
        <ListProgress done={done.length} total={items.length} word={words.doneWord} tone={words.tone} label={words.title} />
      ) : (
        <p className={text.hint}>{words.empty}</p>
      )}

      {/* The same shape as the packing list: the items, then a row to add one. */}
      <ListCard>
        {pending.map(row)}
        <AddField
          inRow
          label={words.addLabel}
          placeholder={words.addPlaceholder}
          tone={words.tone}
          onAdd={(itemText) => save(addNote(items, itemText, crypto.randomUUID()))}
        />
      </ListCard>
      {done.length > 0 && (
        <div className={styles.done}>
          <Disclosure title={`${words.doneTitle} · ${done.length}`}>
            <ListCard>{done.map(row)}</ListCard>
          </Disclosure>
        </div>
      )}

      {suggested.length > 0 && (
        <div className={styles.suggestions}>
          <Button
            variant={items.length === 0 ? 'primary' : 'secondary'}
            inline
            onClick={suggest}
          >
            <RefreshIcon />
            {items.length === 0 ? 'Önerilen listeyi getir' : 'Önerileri yenile'}
          </Button>
          <p className={styles.explain}>
            Öneriler gidilen yere göre gelir: {placeNames(destinations, suggested).join(' ve ')}. İşaretlediğin ve kendi
            yazdığın maddeler yerinde kalır.
          </p>
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
