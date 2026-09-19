import { useEffect } from 'react'
import HomeScreen from '../screens/HomeScreen.tsx'
import PlayersScreen from '../screens/PlayersScreen.tsx'
import PlayScreen from '../screens/PlayScreen.tsx'
import QuizSettingsScreen from '../screens/QuizSettingsScreen.tsx'
import RoundResultScreen from '../screens/RoundResultScreen.tsx'
import ScoreboardScreen from '../screens/ScoreboardScreen.tsx'
import TripScreen from '../screens/TripScreen.tsx'
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
  }
}
