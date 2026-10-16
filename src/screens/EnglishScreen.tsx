import { useMemo, useState } from 'react'
import { useAppData, useTrip } from '../app/appData.ts'
import { href, navigate, type Route } from '../app/router.ts'
import { ENGLISH_TOPICS, PHRASE_COUNT, WORD_COUNT } from '../english/content.ts'
import { isAbroad, isSaved, savedItems, searchable, searchEnglish, toggleSaved } from '../english/english.ts'
import { PhraseCard, PhraseList } from '../english/PhraseCard.tsx'
import TopicIcon from '../english/TopicIcon.tsx'
import { destinationName } from '../trips/destinations.ts'
import { ArrowRightIcon } from 'kitshelf-ui/ui/icons.tsx'
import { QuizIcon, StarIcon } from '../ui/icons.tsx'
import { LinkRow, ListCard } from 'kitshelf-ui/ui/ListCard.tsx'
import Missing from 'kitshelf-ui/ui/Missing.tsx'
import Screen from 'kitshelf-ui/ui/Screen.tsx'
import SearchField from '../ui/SearchField.tsx'
import Tile from 'kitshelf-ui/ui/Tile.tsx'
import { toneClass } from 'kitshelf-ui/ui/tone.ts'
import styles from './EnglishScreen.module.css'

/** Seyahat İngilizcesi: the topics, or the results while something is searched. */
export default function EnglishScreen({ tripId, q }: { tripId: string; q?: string }) {
  const { destinations } = useAppData()
  const { trip, collection, saveTrip } = useTrip(tripId)
  // Typing rewrites ?q= but keeps this screen, so the field holds its own text; the back button clears it.
  const [text, setText] = useState(q ?? '')
  const [shownQ, setShownQ] = useState(q)
  if (q !== shownQ) {
    setShownQ(q)
    if ((q ?? '') !== text) setText(q ?? '')
  }
  const groups = useMemo(() => searchEnglish(text), [text])

  if (!trip) return <Missing message="Bu seyahat bulunamadı." back={href({ screen: 'home' })} />
  if (!isAbroad(trip)) {
    return <Missing message="Seyahat İngilizcesi yalnız yurt dışı seyahatlerinde var." back={href({ screen: 'trip', tripId })} />
  }

  const searching = searchable(text) !== ''
  const found = groups.reduce((sum, group) => sum + group.found.length, 0)
  const saved = savedItems(trip).length
  const quiz: Route = trip.currentRound
    ? { screen: 'play', tripId }
    : trip.players.length === 0
      ? { screen: 'players', tripId, next: 'quiz' }
      : { screen: 'quiz', tripId }

  const search = (value: string) => {
    setText(value)
    navigate({ screen: 'english', tripId, q: value || undefined }, { replace: true })
  }

  return (
    <Screen
      eyebrow={searching ? undefined : destinationName(destinations, trip.country, trip.cityId) || undefined}
      title="Seyahat İngilizcesi"
      subtitle={
        searching ? undefined : (
          <span className={styles.intro}>
            Havalimanından restorana {PHRASE_COUNT} hazır cümle ve {WORD_COUNT} kelime. İnternetsiz çalışır; cümleye
            dokununca büyük gösterir.
          </span>
        )
      }
      back={searching ? href({ screen: 'english', tripId }) : href({ screen: 'trip', tripId })}
    >
      <SearchField label="Ara" placeholder="Türkçe ya da İngilizce ara" value={text} onChange={search} />

      {searching ? (
        <div className={styles.results}>
          <p className={styles.count} role="status">
            {found > 0 ? `${found} sonuç` : 'Sonuç yok. Başka bir kelimeyle dene.'}
          </p>
          {groups.map(({ topicId, found: items }) => (
            <section key={topicId} aria-labelledby={`english-group-${topicId}`}>
              <h2 id={`english-group-${topicId}`} className={styles.groupTitle}>
                <TopicIcon icon={items[0].topic.icon} size={16} />
                {items[0].topic.title}
              </h2>
              <PhraseList>
                {items.map(({ item }) => (
                  <PhraseCard
                    key={item.id}
                    item={item}
                    to={href({ screen: 'english-show', tripId, itemId: item.id, from: 'search', q: text })}
                    saved={isSaved(trip, item.id)}
                    onToggleSaved={() => saveTrip(toggleSaved(trip, item.id))}
                  />
                ))}
              </PhraseList>
            </section>
          ))}
        </div>
      ) : (
        <>
          <ListCard as="nav" label="Kaydettiklerim">
            <LinkRow
              small
              to={href({ screen: 'english-saved', tripId })}
              tile={
                <Tile tone="amber" size="small">
                  <span className={styles.savedStar}>
                    <StarIcon size={20} strokeWidth={1.8} filled />
                  </span>
                </Tile>
              }
              title="Kaydettiklerim"
              meta={saved > 0 ? `${saved} cümle` : 'Henüz yok'}
            />
          </ListCard>

          <section className={styles.topicsSection} aria-labelledby="english-topics">
            <h2 id="english-topics" className={styles.sectionTitle}>
              Konular
            </h2>
            <nav className={styles.topics} aria-label="Konular">
              {ENGLISH_TOPICS.map((topic) => (
                <a key={topic.id} className={styles.topic} href={href({ screen: 'english-topic', tripId, topicId: topic.id })}>
                  <span className={`${styles.topicTile} ${toneClass(topic.tone)}`}>
                    <TopicIcon icon={topic.icon} size={20} />
                  </span>
                  <span className={styles.topicText}>
                    <span className={styles.topicTitle}>{topic.title}</span>
                    <span className={styles.topicMeta}>
                      {topic.phrases.length} cümle · {topic.words.length} kelime
                    </span>
                  </span>
                </a>
              ))}
            </nav>
          </section>

          {collection.packs.length > 0 && (
            <a className={styles.round} href={href(quiz)}>
              <span className={styles.roundIcon}>
                <QuizIcon size={22} />
              </span>
              <span className={styles.roundTitle}>İngilizce turu</span>
              <span className={styles.roundText}>
                Bilgi yarışmasında “İngilizce” kategorisini seç: cümlenin doğru İngilizcesini kim bulacak?
              </span>
              <span className={styles.roundAction}>
                {trip.currentRound ? 'Tura devam et' : 'Tura başla'}
                <ArrowRightIcon size={16} />
              </span>
            </a>
          )}
        </>
      )}
    </Screen>
  )
}
