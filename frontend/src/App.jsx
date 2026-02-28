import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useGameStore } from './stores/useGameStore'
import { StoryInput } from './components/StoryInput'
import { LoadingScreen } from './components/LoadingScreen'
import { GameShell } from './components/GameShell'
import CreateWorld from './pages/CreateWorld'

function Home() {
  const gamePhase = useGameStore((state) => state.gamePhase)

  return (
    <>
      {gamePhase === 'input' && <StoryInput />}
      {gamePhase === 'loading' && <LoadingScreen />}
      {gamePhase === 'playing' && <GameShell />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-neutral-800">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateWorld />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
