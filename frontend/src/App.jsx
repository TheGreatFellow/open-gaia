import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useGameStore } from './stores/useGameStore'
import { GameShell } from './components/GameShell'
import { Sidebar } from './components/Sidebar'
import HomePage from './pages/HomePage'
import CreateWorld from './pages/CreateWorld'
import BibleList from './pages/BibleList'
import BibleDetail from './pages/BibleDetail'

function App() {
  const gamePhase = useGameStore((state) => state.gamePhase)

  // Full-screen game mode — no sidebar, no chrome
  if (gamePhase === 'playing') {
    return (
      <BrowserRouter>
        <GameShell />
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0a0a] text-[#cccccc] flex" style={{ fontFamily: 'RetroGaming, monospace' }}>
        <Sidebar />
        <main className="flex-1 ml-60 p-6 md:p-8 overflow-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
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
