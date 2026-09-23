import { useState } from 'react'
import { useTrip } from '../app/appData.ts'
import { navigate } from '../app/router.ts'
import {
  addPrediction,
  customPrediction,
  customPredictionProblems,
  describeBounds,
  MAX_CHOICE_OPTIONS,
  missingParams,
  predictionFromTemplate,
  type CustomPredictionInput,
} from '../game/predictions.ts'
import type { Prediction } from '../game/types.ts'
import { parseNumber } from '../game/values.ts'
import type { PredictionTemplate } from '../packs/types.ts'
import { Button } from '../ui/Button.tsx'
import ChoiceGroup from '../ui/ChoiceGroup.tsx'
import Missing from '../ui/Missing.tsx'
import Screen from '../ui/Screen.tsx'
import text from '../ui/text.module.css'
import styles from './AddPredictionScreen.module.css'

export default function AddPredictionScreen({ tripId }: { tripId: string }) {
  const { pack, trip, saveTrip } = useTrip(tripId)
  if (!trip) return <Missing message="Bu gezi bulunamadı." back={{ screen: 'home' }} />
  if (!pack) return <Missing message="Bu gezinin soru paketi cihazda yok." back={{ screen: 'trip', tripId }} />

  const add = (prediction: Prediction) => {
    saveTrip(addPrediction(trip, prediction))
    navigate({ screen: 'prediction', tripId, predictionId: prediction.id }, { replace: true })
  }

  const summary = (template: PredictionTemplate) => {
    if (template.type === 'choice') return template.options?.join(' / ')
    const missing = missingParams(template, trip.params)
    if (missing.length > 0) return `Önce gezi ayarlarında: ${missing.map((param) => param.label).join(', ')}`
    return describeBounds(predictionFromTemplate(template, trip.params, ''))
  }

  return (
    <Screen title="Tahmin ekle" back={{ screen: 'predictions', tripId }}>
      <h2 className={text.heading}>Paketteki sorular</h2>
      <ul className={styles.templates}>
        {pack.predictionTemplates.map((template) => {
          const added = trip.predictions.some((prediction) => prediction.templateId === template.id)
          return (
            <li key={template.id} className={styles.template}>
              <div>
                <p className={styles.templateText}>{template.text}</p>
                <p className={text.hint}>{summary(template)}</p>
              </div>
              <div className={styles.templateAction}>
                <Button
                  disabled={added}
                  onClick={() =>
                    missingParams(template, trip.params).length > 0
                      ? navigate({ screen: 'settings', tripId, add: template.id })
                      : add(predictionFromTemplate(template, trip.params, crypto.randomUUID()))
                  }
                >
                  {added ? 'Eklendi' : 'Ekle'}
                </Button>
              </div>
            </li>
          )
        })}
      </ul>

      <h2 className={text.heading}>Kendi sorun</h2>
      <CustomPredictionForm onAdd={(input) => add(customPrediction(input, crypto.randomUUID()))} />
    </Screen>
  )
}

const KINDS: { value: CustomPredictionInput['kind']; label: string }[] = [
  { value: 'number', label: 'Sayı' },
  { value: 'duration', label: 'Süre (SS:DD)' },
  { value: 'choice', label: 'Seçenekli' },
]

function CustomPredictionForm({ onAdd }: { onAdd: (input: CustomPredictionInput) => void }) {
  const [question, setQuestion] = useState('')
  const [kind, setKind] = useState<CustomPredictionInput['kind']>('number')
  const [unit, setUnit] = useState('')
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [problems, setProblems] = useState<string[]>([])

  const submit = () => {
    const bound = (value: string) => (value.trim() === '' ? undefined : parseNumber(value))
    const input: CustomPredictionInput = { text: question, kind, unit, min: bound(min), max: bound(max), options }
    const found = customPredictionProblems(input)
    const unreadable = (value: string) => value.trim() !== '' && parseNumber(value) === undefined
    if (kind === 'number' && (unreadable(min) || unreadable(max))) found.push('En az ve en çok değer sayı olmalı.')
    setProblems(found)
    if (found.length === 0) onAdd(input)
  }

  return (
    <div className={styles.form}>
      <label className={styles.field}>
        <span className={styles.label}>Soru</span>
        <input
          className={styles.input}
          value={question}
          maxLength={140}
          placeholder="Ör. Kaç deve göreceğiz?"
          onChange={(event) => setQuestion(event.target.value)}
        />
      </label>
      <ChoiceGroup label="Cevap tipi" options={KINDS} selected={[kind]} onToggle={setKind} />

      {kind === 'number' && (
        <>
          <label className={styles.field}>
            <span className={styles.label}>Birim (isteğe bağlı)</span>
            <input className={styles.input} value={unit} maxLength={12} placeholder="ör. kg" onChange={(event) => setUnit(event.target.value)} />
          </label>
          <div className={styles.pair}>
            <label className={styles.field}>
              <span className={styles.label}>En az (isteğe bağlı)</span>
              <input className={styles.input} inputMode="decimal" value={min} onChange={(event) => setMin(event.target.value)} />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>En çok (isteğe bağlı)</span>
              <input className={styles.input} inputMode="decimal" value={max} onChange={(event) => setMax(event.target.value)} />
            </label>
          </div>
        </>
      )}

      {kind === 'choice' && (
        <>
          <ol className={styles.options}>
            {options.map((option, index) => (
              <li key={index} className={styles.option}>
                <input
                  className={styles.input}
                  value={option}
                  maxLength={60}
                  placeholder={`${index + 1}. seçenek`}
                  aria-label={`${index + 1}. seçenek`}
                  onChange={(event) => setOptions(options.map((o, i) => (i === index ? event.target.value : o)))}
                />
                <button
                  type="button"
                  className={styles.remove}
                  aria-label={`${index + 1}. seçeneği sil`}
                  disabled={options.length <= 2}
                  onClick={() => setOptions(options.filter((_, i) => i !== index))}
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </button>
              </li>
            ))}
          </ol>
          <Button disabled={options.length >= MAX_CHOICE_OPTIONS} onClick={() => setOptions([...options, ''])}>
            + Seçenek ekle
          </Button>
        </>
      )}

      {problems.length > 0 && (
        <ul className={styles.problems} role="alert">
          {problems.map((problem) => (
            <li key={problem} className={text.problem}>
              {problem}
            </li>
          ))}
        </ul>
      )}
      <Button variant="primary" onClick={submit}>
        Soruyu ekle
      </Button>
    </div>
  )
}
