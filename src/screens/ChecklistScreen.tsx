import { useId, useState } from 'react'
import { href } from '../app/router.ts'
import { useTrip } from '../app/appData.ts'
import { applySuggestions } from '../trips/checklist.ts'
import type { ChecklistItem } from '../trips/types.ts'
import AddField from 'kitshelf-ui/ui/AddField.tsx'
import { Button } from 'kitshelf-ui/ui/Button.tsx'
import CheckButton from 'kitshelf-ui/ui/CheckButton.tsx'
import DeleteButton from 'kitshelf-ui/ui/DeleteButton.tsx'
import Disclosure from 'kitshelf-ui/ui/Disclosure.tsx'
import { RefreshIcon } from 'kitshelf-ui/ui/icons.tsx'
import { checklistBasis, sourceLabel } from '../ui/labels.ts'
import { ItemRow, ListCard } from 'kitshelf-ui/ui/ListCard.tsx'
import Missing from 'kitshelf-ui/ui/Missing.tsx'
import ProgressBar from 'kitshelf-ui/ui/ProgressBar.tsx'
import Screen from 'kitshelf-ui/ui/Screen.tsx'
import SegmentedTabs from 'kitshelf-ui/ui/SegmentedTabs.tsx'
import text from 'kitshelf-ui/ui/text.module.css'
import styles from './ChecklistScreen.module.css'

type Group = ChecklistItem['group']

const GROUPS: Record<Group, { tab: string; label: string; placeholder: string }> = {
  pack: { tab: 'Alınacaklar', label: 'Yeni alınacak', placeholder: 'Madde ekle, ör. fotoğraf makinesi' },
  do: { tab: 'Yapılacaklar', label: 'Yeni yapılacak', placeholder: 'Madde ekle, ör. komşuya anahtar' },
}

export default function ChecklistScreen({ tripId }: { tripId: string }) {
  const { trip, saveTrip } = useTrip(tripId)
  const [group, setGroup] = useState<Group>('pack')
  const [editing, setEditing] = useState(false)
  const panelId = useId()
  if (!trip) return <Missing message="Bu seyahat bulunamadı." back={href({ screen: 'home' })} />

  const items = trip.checklist
  const save = (checklist: ChecklistItem[]) => saveTrip({ ...trip, checklist })
  const toggle = (id: string) => save(items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
  const remove = (id: string) => save(items.filter((item) => item.id !== id))
  const add = (itemText: string) => save([...items, { id: crypto.randomUUID(), text: itemText, group, done: false }])

  const done = items.filter((item) => item.done).length
  const open = (of: Group) => items.filter((item) => item.group === of && !item.done)
  const finished = items.filter((item) => item.group === group && item.done)
  const inEditMode = editing && items.length > 0

  const row = (item: ChecklistItem) => (
    <ItemRow
      key={item.id}
      control={<CheckButton checked={item.done} item={item.text} tone="teal" onToggle={() => toggle(item.id)} />}
      text={item.text}
      note={item.done ? undefined : sourceLabel(item.source)} // where a done item came from no longer matters
      done={item.done}
      trailing={
        inEditMode && (
          <DeleteButton item={item.text} onDelete={() => remove(item.id)} />
        )
      }
    />
  )

  return (
    <Screen
      title="Hazırlık listesi"
      subtitle={checklistBasis(trip.transport, trip.kind)}
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
        <section className={styles.progress} aria-label="İlerleme">
          <div className={styles.progressHead}>
            <p className={styles.count}>
              <strong>{done}</strong> / {items.length} tamam
            </p>
            <span className={styles.percent}>%{Math.round((done / items.length) * 100)}</span>
          </div>
          <ProgressBar value={done} max={items.length} tone="teal" label="Hazırlık listesi" thick />
        </section>
      ) : (
        <p className={text.hint}>
          Liste boş. Ulaşım türüne ve tatil tarzına göre hazır bir liste getirebilir ya da maddeleri kendin yazabilirsin.
        </p>
      )}

      <SegmentedTabs
        label="Liste türü"
        options={(['pack', 'do'] as const).map((value) => ({ value, label: `${GROUPS[value].tab} · ${open(value).length}` }))}
        selected={group}
        onSelect={setGroup}
        panelId={panelId}
      />

      <div id={panelId} role="tabpanel" aria-label={GROUPS[group].tab} className={styles.panel}>
        <ListCard>
          {open(group).map(row)}
          <AddField inRow label={GROUPS[group].label} placeholder={GROUPS[group].placeholder} tone="teal" onAdd={add} />
        </ListCard>

        {finished.length > 0 && (
          <div className={styles.finished}>
            <Disclosure title={`Tamamlananlar · ${finished.length}`}>
              <ListCard>{finished.map(row)}</ListCard>
            </Disclosure>
          </div>
        )}
      </div>

      <div className={styles.suggestions}>
        <Button variant={items.length === 0 ? 'primary' : 'secondary'} inline onClick={() => save(applySuggestions(trip))}>
          <RefreshIcon />
          {items.length === 0 ? 'Önerilen listeyi getir' : 'Önerileri yenile'}
        </Button>
        <p className={styles.explain}>
          Öneriler ulaşım türüne ve tatil tarzına göre gelir. İşaretlediğin ve kendi yazdığın maddeler yerinde kalır.
        </p>
      </div>
    </Screen>
  )
}
