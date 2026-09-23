import { useState } from 'react'
import { useAppData } from '../app/appData.ts'
import { navigate } from '../app/router.ts'
import type { TripState } from '../game/types.ts'
import { applySuggestions } from '../trips/checklist.ts'
import { findCountry } from '../trips/destinations.ts'
import { TRANSPORTS, TRIP_KINDS, type Transport, type TripKind } from '../trips/types.ts'
import { Button } from '../ui/Button.tsx'
import ChoiceGroup from '../ui/ChoiceGroup.tsx'
import { TRANSPORT_LABELS, TRIP_KIND_LABELS } from '../ui/labels.ts'
import Missing from '../ui/Missing.tsx'
import Screen from '../ui/Screen.tsx'
import text from '../ui/text.module.css'
import TransportIcon from '../ui/TransportIcon.tsx'
import styles from './TripFormScreen.module.css'

/** Editing a trip that already exists; creating one is the wizard's job. */
export default function TripFormScreen({ tripId }: { tripId: string }) {
  const { destinations, trips, saveTrip } = useAppData()
  const existing = trips.find((trip) => trip.id === tripId)
  const [name, setName] = useState(existing?.name ?? '')
  const [startDate, setStartDate] = useState(existing?.startDate ?? '')
  const [endDate, setEndDate] = useState(existing?.endDate ?? '')
  const [transport, setTransport] = useState<Transport | undefined>(existing?.transport)
  const [kind, setKind] = useState<TripKind | undefined>(existing?.kind)
  const [country, setCountry] = useState(existing?.country ?? '')
  const [cityId, setCityId] = useState(existing?.cityId ?? '')
  const [problems, setProblems] = useState<string[]>([])

  if (!existing) return <Missing message="Bu gezi bulunamadı." back={{ screen: 'home' }} />

  const save = () => {
    const found: string[] = []
    if (name.trim() === '') found.push('Geziye bir ad ver.')
    if (country === '') found.push('Gezinin ülkesini seç.')
    if (startDate === '') found.push('Gidiş tarihini seç.')
    if (endDate !== '' && startDate !== '' && endDate < startDate) found.push('Dönüş, gidişten önce olamaz.')
    setProblems(found)
    if (found.length > 0) return

    const trip: TripState = {
      ...existing,
      name: name.trim(),
      startDate,
      endDate: endDate === '' ? undefined : endDate,
      transport,
      kind,
      country,
      cityId: cityId === '' ? undefined : cityId,
    }
    // The suggestions follow the vehicle and the holiday type, so they are refreshed when those change.
    const stale = existing.transport !== transport || existing.kind !== kind || existing.checklist.length === 0
    saveTrip(stale ? { ...trip, checklist: applySuggestions(trip) } : trip)
    navigate({ screen: 'trip', tripId: trip.id }, { replace: true })
  }

  return (
    <Screen title="Geziyi düzenle" back={{ screen: 'trip', tripId }}>
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

      <ChoiceGroup
        label="Ülke"
        options={destinations.map((option) => ({ value: option.code, label: option.name }))}
        selected={country === '' ? [] : [country]}
        pickOne
        placeholder="Ülke seç…"
        onToggle={(code) => {
          setCountry(code)
          setCityId('')
        }}
      />
      <ChoiceGroup
        label="Şehir (isteğe bağlı)"
        options={[
          { value: '', label: 'Farketmez' },
          ...(findCountry(destinations, country)?.cities ?? []).map((city) => ({ value: city.id, label: city.name })),
        ]}
        selected={[cityId]}
        onToggle={setCityId}
        pickOne
      />
      <p className={text.hint}>
        Destinasyon, geziye hangi soru paketlerinin uyduğunu belirler; paketleri gezinin kendi “Soru paketleri”
        ekranından yönetirsin. Araç ve tatil türünü değiştirdiğinde hazırlık listesi yenilenir.
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
        Kaydet
      </Button>
    </Screen>
  )
}
