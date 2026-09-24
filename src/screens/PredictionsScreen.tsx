import { useTrip } from '../app/appData.ts'
import { href } from '../app/router.ts'
import { formatAnswer } from '../game/predictions.ts'
import type { Prediction } from '../game/types.ts'
import { LinkButton } from '../ui/Button.tsx'
import Missing from '../ui/Missing.tsx'
import Screen from '../ui/Screen.tsx'
import { tripTheme } from '../ui/tripTheme.ts'
import StatusBadge from '../ui/StatusBadge.tsx'
import text from '../ui/text.module.css'
import styles from './PredictionsScreen.module.css'

const SECTIONS: { status: Prediction['status']; title: string }[] = [
  { status: 'open', title: 'Tahmin bekleyenler' },
  { status: 'locked', title: 'Sonuç bekleyenler' },
  { status: 'resolved', title: 'Sonuçlananlar' },
]

export default function PredictionsScreen({ tripId }: { tripId: string }) {
  const { trip } = useTrip(tripId)
  if (!trip) return <Missing message="Bu gezi bulunamadı." back={{ screen: 'home' }} />

  const detail = (prediction: Prediction) => {
    if (prediction.status === 'resolved') return `Sonuç: ${formatAnswer(prediction, prediction.result!)}`
    if (prediction.status === 'locked') return 'Sonucu girilecek'
    const entered = trip.players.filter((player) => player.id in prediction.guesses).length
    return `${entered}/${trip.players.length} oyuncu girdi`
  }

  return (
    <Screen title="Tahminler" back={{ screen: 'trip', tripId }} theme={tripTheme(trip.kind)}>
      {trip.players.length === 0 && (
        <p className={text.notice}>
          Tahmin girmek için önce <a href={href({ screen: 'players', tripId })}>oyuncuları ekle</a>.
        </p>
      )}
      <LinkButton to={{ screen: 'prediction-new', tripId }} variant="primary">
        + Tahmin ekle
      </LinkButton>
      {trip.predictions.length === 0 && (
        <p className={text.hint}>Henüz tahmin yok. Paketteki hazır sorulardan seçebilir ya da kendi sorunu yazabilirsin.</p>
      )}
      {SECTIONS.map(({ status, title }) => {
        const items = trip.predictions.filter((prediction) => prediction.status === status)
        if (items.length === 0) return null
        return (
          <section key={status} className={styles.section}>
            <h2 className={text.heading}>{title}</h2>
            <ul className={styles.list}>
              {items.map((prediction) => (
                <li key={prediction.id}>
                  <a className={styles.item} href={href({ screen: 'prediction', tripId, predictionId: prediction.id })}>
                    <span className={styles.text}>{prediction.text}</span>
                    <span className={styles.meta}>
                      <StatusBadge status={prediction.status} />
                      {detail(prediction)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </Screen>
  )
}
