import { useState } from 'react'
import { useTrip } from '../app/appData.ts'
import { navigate, type Route } from '../app/router.ts'
import { cancelRound } from '../game/trip.ts'
import { Button, LinkButton } from '../ui/Button.tsx'
import ConfirmDialog from '../ui/ConfirmDialog.tsx'
import CountdownCard from '../ui/CountdownCard.tsx'
import Missing from '../ui/Missing.tsx'
import Screen from '../ui/Screen.tsx'
import text from '../ui/text.module.css'
import styles from './TripScreen.module.css'

export default function TripScreen({ tripId }: { tripId: string }) {
  const { trip, collection, saveTrip, deleteTrip } = useTrip(tripId)
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleted, setDeleted] = useState(false)
  if (deleted) return null // leaving for the home screen
  if (!trip) return <Missing message="Bu gezi bulunamadı." back={{ screen: 'home' }} />

  const round = trip.currentRound
  // Predictions that still need guesses or a result.
  const waiting = trip.predictions.filter((prediction) => prediction.status !== 'resolved').length
  // Nothing to reset before anyone has played.
  const played =
    trip.players.length > 0 || trip.rounds.length > 0 || trip.predictions.length > 0 || Object.keys(trip.params).length > 0
  const quiz: Route =
    trip.players.length === 0 ? { screen: 'players', tripId, next: 'quiz' } : { screen: 'quiz', tripId }
  const packed = trip.checklist.filter((item) => item.done).length

  return (
    <Screen title={trip.name} back={{ screen: 'home' }}>
      <CountdownCard trip={trip} />

      <LinkButton to={{ screen: 'checklist', tripId }} variant="primary" big>
        {trip.checklist.length > 0 ? `Hazırlık listesi (${packed}/${trip.checklist.length})` : 'Hazırlık listesi'}
      </LinkButton>

      {collection.packs.length > 0 ? (
        <>
          <h2 className={text.heading}>Gezide eğlence</h2>
          {round ? (
            <section className={styles.resume}>
              <p>
                <strong>Yarım kalan bir tur var.</strong> Sıradaki soru: {round.answers.length + 1} /{' '}
                {round.turns.length}
              </p>
              <LinkButton to={{ screen: 'play', tripId }} variant="primary" big>
                Tura devam et
              </LinkButton>
              <Button onClick={() => setConfirmingCancel(true)}>Turu iptal et</Button>
            </section>
          ) : (
            <LinkButton to={quiz} variant="primary" big>
              Bilgi yarışması
            </LinkButton>
          )}

          <LinkButton to={{ screen: 'predictions', tripId }} variant="primary" big>
            {waiting > 0 ? `Tahminler (${waiting} bekliyor)` : 'Tahminler'}
          </LinkButton>
          <LinkButton to={{ screen: 'scores', tripId }}>Skor tablosu</LinkButton>

          {round ? (
            <>
              <Button disabled>Oyuncular ({trip.players.length})</Button>
              <p className={styles.hint}>Tur bitene ya da iptal edilene kadar oyuncular değiştirilemez.</p>
            </>
          ) : (
            <LinkButton to={{ screen: 'players', tripId }}>
              {trip.players.length > 0 ? `Oyuncular (${trip.players.length})` : 'Oyuncuları ekle'}
            </LinkButton>
          )}

          {collection.templates.some((template) => template.params) && (
            <LinkButton to={{ screen: 'settings', tripId }}>Gezi ayarları</LinkButton>
          )}
          <LinkButton to={{ screen: 'trip-packs', tripId }}>Soru paketleri ({collection.packs.length})</LinkButton>
        </>
      ) : (
        <>
          <p className={text.notice}>
            {trip.packIds.length > 0
              ? 'Bu gezinin soru paketi cihazda yok. Soru paketleri ekranından yeniden indirebilirsin.'
              : 'Bu geziye soru paketi bağlı değil. Paket eklersen bilgi yarışması ve tahminler açılır.'}
          </p>
          <LinkButton to={{ screen: 'trip-packs', tripId }} variant="primary">
            Soru paketleri
          </LinkButton>
        </>
      )}

      <LinkButton to={{ screen: 'trip-edit', tripId }}>Geziyi düzenle</LinkButton>
      {played && <Button onClick={() => setConfirmingReset(true)}>Oyun verilerini sıfırla</Button>}
      <Button onClick={() => setConfirmingDelete(true)}>Geziyi sil</Button>

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

      <ConfirmDialog
        open={confirmingReset}
        title="Oyun verileri sıfırlansın mı?"
        confirmLabel="Sıfırla"
        onConfirm={() => {
          saveTrip({
            ...trip,
            players: [],
            params: {},
            askedQuestionIds: [],
            rounds: [],
            predictions: [],
            quizSettings: undefined,
            currentRound: undefined,
          })
          setConfirmingReset(false)
        }}
        onCancel={() => setConfirmingReset(false)}
      >
        Oyuncular, puanlar, tahminler ve gezi ayarları silinecek. Gezinin adı, tarihleri ve hazırlık listesi kalır.
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmingDelete}
        title="Gezi silinsin mi?"
        confirmLabel="Sil"
        onConfirm={() => {
          setDeleted(true)
          deleteTrip(tripId)
          navigate({ screen: 'home' }, { replace: true })
        }}
        onCancel={() => setConfirmingDelete(false)}
      >
        <strong>{trip.name}</strong> gezisi, oyuncuları, puanları ve tahminleriyle birlikte silinecek. Soru paketi
        telefonda kalır.
      </ConfirmDialog>
    </Screen>
  )
}
