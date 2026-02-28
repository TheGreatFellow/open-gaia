import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useGameStore } from './stores/useGameStore'
import { StoryInput } from './components/StoryInput'
import { LoadingScreen } from './components/LoadingScreen'
import { GameShell } from './components/GameShell'
import { Navigation } from './components/Navigation'
import CreateWorld from './pages/CreateWorld'
import BibleList from './pages/BibleList'
import BibleDetail from './pages/BibleDetail'

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
      <div className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-neutral-800 flex flex-col">
        <Navigation />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateWorld />} />
            <Route path="/bibles" element={<BibleList />} />
            <Route path="/bibles/:id" element={<BibleDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
