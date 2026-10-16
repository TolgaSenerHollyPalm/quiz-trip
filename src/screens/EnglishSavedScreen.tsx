import { useTrip } from '../app/appData.ts'
import { href } from '../app/router.ts'
import { isAbroad, savedItems, toggleSaved } from '../english/english.ts'
import { PhraseCard, PhraseList } from '../english/PhraseCard.tsx'
import Missing from 'kitshelf-ui/ui/Missing.tsx'
import Screen from 'kitshelf-ui/ui/Screen.tsx'
import styles from './EnglishSavedScreen.module.css'

/** The phrases and words starred on this trip, in the order they were starred. */
export default function EnglishSavedScreen({ tripId }: { tripId: string }) {
  const { trip, saveTrip } = useTrip(tripId)
  if (!trip) return <Missing message="Bu seyahat bulunamadı." back={href({ screen: 'home' })} />
  if (!isAbroad(trip)) {
    return <Missing message="Seyahat İngilizcesi yalnız yurt dışı seyahatlerinde var." back={href({ screen: 'trip', tripId })} />
  }

  const items = savedItems(trip)
  return (
    <Screen
      title="Kaydettiklerim"
      subtitle={
        <span className={styles.intro}>Yıldızladığın cümleler burada; bu seyahatin içinde kalır ve yedeğe girer.</span>
      }
      back={href({ screen: 'english', tripId })}
    >
      {items.length === 0 ? (
        <p className={styles.empty}>
          Henüz kaydettiğin cümle yok. Bir cümlenin yanındaki yıldıza dokununca burada görünür.
        </p>
      ) : (
        <PhraseList>
          {items.map(({ item }) => (
            <PhraseCard
              key={item.id}
              item={item}
              to={href({ screen: 'english-show', tripId, itemId: item.id, from: 'saved' })}
              saved
              onToggleSaved={() => saveTrip(toggleSaved(trip, item.id))}
            />
          ))}
        </PhraseList>
      )}
    </Screen>
  )
}
