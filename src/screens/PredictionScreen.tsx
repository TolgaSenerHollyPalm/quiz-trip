import { useState } from 'react'
import { useTrip } from '../app/appData.ts'
import { href, navigate } from '../app/router.ts'
import { deletePrediction, describeBounds, formatAnswer } from '../game/predictions.ts'
import { LinkButton } from 'kitshelf-ui/ui/Button.tsx'
import ConfirmDialog from 'kitshelf-ui/ui/ConfirmDialog.tsx'
import GuessList from '../ui/GuessList.tsx'
import Menu from 'kitshelf-ui/ui/Menu.tsx'
import Missing from 'kitshelf-ui/ui/Missing.tsx'
import Screen from 'kitshelf-ui/ui/Screen.tsx'
import { tripTheme } from '../ui/tripTheme.ts'
import StatusBadge from '../ui/StatusBadge.tsx'
import text from 'kitshelf-ui/ui/text.module.css'
import styles from './PredictionScreen.module.css'

export default function PredictionScreen({ tripId, predictionId }: { tripId: string; predictionId: string }) {
  const { trip, saveTrip } = useTrip(tripId)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const back = { screen: 'predictions', tripId } as const
  const prediction = trip?.predictions.find((p) => p.id === predictionId)
  if (deleted) return null // leaving for the list
  if (!trip) return <Missing message="Bu seyahat bulunamadı." back={href({ screen: 'home' })} />
  if (!prediction) return <Missing message="Bu tahmin bulunamadı." back={href(back)} />

  const guess = { screen: 'guess', tripId, predictionId } as const
  const resultEntry = { screen: 'prediction-result', tripId, predictionId } as const
  const entered = trip.players.filter((player) => player.id in prediction.guesses)
  const bounds = prediction.type === 'number' ? describeBounds(prediction) : prediction.options?.join(' / ')

  return (
    <Screen
      title="Tahmin"
      back={href(back)}
      theme={tripTheme(trip.kind)}
      aside={<Menu items={[{ label: 'Tahmini sil', onSelect: () => setConfirmingDelete(true), danger: true }]} />}
      footer={
        prediction.status === 'open' && trip.players.length > 0 ? (
          <LinkButton to={href(guess)} variant="primary" big>
            {entered.length === 0 ? 'Tahminleri girmeye başla' : 'Kalan oyuncular girsin'}
          </LinkButton>
        ) : prediction.status === 'locked' ? (
          <LinkButton to={href(resultEntry)} variant="primary" big>
            Sonucu gir
          </LinkButton>
        ) : undefined
      }
    >
      <div>
        <StatusBadge status={prediction.status} />
      </div>
      <p className={text.question}>{prediction.text}</p>
      {bounds && <p className={text.meta}>{bounds}</p>}

      {prediction.status === 'open' && (
        <>
          <p>
            {entered.length}/{trip.players.length} oyuncu girdi. Tahminler herkes girene kadar gizli kalır.
          </p>
          <ul className={styles.players}>
            {trip.players.map((player) => (
              <li key={player.id} className={styles.player}>
                <span className={styles.name}>{player.nickname}</span>
                {player.id in prediction.guesses ? (
                  <a href={href({ ...guess, playerId: player.id })}>Girdi · değiştir</a>
                ) : (
                  <span className={text.hint}>Bekleniyor</span>
                )}
              </li>
            ))}
          </ul>
          {trip.players.length === 0 && <p className={text.notice}>Önce oyuncuları ekle.</p>}
        </>
      )}

      {prediction.status === 'locked' && (
        <>
          <p>Herkes girdi; tahminler kilitlendi.</p>
          <GuessList prediction={prediction} players={trip.players} />
        </>
      )}

      {prediction.status === 'resolved' && (
        <>
          <p className={styles.result}>Sonuç: {formatAnswer(prediction, prediction.result!)}</p>
          <GuessList prediction={prediction} players={trip.players} />
          <LinkButton to={href(resultEntry)}>Sonucu düzelt</LinkButton>
        </>
      )}

      <ConfirmDialog
        open={confirmingDelete}
        title="Tahmin silinsin mi?"
        confirmLabel="Sil"
        onConfirm={() => {
          setDeleted(true)
          saveTrip(deletePrediction(trip, prediction.id))
          navigate(back, { replace: true })
        }}
        onCancel={() => setConfirmingDelete(false)}
      >
        {prediction.status === 'resolved'
          ? 'Bu tahminden alınan puanlar da skor tablosundan silinir.'
          : 'Girilen tahminler de silinir.'}
      </ConfirmDialog>
    </Screen>
  )
}
