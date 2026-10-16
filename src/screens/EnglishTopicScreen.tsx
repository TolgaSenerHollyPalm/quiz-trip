import { useId } from 'react'
import { useTrip } from '../app/appData.ts'
import { href, navigate } from '../app/router.ts'
import { findTopic } from '../english/content.ts'
import { isAbroad, isSaved, toggleSaved } from '../english/english.ts'
import { PhraseCard, PhraseList } from '../english/PhraseCard.tsx'
import TopicIcon from '../english/TopicIcon.tsx'
import { ExpandIcon } from '../ui/icons.tsx'
import { ListCard } from 'kitshelf-ui/ui/ListCard.tsx'
import Missing from 'kitshelf-ui/ui/Missing.tsx'
import Screen from 'kitshelf-ui/ui/Screen.tsx'
import SegmentedTabs from 'kitshelf-ui/ui/SegmentedTabs.tsx'
import Tile from 'kitshelf-ui/ui/Tile.tsx'
import styles from './EnglishTopicScreen.module.css'

type Tab = 'phrases' | 'words'

/** One topic of travel English: its phrases to show large, or its words to look up. */
export default function EnglishTopicScreen({ tripId, topicId, tab }: { tripId: string; topicId: string; tab?: 'words' }) {
  const { trip, saveTrip } = useTrip(tripId)
  const panelId = useId()
  if (!trip) return <Missing message="Bu seyahat bulunamadı." back={href({ screen: 'home' })} />
  if (!isAbroad(trip)) {
    return <Missing message="Seyahat İngilizcesi yalnız yurt dışı seyahatlerinde var." back={href({ screen: 'trip', tripId })} />
  }
  const topic = findTopic(topicId)
  if (!topic) return <Missing message="Bu konu bulunamadı." back={href({ screen: 'english', tripId })} />

  const showing: Tab = tab === 'words' ? 'words' : 'phrases'
  const choose = (value: Tab) =>
    navigate(
      value === 'words' ? { screen: 'english-topic', tripId, topicId, tab: 'words' } : { screen: 'english-topic', tripId, topicId },
      { replace: true },
    )

  return (
    <Screen
      title={topic.title}
      subtitle="Seyahat İngilizcesi"
      mark={
        <Tile tone={topic.tone} size="large">
          <TopicIcon icon={topic.icon} size={26} />
        </Tile>
      }
      back={href({ screen: 'english', tripId })}
    >
      <SegmentedTabs
        label="Gösterilen"
        options={[
          { value: 'phrases', label: `Cümleler · ${topic.phrases.length}` },
          { value: 'words', label: `Kelimeler · ${topic.words.length}` },
        ]}
        selected={showing}
        onSelect={choose}
        panelId={panelId}
      />

      <div id={panelId} role="tabpanel" aria-label={showing === 'words' ? 'Kelimeler' : 'Cümleler'} className={styles.panel}>
        {showing === 'phrases' ? (
          <>
            <p className={styles.hint}>
              <ExpandIcon />
              <span>Cümleye dokununca büyük gösterir; yıldızla kaydedebilirsin.</span>
            </p>
            <PhraseList>
              {topic.phrases.map((item) => (
                <PhraseCard
                  key={item.id}
                  item={item}
                  to={href({ screen: 'english-show', tripId, itemId: item.id, from: 'topic' })}
                  saved={isSaved(trip, item.id)}
                  onToggleSaved={() => saveTrip(toggleSaved(trip, item.id))}
                />
              ))}
            </PhraseList>
          </>
        ) : (
          <ListCard>
            {topic.words.map((item) => (
              <li key={item.id} className={styles.word}>
                <span className={styles.wordEn} lang="en">
                  {item.en}
                </span>
                <span className={styles.wordTr}>{item.tr}</span>
                {item.note && <span className={styles.note}>{item.note}</span>}
              </li>
            ))}
          </ListCard>
        )}
      </div>
    </Screen>
  )
}
