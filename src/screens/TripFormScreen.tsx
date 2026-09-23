import { useState } from 'react'
import { useAppData } from '../app/appData.ts'
import { navigate } from '../app/router.ts'
import { newTrip } from '../game/trip.ts'
import type { TripState } from '../game/types.ts'
import { TRANSPORTS, TRIP_KINDS, type Transport, type TripKind } from '../trips/types.ts'
import { Button } from '../ui/Button.tsx'
import ChoiceGroup from '../ui/ChoiceGroup.tsx'
import { TRANSPORT_LABELS, TRIP_KIND_LABELS } from '../ui/labels.ts'
import Missing from '../ui/Missing.tsx'
import Screen from '../ui/Screen.tsx'
import text from '../ui/text.module.css'
import styles from './TripFormScreen.module.css'

const NO_PACK = ''

/** Creates a trip, or edits the one whose id is given. */
export default function TripFormScreen({ tripId }: { tripId?: string }) {
  const { packs, trips, saveTrip } = useAppData()
  const existing = tripId === undefined ? undefined : trips.find((trip) => trip.id === tripId)
  const [name, setName] = useState(existing?.name ?? '')
  const [startDate, setStartDate] = useState(existing?.startDate ?? '')
  const [endDate, setEndDate] = useState(existing?.endDate ?? '')
  const [transport, setTransport] = useState<Transport | undefined>(existing?.transport)
  const [kind, setKind] = useState<TripKind | undefined>(existing?.kind)
  const [packId, setPackId] = useState(existing?.packId ?? NO_PACK)
  const [problems, setProblems] = useState<string[]>([])

  if (tripId !== undefined && !existing) {
    return <Missing message="Bu gezi bulunamadı." back={{ screen: 'home' }} />
  }

  const save = () => {
    const found: string[] = []
    if (name.trim() === '') found.push('Geziye bir ad ver.')
    if (startDate === '') found.push('Gidiş tarihini seç.')
    if (endDate !== '' && startDate !== '' && endDate < startDate) found.push('Dönüş, gidişten önce olamaz.')
    setProblems(found)
    if (found.length > 0) return

    const trip: TripState = {
      ...(existing ?? newTrip(crypto.randomUUID(), name.trim())),
      name: name.trim(),
      startDate,
      endDate: endDate === '' ? undefined : endDate,
      transport,
      kind,
      packId: packId === NO_PACK ? undefined : packId,
    }
    saveTrip(trip)
    navigate({ screen: 'trip', tripId: trip.id }, { replace: true })
  }

  const back = existing ? ({ screen: 'trip', tripId: existing.id } as const) : ({ screen: 'home' } as const)

  return (
    <Screen title={existing ? 'Geziyi düzenle' : 'Yeni gezi'} back={back}>
      <label className={styles.field}>
        <span className={styles.label}>Gezinin adı</span>
        <input
          className={styles.input}
          value={name}
          maxLength={60}
          placeholder="Ör. Sharm tatili"
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <div className={styles.pair}>
        <label className={styles.field}>
          <span className={styles.label}>Gidiş</span>
          <input
            className={styles.input}
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Dönüş (isteğe bağlı)</span>
          <input
            className={styles.input}
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </label>
      </div>

      <ChoiceGroup
        label="Nasıl gidiyorsun?"
        options={TRANSPORTS.map((value) => ({ value, label: TRANSPORT_LABELS[value] }))}
        selected={transport ? [transport] : []}
        onToggle={(value) => setTransport(value === transport ? undefined : value)}
      />
      <ChoiceGroup
        label="Ne tatili?"
        options={TRIP_KINDS.map((value) => ({ value, label: TRIP_KIND_LABELS[value] }))}
        selected={kind ? [kind] : []}
        onToggle={(value) => setKind(value === kind ? undefined : value)}
      />

      <ChoiceGroup
        label="Soru paketi (isteğe bağlı)"
        options={[
          { value: NO_PACK, label: 'Paket yok' },
          ...packs.map((pack) => ({ value: pack.id, label: pack.title })),
        ]}
        selected={[packId]}
        onToggle={setPackId}
      />
      <p className={text.hint}>
        Paket, gezide oynanacak bilgi yarışması ve tahmin sorularını getirir. Sonradan da seçebilirsin.
      </p>

      {problems.length > 0 && (
        <ul className={styles.problems} role="alert">
          {problems.map((problem) => (
            <li key={problem} className={text.problem}>
              {problem}
            </li>
          ))}
        </ul>
      )}

      <Button variant="primary" big onClick={save}>
        {existing ? 'Kaydet' : 'Geziyi oluştur'}
      </Button>
    </Screen>
  )
}
