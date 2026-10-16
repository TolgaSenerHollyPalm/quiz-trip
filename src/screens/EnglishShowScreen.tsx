import { useEffect, useRef, useState } from 'react'
import { useTrip } from '../app/appData.ts'
import { href, navigate, type EnglishFrom, type Route } from '../app/router.ts'
import { findItem, type FoundItem } from '../english/content.ts'
import { isAbroad, isSaved, savedItems, searchEnglish, toggleSaved } from '../english/english.ts'
import { StarButton } from '../english/PhraseCard.tsx'
import { IconLink } from 'kitshelf-ui/ui/IconButton.tsx'
import { BackIcon, ChevronRightIcon, CloseIcon } from 'kitshelf-ui/ui/icons.tsx'
import Missing from 'kitshelf-ui/ui/Missing.tsx'
import styles from './EnglishShowScreen.module.css'

interface EnglishShowScreenProps {
  tripId: string
  itemId: string
  from: EnglishFrom
  q?: string
}

/** One phrase as large as the screen allows, to hold up to the person being spoken to. */
export default function EnglishShowScreen({ tripId, itemId, from, q }: EnglishShowScreenProps) {
  const { trip, saveTrip } = useTrip(tripId)
  // Taking the star off here must not drop the item out of the list being stepped through.
  const [savedAtOpen] = useState(() => trip?.savedEnglish ?? [])
  const previousButton = useRef<HTMLButtonElement>(null)
  const nextButton = useRef<HTMLButtonElement>(null)
  const stepped = useRef<'previous' | 'next'>(undefined)

  const found = findItem(itemId)
  const list = found && trip && isAbroad(trip) ? stepList(found, from, savedAtOpen, q) : []
  const at = Math.max(0, list.findIndex((other) => other.item.id === itemId))
  const previousId = list[at - 1]?.item.id
  const nextId = list[at + 1]?.item.id

  useEffect(() => {
    const moveTo = (id: string | undefined) => {
      if (id) navigate({ screen: 'english-show', tripId, itemId: id, from, ...(q && { q }) }, { replace: true })
    }
    // Alt+← is the browser's own back.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      if (event.key === 'ArrowLeft') moveTo(previousId)
      else if (event.key === 'ArrowRight') moveTo(nextId)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [tripId, from, q, previousId, nextId])

  // A button that turns disabled at the end of the list drops the focus; the other one takes it.
  useEffect(() => {
    if (!stepped.current) return
    const [wanted, other] = stepped.current === 'next' ? [nextButton, previousButton] : [previousButton, nextButton]
    stepped.current = undefined
    if (wanted.current?.disabled) other.current?.focus()
  }, [itemId])

  if (!trip) return <Missing message="Bu seyahat bulunamadı." back={href({ screen: 'home' })} />
  if (!isAbroad(trip)) {
    return <Missing message="Seyahat İngilizcesi yalnız yurt dışı seyahatlerinde var." back={href({ screen: 'trip', tripId })} />
  }
  if (!found) return <Missing message="Bu cümle bulunamadı." back={href({ screen: 'english', tripId })} />

  const { item, topic } = found
  const close: Route =
    from === 'saved'
      ? { screen: 'english-saved', tripId }
      : from === 'search'
        ? { screen: 'english', tripId, q }
        : found.kind === 'word'
          ? { screen: 'english-topic', tripId, topicId: topic.id, tab: 'words' }
          : { screen: 'english-topic', tripId, topicId: topic.id }
  const place = from === 'saved' ? 'Kaydettiklerim' : from === 'search' ? 'Arama' : topic.title
  const step = (id: string | undefined, direction: 'previous' | 'next') => {
    if (!id) return
    stepped.current = direction
    navigate({ screen: 'english-show', tripId, itemId: id, from, ...(q && { q }) }, { replace: true })
  }

  return (
    <div className={styles.screen}>
      <header className={styles.bar}>
        <IconLink to={href(close)} label="Kapat">
          <CloseIcon size={20} />
        </IconLink>
        <span className={styles.place}>
          {place} · {at + 1} / {list.length}
        </span>
        <StarButton saved={isSaved(trip, item.id)} onToggle={() => saveTrip(toggleSaved(trip, item.id))} />
      </header>

      <main className={styles.body}>
        <span className={styles.chip}>Karşındakine göster</span>
        <p className={styles.en} lang="en">
          {item.en}
        </p>
        <p className={styles.tr}>{item.tr}</p>
        {item.note && <p className={styles.note}>{item.note}</p>}
      </main>

      <nav className={styles.steps} aria-label="Sıra">
        <button
          ref={previousButton}
          type="button"
          className={`${styles.step} ${styles.previous}`}
          disabled={!previousId}
          onClick={() => step(previousId, 'previous')}
        >
          <BackIcon size={20} strokeWidth={2.2} />
          Önceki
        </button>
        <button
          ref={nextButton}
          type="button"
          className={`${styles.step} ${styles.next}`}
          disabled={!nextId}
          onClick={() => step(nextId, 'next')}
        >
          Sonraki
          <ChevronRightIcon size={20} strokeWidth={2.2} />
        </button>
      </nav>
    </div>
  )
}

/** The list the screen was opened from; an item that is not in it stands alone. */
function stepList(found: FoundItem, from: EnglishFrom, saved: string[], q: string | undefined): FoundItem[] {
  const { topic, kind } = found
  const list =
    from === 'saved'
      ? savedItems({ savedEnglish: saved })
      : from === 'search'
        ? searchEnglish(q ?? '').flatMap((group) => group.found)
        : (kind === 'word' ? topic.words : topic.phrases).map((item): FoundItem => ({ item, topic, kind }))
  return list.some((other) => other.item.id === found.item.id) ? list : [found]
}
