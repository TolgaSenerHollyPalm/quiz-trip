import { useState } from 'react'
import { useTrip } from '../app/appData.ts'
import { navigate } from '../app/router.ts'
import { MAX_QUESTIONS_PER_PLAYER, questionPool } from '../game/quiz.ts'
import { startRound } from '../game/trip.ts'
import type { DifficultyChoice, QuizSettings } from '../game/types.ts'
import { CATEGORIES, type Category } from '../packs/types.ts'
import { Button, LinkButton } from '../ui/Button.tsx'
import ChoiceGroup from '../ui/ChoiceGroup.tsx'
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '../ui/labels.ts'
import Missing from '../ui/Missing.tsx'
import Screen from '../ui/Screen.tsx'
import Stepper from '../ui/Stepper.tsx'
import styles from './QuizSettingsScreen.module.css'

const DIFFICULTY_CHOICES: DifficultyChoice[] = ['mixed', 'easy', 'medium', 'hard']
const TIME_LIMITS: QuizSettings['timeLimit'][] = [0, 15, 30]

function summary(poolSize: number, needed: number, neverAsked: number): string {
  if (poolSize === 0) return 'Bu seçime uyan soru yok. Başka kategori ya da zorluk seç.'
  const plan = `Seçime uyan ${poolSize} soru var; bu turda toplam ${needed} soru sorulacak.`
  if (needed > poolSize) return `${plan} Soru yetmediği için bazı sorular turda tekrar edecek.`
  if (needed > neverAsked) return `${plan} Yeni soru yetmediği için daha önce sorulan sorular da gelecek.`
  return plan
}

export default function QuizSettingsScreen({ tripId }: { tripId: string }) {
  const { pack, trip, saveTrip } = useTrip(tripId)
  const inPack = CATEGORIES.filter((category) => pack?.questions.some((q) => q.category === category))
  const [settings, setSettings] = useState<QuizSettings>(() => {
    const last = trip?.quizSettings
    // Categories chosen last time that this pack no longer has are dropped.
    const categories = last?.categories.filter((category) => inPack.includes(category)) ?? []
    return {
      difficulty: last?.difficulty ?? 'mixed',
      questionsPerPlayer: last?.questionsPerPlayer ?? 3,
      timeLimit: last?.timeLimit ?? 0,
      categories: categories.length > 0 ? categories : inPack,
    }
  })

  const back = { screen: 'trip', tripId } as const
  if (!trip) return <Missing message="Bu gezi bulunamadı." back={{ screen: 'home' }} />
  if (!pack) return <Missing message="Bu gezinin soru paketi cihazda yok." back={{ screen: 'trip', tripId }} />
  if (trip.players.length === 0) {
    return (
      <Screen title="Quiz ayarları" back={back}>
        <p>Önce oyuncuları ekle.</p>
        <LinkButton to={{ screen: 'players', tripId, next: 'quiz' }} variant="primary" big>
          Oyuncuları ekle
        </LinkButton>
      </Screen>
    )
  }
  if (trip.currentRound) {
    return (
      <Screen title="Quiz ayarları" back={back}>
        <p>Yarım kalan bir tur var. Yeni tur için önce onu bitir ya da iptal et.</p>
        <LinkButton to={{ screen: 'play', tripId }} variant="primary" big>
          Tura devam et
        </LinkButton>
      </Screen>
    )
  }

  const matchesDifficulty = (difficulty: string) =>
    settings.difficulty === 'mixed' || difficulty === settings.difficulty
  const pool = questionPool(pack.questions, settings)
  const needed = trip.players.length * settings.questionsPerPlayer
  const neverAsked = pool.filter((question) => !trip.askedQuestionIds.includes(question.id)).length

  const toggleCategory = (category: Category) => {
    const chosen = settings.categories.includes(category)
      ? settings.categories.filter((c) => c !== category)
      : [...settings.categories, category]
    // At least one category stays selected.
    if (chosen.length > 0) setSettings({ ...settings, categories: inPack.filter((c) => chosen.includes(c)) })
  }

  const start = () => {
    const round = { id: crypto.randomUUID(), startedAt: new Date().toISOString() }
    saveTrip(startRound(trip, pack, settings, round, Math.random))
    navigate({ screen: 'play', tripId }, { replace: true })
  }

  return (
    <Screen title="Quiz ayarları" back={back}>
      <ChoiceGroup
        label="Kategoriler"
        options={inPack.map((category) => ({
          value: category,
          label: `${CATEGORY_LABELS[category]} (${
            pack.questions.filter((q) => q.category === category && matchesDifficulty(q.difficulty)).length
          })`,
        }))}
        selected={settings.categories}
        onToggle={toggleCategory}
      />
      <ChoiceGroup
        label="Zorluk"
        options={DIFFICULTY_CHOICES.map((difficulty) => ({ value: difficulty, label: DIFFICULTY_LABELS[difficulty] }))}
        selected={[settings.difficulty]}
        onToggle={(difficulty) => setSettings({ ...settings, difficulty })}
      />
      {settings.difficulty === 'mixed' && (
        <p className={styles.note}>Karışık turda herkes aynı sırada aynı zorlukta soru alır.</p>
      )}
      <Stepper
        label="Oyuncu başına soru"
        value={settings.questionsPerPlayer}
        min={1}
        max={MAX_QUESTIONS_PER_PLAYER}
        onChange={(questionsPerPlayer) => setSettings({ ...settings, questionsPerPlayer })}
      />
      <ChoiceGroup
        label="Soru başına süre"
        options={TIME_LIMITS.map((limit) => ({ value: limit, label: limit === 0 ? 'Kapalı' : `${limit} sn` }))}
        selected={[settings.timeLimit]}
        onToggle={(timeLimit) => setSettings({ ...settings, timeLimit })}
      />
      <p className={styles.summary} role="status">
        {summary(pool.length, needed, neverAsked)}
      </p>
      <Button variant="primary" big disabled={pool.length === 0} onClick={start}>
        Başla
      </Button>
    </Screen>
  )
}
