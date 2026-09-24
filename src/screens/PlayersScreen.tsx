import { useState } from 'react'
import { useTrip } from '../app/appData.ts'
import { navigate } from '../app/router.ts'
import { MAX_PLAYERS, MIN_PLAYERS } from '../game/quiz.ts'
import { playersWithData, updatePlayers } from '../game/trip.ts'
import type { Player } from '../game/types.ts'
import { Button } from '../ui/Button.tsx'
import ConfirmDialog from '../ui/ConfirmDialog.tsx'
import Missing from '../ui/Missing.tsx'
import Screen from '../ui/Screen.tsx'
import { tripTheme } from '../ui/tripTheme.ts'
import styles from './PlayersScreen.module.css'

const MAX_NICKNAME_LENGTH = 16

const newPlayer = (): Player => ({ id: crypto.randomUUID(), nickname: '' })

function nicknameProblem(players: Player[], index: number): string | undefined {
  const name = players[index].nickname.trim().toLocaleLowerCase('tr')
  if (name === '') return 'İsim boş olamaz.'
  const taken = players.slice(0, index).some((other) => other.nickname.trim().toLocaleLowerCase('tr') === name)
  return taken ? 'Bu isim zaten var.' : undefined
}

export default function PlayersScreen({ tripId, next }: { tripId: string; next?: 'quiz' }) {
  const { trip, saveTrip } = useTrip(tripId)
  const [players, setPlayers] = useState(() => (trip && trip.players.length > 0 ? trip.players : [newPlayer(), newPlayer()]))
  const [showProblems, setShowProblems] = useState(false)
  const [losing, setLosing] = useState<Player[]>([]) // removed players whose points would be deleted

  const back = { screen: 'trip', tripId } as const
  if (!trip) return <Missing message="Bu gezi bulunamadı." back={{ screen: 'home' }} />
  if (trip.currentRound) {
    return <Missing message="Tur bitene ya da iptal edilene kadar oyuncular değiştirilemez." back={back} />
  }

  const problems = players.map((_, index) => nicknameProblem(players, index))

  const commit = () => {
    saveTrip(updatePlayers(trip, players.map((player) => ({ ...player, nickname: player.nickname.trim() }))))
    navigate(next === 'quiz' ? { screen: 'quiz', tripId } : back, { replace: true })
  }

  const save = () => {
    if (problems.some(Boolean)) {
      setShowProblems(true)
      return
    }
    const kept = new Set(players.map((player) => player.id))
    const withData = playersWithData(trip)
    const lost = trip.players.filter((player) => !kept.has(player.id) && withData.has(player.id))
    if (lost.length > 0) setLosing(lost)
    else commit()
  }

  return (
    <Screen title="Oyuncular" back={back} theme={tripTheme(trip.kind)}>
      <p className={styles.intro}>
        {MIN_PLAYERS}–{MAX_PLAYERS} oyuncu. Oyun bu sırayla döner; her turda ilk sıradaki kişi bir sonrakine geçer.
      </p>
      <ol className={styles.list}>
        {players.map((player, index) => (
          <li key={player.id} className={styles.row}>
            <span className={styles.number}>{index + 1}.</span>
            <input
              className={styles.input}
              value={player.nickname}
              maxLength={MAX_NICKNAME_LENGTH}
              placeholder="İsim"
              autoComplete="off"
              aria-label={`${index + 1}. oyuncunun adı`}
              aria-invalid={showProblems && Boolean(problems[index])}
              onChange={(event) =>
                setPlayers(players.map((p, i) => (i === index ? { ...p, nickname: event.target.value } : p)))
              }
            />
            <button
              type="button"
              className={styles.remove}
              aria-label={`Sil: ${player.nickname.trim() || `${index + 1}. oyuncu`}`}
              disabled={players.length <= MIN_PLAYERS}
              onClick={() => setPlayers(players.filter((_, i) => i !== index))}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>
            {showProblems && problems[index] && <p className={styles.problem}>{problems[index]}</p>}
          </li>
        ))}
      </ol>
      <Button disabled={players.length >= MAX_PLAYERS} onClick={() => setPlayers([...players, newPlayer()])}>
        + Oyuncu ekle
      </Button>
      <Button variant="primary" big onClick={save}>
        Kaydet
      </Button>

      <ConfirmDialog
        open={losing.length > 0}
        title="Oyuncu silinsin mi?"
        confirmLabel="Sil"
        onConfirm={() => {
          setLosing([])
          commit()
        }}
        onCancel={() => setLosing([])}
      >
        <strong>{losing.map((player) => player.nickname).join(', ')}</strong> silinecek. Quiz puanları ve
        tahminleri de kalıcı olarak silinir.
      </ConfirmDialog>
    </Screen>
  )
}
