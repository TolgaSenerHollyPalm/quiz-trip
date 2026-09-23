import { useEffect } from 'react'
import AddPredictionScreen from '../screens/AddPredictionScreen.tsx'
import GuessScreen from '../screens/GuessScreen.tsx'
import HomeScreen from '../screens/HomeScreen.tsx'
import PacksScreen from '../screens/PacksScreen.tsx'
import PlayersScreen from '../screens/PlayersScreen.tsx'
import PlayScreen from '../screens/PlayScreen.tsx'
import PredictionResultScreen from '../screens/PredictionResultScreen.tsx'
import PredictionScreen from '../screens/PredictionScreen.tsx'
import PredictionsScreen from '../screens/PredictionsScreen.tsx'
import QuizSettingsScreen from '../screens/QuizSettingsScreen.tsx'
import RoundResultScreen from '../screens/RoundResultScreen.tsx'
import ScoreboardScreen from '../screens/ScoreboardScreen.tsx'
import TripFormScreen from '../screens/TripFormScreen.tsx'
import TripScreen from '../screens/TripScreen.tsx'
import TripSettingsScreen from '../screens/TripSettingsScreen.tsx'
import AppDataProvider from './AppDataProvider.tsx'
import { href, useRoute, type Route } from './router.ts'
import UpdatePrompt from './UpdatePrompt.tsx'

export default function App() {
  const route = useRoute()
  const address = href(route)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [address])

  return (
    <>
      <AppDataProvider>
        {/* Keyed by address so a screen starts fresh whenever the route changes. */}
        <CurrentScreen key={address} route={route} />
      </AppDataProvider>
      <UpdatePrompt />
    </>
  )
}

function CurrentScreen({ route }: { route: Route }) {
  switch (route.screen) {
    case 'home':
      return <HomeScreen />
    case 'packs':
      return <PacksScreen />
    case 'trip-new':
      return <TripFormScreen />
    case 'trip-edit':
      return <TripFormScreen tripId={route.tripId} />
    case 'trip':
      return <TripScreen tripId={route.tripId} />
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
  }
}
