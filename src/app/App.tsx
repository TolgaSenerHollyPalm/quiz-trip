import styles from './App.module.css'
import UpdatePrompt from './UpdatePrompt.tsx'

const buildTime = new Date(__BUILD_TIME__).toLocaleString('tr-TR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export default function App() {
  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={112} height={112} />
        <h1 className={styles.title}>Trip Quiz</h1>
        <p className={styles.muted}>Oyunlar bir sonraki aşamada eklenecek.</p>
      </main>
      <footer className={styles.muted}>Sürüm: {buildTime}</footer>
      <UpdatePrompt />
    </div>
  )
}
