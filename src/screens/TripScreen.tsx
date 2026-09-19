import { useState } from 'react'
import { useTrip } from '../app/appData.ts'
import type { Route } from '../app/router.ts'
import { cancelRound } from '../game/trip.ts'
import { Button, LinkButton } from '../ui/Button.tsx'
import ConfirmDialog from '../ui/ConfirmDialog.tsx'
import Missing from '../ui/Missing.tsx'
import Screen from '../ui/Screen.tsx'
import styles from './TripScreen.module.css'

export default function TripScreen({ packId }: { packId: string }) {
  const { pack, trip, saveTrip } = useTrip(packId)
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  if (!pack) return <Missing message="Bu gezi paketi cihazda yok." back={{ screen: 'home' }} />

  const round = trip.currentRound
  // Predictions that still need guesses or a result.
  const waiting = trip.predictions.filter((prediction) => prediction.status !== 'resolved').length
  const quiz: Route =
    trip.players.length === 0 ? { screen: 'players', packId, next: 'quiz' } : { screen: 'quiz', packId }

  return (
    <Screen title={pack.title} back={{ screen: 'home' }}>
      {round ? (
        <section className={styles.resume}>
          <p>
            <strong>Yarım kalan bir tur var.</strong> Sıradaki soru: {round.answers.length + 1} /{' '}
            {round.turns.length}
          </p>
          <LinkButton to={{ screen: 'play', packId }} variant="primary" big>
            Tura devam et
          </LinkButton>
          <Button onClick={() => setConfirmingCancel(true)}>Turu iptal et</Button>
        </section>
      ) : (
        <LinkButton to={quiz} variant="primary" big>
          Bilgi yarışması
        </LinkButton>
      )}

      <LinkButton to={{ screen: 'predictions', packId }} variant="primary" big>
        {waiting > 0 ? `Tahminler (${waiting} bekliyor)` : 'Tahminler'}
      </LinkButton>

      <LinkButton to={{ screen: 'scores', packId }}>Skor tablosu</LinkButton>

      {round ? (
        <>
          <Button disabled>Oyuncular ({trip.players.length})</Button>
          <p className={styles.hint}>Tur bitene ya da iptal edilene kadar oyuncular değiştirilemez.</p>
        </>
      ) : (
        <LinkButton to={{ screen: 'players', packId }}>
          {trip.players.length > 0 ? `Oyuncular (${trip.players.length})` : 'Oyuncuları ekle'}
        </LinkButton>
      )}

      {pack.predictionTemplates.some((template) => template.params) && (
        <LinkButton to={{ screen: 'settings', packId }}>Gezi ayarları</LinkButton>
      )}

      <ConfirmDialog
        open={confirmingCancel}
        title="Tur iptal edilsin mi?"
        confirmLabel="İptal et"
        onConfirm={() => {
          saveTrip(cancelRound(trip))
          setConfirmingCancel(false)
        }}
        onCancel={() => setConfirmingCancel(false)}
      >
        Bu turda şimdiye kadar alınan puanlar silinir.
      </ConfirmDialog>
    </Screen>
  )
}
