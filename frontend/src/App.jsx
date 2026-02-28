import { useGameStore } from './stores/useGameStore'
import { StoryInput } from './components/StoryInput'
import { LoadingScreen } from './components/LoadingScreen'
import { GameShell } from './components/GameShell'

function App() {
  const gamePhase = useGameStore((state) => state.gamePhase)

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-neutral-800">
      {gamePhase === 'input' && <StoryInput />}
      {gamePhase === 'loading' && <LoadingScreen />}
      {gamePhase === 'playing' && <GameShell />}
    </div>
  )
}

export default App
