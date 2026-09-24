import { useEffect, useState } from 'react'
import { useAppData } from '../app/appData.ts'
import { navigate } from '../app/router.ts'
import { newTrip } from '../game/trip.ts'
import type { TripState } from '../game/types.ts'
import { bundledPacks } from '../packs/bundled.ts'
import { fetchPackList, type IndexEntry } from '../packs/sync.ts'
import { applySuggestions } from '../trips/checklist.ts'
import { destinationName, findCountry } from '../trips/destinations.ts'
import { matchesDestination } from '../trips/packMatch.ts'
import { todayIso } from '../trips/dates.ts'
import { TRANSPORTS, TRIP_KINDS, type Transport, type TripKind } from '../trips/types.ts'
import { Button } from '../ui/Button.tsx'
import ChoiceGroup from '../ui/ChoiceGroup.tsx'
import { CheckIcon, PlusIcon } from '../ui/icons.tsx'
import { TRANSPORT_LABELS, TRIP_KIND_LABELS } from '../ui/labels.ts'
import Screen from '../ui/Screen.tsx'
import text from '../ui/text.module.css'
import TransportIcon from '../ui/TransportIcon.tsx'
import { useOnline } from '../ui/useOnline.ts'
import styles from './TripWizardScreen.module.css'

const ANY_CITY = '' // "the whole country", which brings every pack of that country

/** Creating a trip one question at a time: where, when, how, and what to play with. */
export default function TripWizardScreen() {
  const { destinations, packs, saveTrip, downloadPacks } = useAppData()
  const online = useOnline()
  const [step, setStep] = useState(0)
  const [country, setCountry] = useState<string>()
  const [cityId, setCityId] = useState<string>(ANY_CITY)
  const [startDate, setStartDate] = useState(todayIso())
  const [endDate, setEndDate] = useState('')
  const [transport, setTransport] = useState<Transport>()
  const [kind, setKind] = useState<TripKind>()
  const [typedName, setTypedName] = useState<string>() // undefined until the player renames the trip
  const [chosenPacks, setChosenPacks] = useState<string[]>([])
  const [offered, setOffered] = useState<IndexEntry[]>()
  const [listProblem, setListProblem] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState<string>()

  const destination = { country, ...(cityId !== ANY_CITY && { cityId }) }
  const suggestedName = destinationName(destinations, country, cityId === ANY_CITY ? undefined : cityId)
  const name = typedName ?? suggestedName // the destination names the trip until the player does
  const cities = findCountry(destinations, country)?.cities ?? []
  // What the device already has, then what the app itself carries, then what the server offers.
  const installed = packs.filter((pack) => matchesDestination(pack, destination))
  const inApp = bundledPacks().filter(
    (pack) => matchesDestination(pack, destination) && !installed.some((other) => other.id === pack.id),
  )
  const atHand = [...installed, ...inApp]
  const choices = [
    ...atHand.map((pack) => ({ id: pack.id, title: pack.title, questionCount: pack.questions.length })),
    ...(offered ?? [])
      .filter((entry) => !atHand.some((pack) => pack.id === entry.id))
      .map((entry) => ({ id: entry.id, title: entry.title, questionCount: entry.questionCount })),
  ]

  const steps = [
    { title: 'Nereye gidiyorsun?', ready: country !== undefined },
    { title: 'Hangi şehir?', ready: true },
    { title: 'Ne zaman?', ready: startDate !== '' && (endDate === '' || endDate >= startDate) },
    { title: 'Nasıl gidiyorsun?', ready: true },
    { title: 'Ne tatili?', ready: true },
    { title: 'Gezinin adı', ready: name.trim() !== '' },
    { title: 'Soru paketleri', ready: true },
  ]
  const last = steps.length - 1

  // The list is only worth fetching once the destination is settled and the player reaches the last step.
  useEffect(() => {
    if (step !== last || offered !== undefined || !online || country === undefined) return undefined
    let active = true
    fetchPackList({
      fetch: (url, init) => fetch(url, init),
      store: { versions: () => Promise.resolve(new Map()), saveIfNewer: () => Promise.resolve(false) },
      baseUrl: import.meta.env.BASE_URL,
      wanted: (pin) => matchesDestination(pin, { country, ...(cityId !== ANY_CITY && { cityId }) }),
    })
      .then((result) => {
        if (!active) return
        if (result.ok) setOffered(result.entries)
        else setListProblem(result.reason)
      })
      .catch(() => {
        if (active) setListProblem('Paket listesi alınamadı.')
      })
    return () => {
      active = false
    }
  }, [step, last, offered, online, country, cityId])

  const create = async () => {
    setBusy(true)
    setFailed(undefined)
    const missing = chosenPacks.filter((id) => !packs.some((pack) => pack.id === id))
    let linked = chosenPacks.filter((id) => packs.some((pack) => pack.id === id))
    if (missing.length > 0) {
      const result = await downloadPacks(missing)
      if (result.ok) {
        linked = [...linked, ...result.saved.map((pack) => pack.id)]
        const trouble = result.outcomes.filter((outcome) => outcome.status === 'failed')
        if (trouble.length > 0) setFailed(trouble[0].reason)
      } else {
        setFailed(result.reason)
      }
    }

    const trip: TripState = {
      ...newTrip(crypto.randomUUID(), name.trim()),
      ...(country && { country }),
      ...(cityId !== ANY_CITY && { cityId }),
      packIds: linked,
      startDate,
      ...(endDate !== '' && { endDate }),
      ...(transport && { transport }),
      ...(kind && { kind }),
    }
    saveTrip({ ...trip, checklist: applySuggestions(trip) })
    setBusy(false)
    navigate({ screen: 'trip', tripId: trip.id }, { replace: true })
  }

  return (
    // The header leaves the wizard; the Geri button walks back through it.
    <Screen title="Yeni gezi" back={{ screen: 'home' }}>
      <p className={styles.progress}>
        <span className={styles.stepCount}>
          Adım {step + 1} / {steps.length}
        </span>
        <span className={styles.bar}>
          <span className={styles.fill} style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </span>
      </p>
      <h2 className={styles.question}>{steps[step].title}</h2>

      {step === 0 && (
        <>
          <ChoiceGroup
            label="Ülke"
            options={destinations.map((option) => ({ value: option.code, label: option.name }))}
            selected={country ? [country] : []}
            pickOne
            placeholder="Ülke seç…"
            onToggle={(code) => {
              setCountry(code)
              setCityId(ANY_CITY)
            }}
          />
          <p className={text.hint}>Ülke, gezinin soru paketlerini getirir. Gerisini sonra da değiştirebilirsin.</p>
        </>
      )}

      {step === 1 && (
        <>
          <ChoiceGroup
            label="Şehir (isteğe bağlı)"
            options={[
              { value: ANY_CITY, label: 'Farketmez' },
              ...cities.map((city) => ({ value: city.id, label: city.name })),
            ]}
            selected={[cityId]}
            onToggle={setCityId}
            pickOne
          />
          <p className={text.hint}>
            Şehir seçersen o şehrin paketi gelir. Seçmezsen ülkenin bütün paketleri bu geziye eklenebilir.
          </p>
        </>
      )}

      {step === 2 && (
        <>
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
          <p className={text.hint}>Gidiş tarihiyle sayaç başlar; dönüşü girersen sayaç gezi boyunca devam eder.</p>
          {endDate !== '' && endDate < startDate && <p className={text.problem}>Dönüş, gidişten önce olamaz.</p>}
        </>
      )}

      {step === 3 && (
        <ChoiceGroup
          label="Araç"
          options={TRANSPORTS.map((value) => ({
            value,
            label: TRANSPORT_LABELS[value],
            icon: <TransportIcon transport={value} size={22} decorative />,
          }))}
          selected={transport ? [transport] : []}
          onToggle={(value) => setTransport(value === transport ? undefined : value)}
        />
      )}

      {step === 4 && (
        <>
          <ChoiceGroup
            label="Tatil türü"
            options={TRIP_KINDS.map((value) => ({ value, label: TRIP_KIND_LABELS[value] }))}
            selected={kind ? [kind] : []}
            onToggle={(value) => setKind(value === kind ? undefined : value)}
          />
          <p className={text.hint}>Hazırlık listesi aracına ve tatil türüne göre hazırlanır.</p>
        </>
      )}

      {step === 5 && (
        <>
          <label className={styles.field}>
            <span className={styles.label}>Ad</span>
            <input
              className={styles.input}
              value={name}
              maxLength={60}
              placeholder="Ör. Sharm tatili"
              onChange={(event) => setTypedName(event.target.value)}
            />
          </label>
          <p className={text.hint}>Gezini listede bu adla göreceksin.</p>
        </>
      )}

      {step === last && (
        <>
          {choices.length > 0 ? (
            <>
              <ChoiceGroup
                label={`${suggestedName} için paketler`}
                options={choices.map((choice) => ({
                  value: choice.id,
                  label: `${choice.title}${choice.questionCount ? ` (${choice.questionCount} soru)` : ''}`,
                  // A plus to add, a tick once it is in: the row has to look like something you press.
                  icon: chosenPacks.includes(choice.id) ? <CheckIcon /> : <PlusIcon />,
                }))}
                selected={chosenPacks}
                onToggle={(id) =>
                  setChosenPacks(
                    chosenPacks.includes(id) ? chosenPacks.filter((other) => other !== id) : [...chosenPacks, id],
                  )
                }
              />
              <p className={text.hint}>
                {chosenPacks.length === 0
                  ? 'Eklemek için pakete dokun. Paketler gezide oynanan bilgi yarışmasını ve tahmin sorularını getirir.'
                  : 'Seçtiklerin gezi oluşturulurken indirilir; sonra da ekleyip çıkarabilirsin.'}
              </p>
            </>
          ) : (
            <p className={text.hint}>
              {!online
                ? 'İnternet yokken paket listesi okunamıyor. Gezi ekranından sonra ekleyebilirsin.'
                : (listProblem ?? (offered === undefined ? 'Paketler aranıyor…' : 'Bu destinasyon için paket yok.'))}
            </p>
          )}
          {failed && <p className={text.problem}>{failed}</p>}
        </>
      )}

      <div className={styles.nav}>
        {step > 0 && (
          <Button onClick={() => setStep(step - 1)} disabled={busy}>
            Geri
          </Button>
        )}
        {step < last ? (
          <Button variant="primary" big disabled={!steps[step].ready} onClick={() => setStep(step + 1)}>
            Devam
          </Button>
        ) : (
          <Button variant="primary" big disabled={busy} onClick={() => void create()}>
            {busy ? 'Hazırlanıyor…' : 'Geziyi oluştur'}
          </Button>
        )}
      </div>
    </Screen>
  )
}
