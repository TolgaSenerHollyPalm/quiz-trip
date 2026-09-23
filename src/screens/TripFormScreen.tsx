import { useState } from 'react'
import { useAppData } from '../app/appData.ts'
import { navigate } from '../app/router.ts'
import { newTrip } from '../game/trip.ts'
import type { TripState } from '../game/types.ts'
import { applySuggestions } from '../trips/checklist.ts'
import { TRANSPORTS, TRIP_KINDS, type Transport, type TripKind } from '../trips/types.ts'
import { Button } from '../ui/Button.tsx'
import ChoiceGroup from '../ui/ChoiceGroup.tsx'
import { TRANSPORT_LABELS, TRIP_KIND_LABELS } from '../ui/labels.ts'
import Missing from '../ui/Missing.tsx'
import Screen from '../ui/Screen.tsx'
import text from '../ui/text.module.css'
import TransportIcon from '../ui/TransportIcon.tsx'
import styles from './TripFormScreen.module.css'

/** Creates a trip, or edits the one whose id is given. */
export default function TripFormScreen({ tripId }: { tripId?: string }) {
  const { packs, trips, saveTrip } = useAppData()
  const existing = tripId === undefined ? undefined : trips.find((trip) => trip.id === tripId)
  const [name, setName] = useState(existing?.name ?? '')
  const [startDate, setStartDate] = useState(existing?.startDate ?? '')
  const [endDate, setEndDate] = useState(existing?.endDate ?? '')
  const [transport, setTransport] = useState<Transport | undefined>(existing?.transport)
  const [kind, setKind] = useState<TripKind | undefined>(existing?.kind)
  const [packIds, setPackIds] = useState<string[]>(existing?.packIds ?? [])
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

    const base = existing ?? newTrip(crypto.randomUUID(), name.trim())
    const trip: TripState = {
      ...base,
      name: name.trim(),
      startDate,
      endDate: endDate === '' ? undefined : endDate,
      transport,
      kind,
      packIds,
    }
    // The suggestions follow the vehicle and the holiday type, so they are refreshed when those change.
    const stale = base.transport !== transport || base.kind !== kind || base.checklist.length === 0
    saveTrip(stale ? { ...trip, checklist: applySuggestions(trip) } : trip)
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

      <p className={text.hint}>Dönüş tarihini girersen sayaç gezi boyunca devam eder.</p>

      <ChoiceGroup
        label="Nasıl gidiyorsun?"
        options={TRANSPORTS.map((value) => ({
          value,
          label: TRANSPORT_LABELS[value],
          icon: <TransportIcon transport={value} size={22} decorative />,
        }))}
        selected={transport ? [transport] : []}
        onToggle={(value) => setTransport(value === transport ? undefined : value)}
      />
      <ChoiceGroup
        label="Ne tatili?"
        options={TRIP_KINDS.map((value) => ({ value, label: TRIP_KIND_LABELS[value] }))}
        selected={kind ? [kind] : []}
        onToggle={(value) => setKind(value === kind ? undefined : value)}
      />

      {packs.length > 0 && (
        <ChoiceGroup
          label="Soru paketleri (isteğe bağlı)"
          options={packs.map((pack) => ({ value: pack.id, label: pack.title }))}
          selected={packIds}
          onToggle={(id) => setPackIds(packIds.includes(id) ? packIds.filter((other) => other !== id) : [...packIds, id])}
        />
      )}
      <p className={text.hint}>
        Paketler, gezide oynanacak bilgi yarışması ve tahmin sorularını getirir; birkaç paket seçersen sorular
        tek havuzda birleşir. Araç ve tatil türünü seçtiğinde hazırlık listesi kendiliğinden hazırlanır.
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
