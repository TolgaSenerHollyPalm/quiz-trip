import { useState } from 'react'
import { useAppData, useTrip } from '../app/appData.ts'
import { href, navigate, type Route } from '../app/router.ts'
import { scoreSummary } from '../game/summary.ts'
import { cancelRound, resetGames } from '../game/trip.ts'
import { formatDateRange, tripLength } from '../trips/dates.ts'
import { orphanPacks } from '../trips/packMatch.ts'
import Chip from 'kitshelf-ui/ui/Chip.tsx'
import ConfirmDialog from 'kitshelf-ui/ui/ConfirmDialog.tsx'
import CountdownCard from '../ui/CountdownCard.tsx'
import { ArrowRightIcon } from 'kitshelf-ui/ui/icons.tsx'
import { BoxIcon, PeopleIcon, QuizIcon, TargetIcon, TrophyIcon } from '../ui/icons.tsx'
import { TRANSPORT_LABELS, TRIP_KIND_LABELS } from '../ui/labels.ts'
import { LinkRow, ListCard } from 'kitshelf-ui/ui/ListCard.tsx'
import Menu, { type MenuItem } from 'kitshelf-ui/ui/Menu.tsx'
import Missing from 'kitshelf-ui/ui/Missing.tsx'
import Screen from 'kitshelf-ui/ui/Screen.tsx'
import text from 'kitshelf-ui/ui/text.module.css'
import Tile from 'kitshelf-ui/ui/Tile.tsx'
import TransportIcon from '../ui/TransportIcon.tsx'
import TripKindIcon from '../ui/TripKindIcon.tsx'
import { tripTheme } from '../ui/tripTheme.ts'
import TripLists from './TripLists.tsx'
import styles from './TripScreen.module.css'

export default function TripScreen({ tripId }: { tripId: string }) {
  const { trips, deletePack } = useAppData()
  const { trip, collection, saveTrip, deleteTrip } = useTrip(tripId)
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleted, setDeleted] = useState(false)
  if (deleted) return null // leaving for the home screen
  if (!trip) return <Missing message="Bu seyahat bulunamadı." back={href({ screen: 'home' })} />

  const round = trip.currentRound
  // Predictions that still need guesses or a result.
  const waiting = trip.predictions.filter((prediction) => prediction.status !== 'resolved').length
  // Nothing to reset before anyone has played.
  const played =
    trip.players.length > 0 || trip.rounds.length > 0 || trip.predictions.length > 0 || Object.keys(trip.params).length > 0
  const quiz: Route =
    trip.players.length === 0 ? { screen: 'players', tripId, next: 'quiz' } : { screen: 'quiz', tripId }
  // Packs this trip alone plays with; they are deleted with it rather than left behind.
  const orphans = orphanPacks(trip, trips)

  // The rarer actions wait behind "…"; each one that removes something still asks first.
  const menu: MenuItem[] = [
    { label: 'Seyahati düzenle', onSelect: () => navigate({ screen: 'trip-edit', tripId }) },
    ...(collection.templates.some((template) => template.params)
      ? [{ label: 'Seyahat ayarları', onSelect: () => navigate({ screen: 'settings', tripId }) }]
      : []),
    ...(round ? [{ label: 'Turu iptal et', onSelect: () => setConfirmingCancel(true), danger: true }] : []),
    ...(played ? [{ label: 'Oyun verilerini sıfırla', onSelect: () => setConfirmingReset(true), danger: true }] : []),
    { label: 'Seyahati sil', onSelect: () => setConfirmingDelete(true), danger: true },
  ]

  const chips = (trip.kind || trip.transport) && (
    <div className={styles.chips}>
      {trip.kind && (
        <Chip tone="accent" icon={<TripKindIcon kind={trip.kind} />}>
          {TRIP_KIND_LABELS[trip.kind]}
        </Chip>
      )}
      {trip.transport && (
        <Chip icon={<TransportIcon transport={trip.transport} size={14} decorative />}>{TRANSPORT_LABELS[trip.transport]}</Chip>
      )}
    </div>
  )
  // "14 – 21 Ekim 2026 · 8 gün"; a one-day trip needs no count.
  const dates =
    trip.startDate &&
    [formatDateRange(trip.startDate, trip.endDate), trip.endDate && `${tripLength(trip.startDate, trip.endDate)} gün`]
      .filter(Boolean)
      .join(' · ')

  return (
    <Screen
      title={trip.name}
      above={chips}
      subtitle={dates || undefined}
      back={href({ screen: 'home' })}
      aside={<Menu items={menu} />}
      theme={tripTheme(trip.kind)}
    >
      <CountdownCard trip={trip} />

      <TripLists trip={trip} />

      {collection.packs.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={text.sectionTitle}>Oyunlar</h2>
            <span className={styles.sectionMeta}>
              {collection.questions.length} soru · {trip.players.length} oyuncu
            </span>
          </div>

          <div className={styles.tiles}>
            <a className={`${styles.tile} ${styles.quiz}`} href={href(round ? { screen: 'play', tripId } : quiz)}>
              <span className={styles.tileIcon}>
                <QuizIcon />
              </span>
              <span className={styles.tileTitle}>Bilgi yarışması</span>
              <span className={styles.tileAction}>
                {round ? `Tura devam et · ${round.answers.length + 1} / ${round.turns.length}` : 'Tura başla'}
                <ArrowRightIcon size={16} />
              </span>
            </a>
            <a className={`${styles.tile} ${styles.predictions}`} href={href({ screen: 'predictions', tripId })}>
              <span className={styles.tileIcon}>
                <TargetIcon />
              </span>
              <span className={styles.tileTitle}>Tahminler</span>
              {waiting > 0 ? (
                <span className={styles.waiting}>{waiting} tahmin bekliyor</span>
              ) : (
                <span className={styles.tileNote}>{trip.predictions.length === 0 ? 'Tahmin ekle' : 'Hepsi sonuçlandı'}</span>
              )}
            </a>
          </div>

          <ListCard as="nav" label="Oyun ayrıntıları">
            <LinkRow
              small
              to={href({ screen: 'scores', tripId })}
              tile={<Tile tone="neutral" size="small"><TrophyIcon /></Tile>}
              title="Skor tablosu"
              subtitle={scoreSummary(trip)}
            />
            <LinkRow
              small
              to={round ? undefined : href({ screen: 'players', tripId })}
              tile={<Tile tone="neutral" size="small"><PeopleIcon /></Tile>}
              title="Oyuncular"
              subtitle={
                round
                  ? 'Tur bitene ya da iptal edilene kadar değiştirilemez'
                  : trip.players.map((player) => player.nickname).join(', ') || 'Henüz oyuncu yok'
              }
            />
            <LinkRow
              small
              to={href({ screen: 'trip-packs', tripId })}
              tile={<Tile tone="neutral" size="small"><BoxIcon /></Tile>}
              title="Soru paketleri"
              subtitle={collection.packs.map((pack) => pack.title).join(', ')}
            />
          </ListCard>
        </section>
      ) : (
        <section className={styles.section}>
          <p className={styles.notice}>
            {trip.packIds.length > 0
              ? 'Bu seyahatin soru paketi cihazda yok. Soru paketleri ekranından yeniden indirebilirsin.'
              : 'Bu seyahate soru paketi bağlı değil. Paket eklersen bilgi yarışması ve tahminler açılır.'}
          </p>
          <ListCard as="nav" label="Soru paketleri">
            <LinkRow
              small
              to={href({ screen: 'trip-packs', tripId })}
              tile={<Tile tone="neutral" size="small"><BoxIcon /></Tile>}
              title="Soru paketleri"
            />
          </ListCard>
        </section>
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

      <ConfirmDialog
        open={confirmingReset}
        title="Oyun verileri sıfırlansın mı?"
        confirmLabel="Sıfırla"
        onConfirm={() => {
          saveTrip(resetGames(trip))
          setConfirmingReset(false)
        }}
        onCancel={() => setConfirmingReset(false)}
      >
        Oyuncular, puanlar, tahminler ve seyahat ayarları silinecek. Seyahatin adı, tarihleri ve listeleri kalır.
        Sorulan sorular hatırlanır; yeni turlarda önce sorulmamışlar gelir.
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmingDelete}
        title="Seyahat silinsin mi?"
        confirmLabel="Sil"
        onConfirm={() => {
          setDeleted(true)
          for (const packId of orphans) deletePack(packId)
          deleteTrip(tripId)
          navigate({ screen: 'home' }, { replace: true })
        }}
        onCancel={() => setConfirmingDelete(false)}
      >
        <strong>{trip.name}</strong> seyahati, oyuncuları, puanları ve tahminleriyle birlikte silinecek.
        {orphans.length > 0
          ? ` Yalnızca bu seyahatte kullanılan ${orphans.length === 1 ? 'soru paketi' : `${orphans.length} soru paketi`} de telefondan silinecek; internet varken yeniden indirebilirsin.`
          : ' Soru paketleri başka seyahatlerde kullanıldığı için telefonda kalır.'}
      </ConfirmDialog>
    </Screen>
  )
}
