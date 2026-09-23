import { useState } from 'react'
import { useTrip } from '../app/appData.ts'
import { navigate } from '../app/router.ts'
import { formatAnswer, resultProblem, setResult } from '../game/predictions.ts'
import { Button } from '../ui/Button.tsx'
import Missing from '../ui/Missing.tsx'
import Screen from '../ui/Screen.tsx'
import text from '../ui/text.module.css'
import ValueField from '../ui/ValueField.tsx'

export default function PredictionResultScreen({ tripId, predictionId }: { tripId: string; predictionId: string }) {
  const { pack, trip, saveTrip } = useTrip(tripId)
  const [value, setValue] = useState<number>()
  const [problem, setProblem] = useState<string>()
  const detail = { screen: 'prediction', tripId, predictionId } as const
  const prediction = trip?.predictions.find((p) => p.id === predictionId)
  if (!trip) return <Missing message="Bu gezi bulunamadı." back={{ screen: 'home' }} />
  if (!pack || !prediction) return <Missing message="Bu tahmin bulunamadı." back={{ screen: 'predictions', tripId }} />
  if (prediction.status === 'open') {
    return <Missing message="Sonuç, herkes tahminini girdikten sonra girilebilir." back={detail} />
  }

  const correcting = prediction.status === 'resolved'
  const save = () => {
    const issue = resultProblem(prediction, value ?? Number.NaN)
    if (issue) {
      setProblem(issue)
      return
    }
    saveTrip(setResult(trip, prediction.id, value!))
    navigate(detail, { replace: true })
  }

  return (
    <Screen title={correcting ? 'Sonucu düzelt' : 'Sonucu gir'} back={detail}>
      <p className={text.question}>{prediction.text}</p>
      {correcting && <p className={text.meta}>Şu anki sonuç: {formatAnswer(prediction, prediction.result!)}</p>}
      <ValueField
        prediction={prediction}
        label="Gerçek değer"
        invalid={problem !== undefined}
        onChange={(next) => {
          setValue(next)
          setProblem(undefined)
        }}
      />
      {prediction.type === 'number' && <p className={text.hint}>Gerçek değer tahmin aralığının dışında da olabilir.</p>}
      {problem && (
        <p className={text.problem} role="alert">
          {problem}
        </p>
      )}
      <Button variant="primary" big onClick={save}>
        {correcting ? 'Düzelt, puanları yeniden hesapla' : 'Kaydet ve puanla'}
      </Button>
    </Screen>
  )
}
