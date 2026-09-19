import { useEffect } from 'react'
import AddPredictionScreen from '../screens/AddPredictionScreen.tsx'
import GuessScreen from '../screens/GuessScreen.tsx'
import HomeScreen from '../screens/HomeScreen.tsx'
import PlayersScreen from '../screens/PlayersScreen.tsx'
import PlayScreen from '../screens/PlayScreen.tsx'
import PredictionResultScreen from '../screens/PredictionResultScreen.tsx'
import PredictionScreen from '../screens/PredictionScreen.tsx'
import PredictionsScreen from '../screens/PredictionsScreen.tsx'
import QuizSettingsScreen from '../screens/QuizSettingsScreen.tsx'
import RoundResultScreen from '../screens/RoundResultScreen.tsx'
import ScoreboardScreen from '../screens/ScoreboardScreen.tsx'
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
    case 'trip':
      return <TripScreen packId={route.packId} />
    case 'players':
      return <PlayersScreen packId={route.packId} next={route.next} />
    case 'quiz':
      return <QuizSettingsScreen packId={route.packId} />
    case 'play':
      return <PlayScreen packId={route.packId} />
    case 'result':
      return <RoundResultScreen packId={route.packId} roundId={route.roundId} />
    case 'scores':
      return <ScoreboardScreen packId={route.packId} />
    case 'settings':
      return <TripSettingsScreen packId={route.packId} add={route.add} />
    case 'predictions':
      return <PredictionsScreen packId={route.packId} />
    case 'prediction-new':
      return <AddPredictionScreen packId={route.packId} />
    case 'prediction':
      return <PredictionScreen packId={route.packId} predictionId={route.predictionId} />
    case 'guess':
      return <GuessScreen packId={route.packId} predictionId={route.predictionId} playerId={route.playerId} />
    case 'prediction-result':
      return <PredictionResultScreen packId={route.packId} predictionId={route.predictionId} />
  }
}
