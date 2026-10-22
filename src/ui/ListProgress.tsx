import ProgressBar from 'kitshelf-ui/ui/ProgressBar.tsx'
import { toneClass, type Tone } from 'kitshelf-ui/ui/tone.ts'
import styles from './ListProgress.module.css'

/** How far a list is: "2 / 7 alındı", the share done, and a thick bar, in the list's own colour. */
export default function ListProgress({ done, total, word, tone, label }: { done: number; total: number; word: string; tone: Tone; label: string }) {
  return (
    <section className={`${styles.progress} ${toneClass(tone)}`} aria-label="İlerleme">
      <div className={styles.head}>
        <p className={styles.count}>
          <strong>{done}</strong> / {total} {word}
        </p>
        <span className={styles.percent}>%{Math.round((done / total) * 100)}</span>
      </div>
      <ProgressBar value={done} max={total} tone={tone} label={label} thick />
    </section>
  )
}
