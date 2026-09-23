import { useState } from 'react'
import { useTrip } from '../app/appData.ts'
import { applySuggestions } from '../trips/checklist.ts'
import type { ChecklistItem } from '../trips/types.ts'
import { Button } from '../ui/Button.tsx'
import Missing from '../ui/Missing.tsx'
import Screen from '../ui/Screen.tsx'
import text from '../ui/text.module.css'
import styles from './ChecklistScreen.module.css'

const GROUPS = [
  { group: 'pack' as const, title: 'Alınacaklar', placeholder: 'Ör. fotoğraf makinesi' },
  { group: 'do' as const, title: 'Yapılacaklar', placeholder: 'Ör. komşuya anahtar bırak' },
]

export default function ChecklistScreen({ tripId }: { tripId: string }) {
  const { trip, saveTrip } = useTrip(tripId)
  if (!trip) return <Missing message="Bu gezi bulunamadı." back={{ screen: 'home' }} />

  const save = (checklist: ChecklistItem[]) => saveTrip({ ...trip, checklist })
  const toggle = (id: string) =>
    save(trip.checklist.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
  const remove = (id: string) => save(trip.checklist.filter((item) => item.id !== id))
  const add = (group: ChecklistItem['group'], itemText: string) =>
    save([...trip.checklist, { id: crypto.randomUUID(), text: itemText, group, done: false }])

  const done = trip.checklist.filter((item) => item.done).length
  const total = trip.checklist.length

  return (
    <Screen title="Hazırlık listesi" back={{ screen: 'trip', tripId }} wide>
      {total > 0 && (
        <p className={styles.progress}>
          <span className={styles.count}>
            {done} / {total} tamam
          </span>
          <span className={styles.bar}>
            <span className={styles.fill} style={{ width: `${Math.round((done / total) * 100)}%` }} />
          </span>
        </p>
      )}

      {total === 0 && (
        <p className={text.hint}>
          Liste boş. Aracına ve tatil türüne göre hazır bir liste getirebilir ya da maddeleri kendin
          yazabilirsin.
        </p>
      )}

      <div className={styles.sections}>
        {GROUPS.map(({ group, title, placeholder }) => {
          const items = trip.checklist.filter((item) => item.group === group)
          return (
            <section key={group} className={styles.section}>
              <h2 className={text.heading}>{title}</h2>
              {items.length === 0 ? (
                <p className={text.hint}>Bu bölümde henüz madde yok.</p>
              ) : (
                <ul className={styles.items}>
                  {items.map((item) => (
                    <li key={item.id} className={styles.item}>
                      <label className={styles.check}>
                        <input
                          type="checkbox"
                          className={styles.box}
                          checked={item.done}
                          onChange={() => toggle(item.id)}
                        />
                        <span className={item.done ? styles.doneText : undefined}>{item.text}</span>
                      </label>
                      <button
                        type="button"
                        className={styles.remove}
                        aria-label={`${item.text} maddesini sil`}
                        onClick={() => remove(item.id)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <AddRow placeholder={placeholder} onAdd={(itemText) => add(group, itemText)} />
            </section>
          )
        })}
      </div>

      <Button variant="primary" onClick={() => save(applySuggestions(trip))}>
        {total === 0 ? 'Önerilen listeyi getir' : 'Önerileri yenile'}
      </Button>
      <p className={text.hint}>
        Öneriler aracına ve tatil türüne göre gelir. İşaretlediğin ve kendi yazdığın maddeler yerinde kalır.
      </p>
    </Screen>
  )
}

function AddRow({ placeholder, onAdd }: { placeholder: string; onAdd: (text: string) => void }) {
  const [draft, setDraft] = useState('')
  const submit = () => {
    const trimmed = draft.trim()
    if (trimmed === '') return
    onAdd(trimmed)
    setDraft('')
  }

  return (
    <form
      className={styles.add}
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <input
        className={styles.input}
        value={draft}
        maxLength={80}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => setDraft(event.target.value)}
      />
      <Button type="submit" disabled={draft.trim() === ''}>
        Ekle
      </Button>
    </form>
  )
}
