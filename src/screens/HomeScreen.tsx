import { useAppData } from '../app/appData.ts'
import { href } from '../app/router.ts'
import OnlineBadge from '../ui/OnlineBadge.tsx'
import Screen from '../ui/Screen.tsx'
import styles from './HomeScreen.module.css'

const buildTime = new Date(__BUILD_TIME__).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })

export default function HomeScreen() {
  const { packs, trips } = useAppData()

  return (
    <Screen title="Trip Quiz" aside={<OnlineBadge />}>
      <h2 className={styles.heading}>Geziler</h2>
      {packs.length === 0 ? (
        <p>Cihazda henüz gezi paketi yok.</p>
      ) : (
        <ul className={styles.list}>
          {packs.map((pack) => {
            const trip = trips[pack.id]
            const details = [`${pack.questions.length} soru`]
            if (trip?.players.length) details.push(`${trip.players.length} oyuncu`)
            if (trip?.rounds.length) details.push(`${trip.rounds.length} tur`)
            return (
              <li key={pack.id}>
                <a className={styles.card} href={href({ screen: 'trip', packId: pack.id })}>
                  <span className={styles.title}>{pack.title}</span>
                  <span className={styles.details}>{details.join(' · ')}</span>
                </a>
              </li>
            )
          })}
        </ul>
      )}
      <p className={styles.version}>Sürüm: {buildTime}</p>
    </Screen>
  )
}
