import { useState } from 'react'
import { useTrip } from '../app/appData.ts'
import { navigate } from '../app/router.ts'
import { addPrediction, missingParams, predictionFromTemplate } from '../game/predictions.ts'
import { parseNumber } from '../game/values.ts'
import type { PredictionTemplate, TemplateParam } from '../packs/types.ts'
import { Button } from '../ui/Button.tsx'
import Missing from '../ui/Missing.tsx'
import Screen from '../ui/Screen.tsx'
import text from '../ui/text.module.css'
import styles from './TripSettingsScreen.module.css'

/** Each trip setting once, under the first template that needs it. */
function settingGroups(templates: PredictionTemplate[]) {
  const seen = new Set<string>()
  return templates
    .map((template) => {
      const params = [template.params?.min, template.params?.max].filter(
        (param): param is TemplateParam => param !== undefined && !seen.has(param.key),
      )
      for (const param of params) seen.add(param.key)
      return { template, params }
    })
    .filter((group) => group.params.length > 0)
}

// Bounds entered here are copied into a prediction when it is added; changing them later leaves it alone.
export default function TripSettingsScreen({ packId, add }: { packId: string; add?: string }) {
  const { pack, trip, saveTrip } = useTrip(packId)
  // Plain digits with a decimal comma: a grouped "12.300" would read back as 12,3.
  const [texts, setTexts] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(trip.params).map(([key, value]) => [key, String(value).replace('.', ',')])),
  )
  const [problems, setProblems] = useState<string[]>([])
  if (!pack) return <Missing message="Bu gezi paketi cihazda yok." back={{ screen: 'home' }} />

  const groups = settingGroups(pack.predictionTemplates)
  const target = add ? pack.predictionTemplates.find((template) => template.id === add) : undefined
  const back = target ? ({ screen: 'prediction-new', packId } as const) : ({ screen: 'trip', packId } as const)

  const save = () => {
    const params: Record<string, number> = {}
    const found: string[] = []
    for (const param of groups.flatMap((group) => group.params)) {
      const entered = (texts[param.key] ?? '').trim()
      if (entered === '') continue
      const value = parseNumber(entered)
      if (value === undefined) found.push(`${param.label}: bir sayı gir.`)
      else params[param.key] = value
    }
    for (const template of pack.predictionTemplates) {
      const low = template.params?.min ? params[template.params.min.key] : template.min
      const high = template.params?.max ? params[template.params.max.key] : template.max
      if (low !== undefined && high !== undefined && low >= high) {
        found.push(`“${template.text}”: alt değer üst değerden küçük olmalı.`)
      }
    }
    const missing = target ? missingParams(target, params) : []
    if (missing.length > 0) found.push(`Bu tahmini eklemek için gerekli: ${missing.map((param) => param.label).join(', ')}.`)
    setProblems(found)
    if (found.length > 0) return

    const updated = { ...trip, params }
    if (target && !trip.predictions.some((prediction) => prediction.templateId === target.id)) {
      const prediction = predictionFromTemplate(target, params, crypto.randomUUID())
      saveTrip(addPrediction(updated, prediction))
      navigate({ screen: 'prediction', packId, predictionId: prediction.id }, { replace: true })
    } else {
      saveTrip(updated)
      navigate(back, { replace: true })
    }
  }

  return (
    <Screen title="Gezi ayarları" back={back}>
      {target && (
        <p className={text.notice}>
          “{target.text}” tahmini için aşağıdaki değerleri gir; kaydedince tahmin eklenecek.
        </p>
      )}
      <p className={text.hint}>
        Otel gibi geziye göre değişen tahmin aralıkları. Bir tahmin eklenirken buradaki değerler ona kopyalanır;
        sonradan değiştirmek, eklenmiş tahminleri etkilemez.
      </p>
      {groups.length === 0 && <p>Bu pakette gezi ayarı gerektiren bir tahmin yok.</p>}
      {groups.map(({ template, params }) => (
        <fieldset key={template.id} className={styles.group}>
          <legend className={styles.legend}>{template.text}</legend>
          {params.map((param) => (
            <label key={param.key} className={styles.field}>
              <span className={styles.label}>{param.label}</span>
              <input
                className={styles.input}
                inputMode="decimal"
                autoComplete="off"
                value={texts[param.key] ?? ''}
                onChange={(event) => setTexts({ ...texts, [param.key]: event.target.value })}
              />
            </label>
          ))}
        </fieldset>
      ))}
      {problems.length > 0 && (
        <ul className={styles.problems} role="alert">
          {problems.map((problem) => (
            <li key={problem} className={text.problem}>
              {problem}
            </li>
          ))}
        </ul>
      )}
      {groups.length > 0 && (
        <Button variant="primary" big onClick={save}>
          {target ? 'Kaydet ve tahmini ekle' : 'Kaydet'}
        </Button>
      )}
    </Screen>
  )
}
