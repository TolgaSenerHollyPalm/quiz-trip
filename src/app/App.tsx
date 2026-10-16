import { lazy, Suspense, useEffect } from 'react'
import AddPredictionScreen from '../screens/AddPredictionScreen.tsx'
import AppSettingsScreen from '../screens/AppSettingsScreen.tsx'
import ChecklistScreen from '../screens/ChecklistScreen.tsx'
import EnglishSavedScreen from '../screens/EnglishSavedScreen.tsx'
import EnglishScreen from '../screens/EnglishScreen.tsx'
import EnglishShowScreen from '../screens/EnglishShowScreen.tsx'
import EnglishTopicScreen from '../screens/EnglishTopicScreen.tsx'
import GuessScreen from '../screens/GuessScreen.tsx'
import HomeScreen from '../screens/HomeScreen.tsx'
import NoteListScreen from '../screens/NoteListScreen.tsx'
import PlayersScreen from '../screens/PlayersScreen.tsx'
import PlayScreen from '../screens/PlayScreen.tsx'
import PredictionResultScreen from '../screens/PredictionResultScreen.tsx'
import PredictionScreen from '../screens/PredictionScreen.tsx'
import PredictionsScreen from '../screens/PredictionsScreen.tsx'
import QuizSettingsScreen from '../screens/QuizSettingsScreen.tsx'
import RoundResultScreen from '../screens/RoundResultScreen.tsx'
import ScoreboardScreen from '../screens/ScoreboardScreen.tsx'
import TripFormScreen from '../screens/TripFormScreen.tsx'
import TripPacksScreen from '../screens/TripPacksScreen.tsx'
import TripScreen from '../screens/TripScreen.tsx'
import TripSettingsScreen from '../screens/TripSettingsScreen.tsx'
import TripWizardScreen from '../screens/TripWizardScreen.tsx'
import AppDataProvider from './AppDataProvider.tsx'
import ConnectionNotice from 'kitshelf-ui/app/ConnectionNotice.tsx'
import { ToastProvider, Toasts } from 'kitshelf-ui/ui/Toast.tsx'
import { href, useRoute, type Route } from './router.ts'
import toast from 'kitshelf-ui/app/toast.module.css'
import UpdatePrompt from './UpdatePrompt.tsx'

// A page of every building block, for the development server only; production builds drop it.
const DesignGallery = import.meta.env.DEV ? lazy(() => import('../dev/DesignGallery.tsx')) : null

export default function App() {
  const route = useRoute()
  const address = place(route)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [address])

  if (DesignGallery && location.hash === '#/tasarim') {
    return (
      <Suspense>
        <DesignGallery />
      </Suspense>
    )
  }

  return (
    <ToastProvider>
      <AppDataProvider>
        {/* Keyed by address so a screen starts fresh whenever the route changes. */}
        <CurrentScreen key={address} route={route} />
      </AppDataProvider>
      <div className={toast.stack}>
        <UpdatePrompt />
        <ConnectionNotice appName="TripKit" />
        <Toasts />
      </div>
    </ToastProvider>
  )
}

/** The address a screen is kept by: a search, a topic's tab or a step in the big view rewrites the URL, not the screen. */
function place(route: Route): string {
  if (route.screen === 'english') return href({ screen: 'english', tripId: route.tripId })
  if (route.screen === 'english-topic') return href({ screen: 'english-topic', tripId: route.tripId, topicId: route.topicId })
  if (route.screen === 'english-show') return href({ ...route, itemId: '' })
  return href(route)
}

function CurrentScreen({ route }: { route: Route }) {
  switch (route.screen) {
    case 'home':
      return <HomeScreen />
    case 'trip-new':
      return <TripWizardScreen />
    case 'app-settings':
      return <AppSettingsScreen />
    case 'trip-edit':
      return <TripFormScreen tripId={route.tripId} />
    case 'trip':
      return <TripScreen tripId={route.tripId} />
    case 'checklist':
      return <ChecklistScreen tripId={route.tripId} />
    case 'souvenirs':
    case 'tastes':
      return <NoteListScreen tripId={route.tripId} list={route.screen} />
    case 'trip-packs':
      return <TripPacksScreen tripId={route.tripId} />
    case 'players':
      return <PlayersScreen tripId={route.tripId} next={route.next} />
    case 'quiz':
      return <QuizSettingsScreen tripId={route.tripId} />
    case 'play':
      return <PlayScreen tripId={route.tripId} />
    case 'result':
      return <RoundResultScreen tripId={route.tripId} roundId={route.roundId} />
    case 'scores':
      return <ScoreboardScreen tripId={route.tripId} />
    case 'settings':
      return <TripSettingsScreen tripId={route.tripId} add={route.add} />
    case 'predictions':
      return <PredictionsScreen tripId={route.tripId} />
    case 'prediction-new':
      return <AddPredictionScreen tripId={route.tripId} />
    case 'prediction':
      return <PredictionScreen tripId={route.tripId} predictionId={route.predictionId} />
    case 'guess':
      return <GuessScreen tripId={route.tripId} predictionId={route.predictionId} playerId={route.playerId} />
    case 'prediction-result':
      return <PredictionResultScreen tripId={route.tripId} predictionId={route.predictionId} />
    case 'english':
      return <EnglishScreen tripId={route.tripId} q={route.q} />
    case 'english-topic':
      return <EnglishTopicScreen tripId={route.tripId} topicId={route.topicId} tab={route.tab} />
    case 'english-saved':
      return <EnglishSavedScreen tripId={route.tripId} />
    case 'english-show':
      return <EnglishShowScreen tripId={route.tripId} itemId={route.itemId} from={route.from} q={route.q} />
  }
}
