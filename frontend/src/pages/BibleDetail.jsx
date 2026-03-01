import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getBibleById } from '../lib/services'
import { useGameStore } from '../stores/useGameStore'

export default function BibleDetail() {
    const { id } = useParams()
    const [bibleData, setBibleData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()
    const { setGameBible, setGamePhase } = useGameStore()

    const handlePlayGame = () => {
        if (!bibleData) return
        setGameBible(bibleData)
        setGamePhase('playing')
        navigate('/')
    }

    useEffect(() => {
        const fetchBible = async () => {
            try {
                const data = await getBibleById(id)
                const bible = data.game_bible || data
                setBibleData(bible)
            } catch (err) {
                setError(err.response?.data?.detail || err.message || 'Failed to fetch bible details')
            } finally {
                setLoading(false)
            }
        }
        fetchBible()
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-[#39ff14] text-[10px] uppercase tracking-widest animate-pulse" style={{ fontFamily: 'RetroGaming, monospace', textShadow: '0 0 8px rgba(57,255,20,0.4)' }}>
                    Loading...
                </p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="retro-card p-6 text-center space-y-4">
                    <p className="text-[#ff4444] text-[10px]" style={{ fontFamily: 'RetroGaming, monospace' }}>⚠ {error}</p>
                    <Link to="/bibles">
                        <button className="px-4 py-2 bg-transparent text-[#ffe600] text-[9px] border border-[#ffe600] uppercase tracking-wider hover:bg-[#ffe600]/10 transition-colors" style={{ fontFamily: 'RetroGaming, monospace' }}>
                            ← Back
                        </button>
                    </Link>
                </div>
            </div>
        )
    }

    if (!bibleData) return null

    const { world, characters, tasks, locations } = bibleData

    return (
        <div className="space-y-6 fade-in max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/bibles">
                    <button className="px-3 py-1.5 bg-transparent text-[#777] text-[9px] border border-[#333] uppercase tracking-wider hover:border-[#ffe600] hover:text-[#ffe600] transition-colors" style={{ fontFamily: 'RetroGaming, monospace' }}>
                        ← Back
                    </button>
                </Link>
                <div className="ml-auto flex items-center gap-4">
                    <h1 className="text-lg text-[#ffe600] uppercase tracking-wider" style={{ fontFamily: 'RetroGaming, monospace', textShadow: '0 0 10px rgba(255,230,0,0.3)' }}>
                        World Bible
                    </h1>
                    <button
                        onClick={handlePlayGame}
                        className="px-4 py-2 bg-[#39ff14] text-black text-[9px] neon-btn"
                    >
                        ▶ Play World
                    </button>
                </div>
            </div>

            {/* ─── World Overview ─── */}
            <section>
                <h2 className="text-sm text-[#39ff14] retro-header mb-3" style={{ textShadow: '0 0 6px rgba(57,255,20,0.3)' }}>
                    ▶ World Overview
                </h2>
                <div className="retro-card p-5 space-y-4">
                    <h3 className="text-[14px] text-[#eee]" style={{ fontFamily: 'RetroGaming, monospace' }}>{world?.title || 'Unknown World'}</h3>

                    <div>
                        <h4 className="text-[8px] text-[#ff00ff] uppercase tracking-widest mb-1" style={{ fontFamily: 'RetroGaming, monospace' }}>Setting</h4>
                        <p className="text-[#999] text-[10px] leading-relaxed" style={{ fontFamily: 'RetroGaming, monospace' }}>{world?.setting}</p>
                    </div>

                    <div>
                        <h4 className="text-[8px] text-[#ff00ff] uppercase tracking-widest mb-1" style={{ fontFamily: 'RetroGaming, monospace' }}>End Goal</h4>
                        <p className="text-[#999] text-[10px] leading-relaxed" style={{ fontFamily: 'RetroGaming, monospace' }}>{world?.end_goal}</p>
                    </div>

                    <div className="pixel-sep" />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-[8px] text-[#ffe600] uppercase tracking-widest mb-1" style={{ fontFamily: 'RetroGaming, monospace' }}>Tone</h4>
                            <p className="text-[#bbb] text-[10px]" style={{ fontFamily: 'RetroGaming, monospace' }}>{world?.tone}</p>
                        </div>
                        <div>
                            <h4 className="text-[8px] text-[#ffe600] uppercase tracking-widest mb-1" style={{ fontFamily: 'RetroGaming, monospace' }}>Weather / Time</h4>
                            <p className="text-[#bbb] text-[10px]" style={{ fontFamily: 'RetroGaming, monospace' }}>{world?.weather} / {world?.time_of_day}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Characters ─── */}
            <section>
                <h2 className="text-sm text-[#ff00ff] retro-header mb-3" style={{ textShadow: '0 0 6px rgba(255,0,255,0.3)' }}>
                    ▶ Characters ({characters?.length || 0})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {characters?.map(char => (
                        <div key={char.id} className="retro-card p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[11px] text-[#eee]" style={{ fontFamily: 'RetroGaming, monospace' }}>{char.name}</h3>
                                <span className="neon-tag text-[#00ffff] border-[#00ffff]">
                                    {char.role}
                                </span>
                            </div>
                            <p className="text-[#888] text-[9px] leading-relaxed" style={{ fontFamily: 'RetroGaming, monospace' }}>{char.description}</p>
                            <div>
                                <h4 className="text-[8px] text-[#ffe600] uppercase tracking-widest mb-1.5" style={{ fontFamily: 'RetroGaming, monospace' }}>Traits</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {char.personality_traits?.map(trait => (
                                        <span key={trait} className="bg-[#1a1a1a] border border-[#333] px-2 py-0.5 text-[8px] text-[#aaa]" style={{ fontFamily: 'RetroGaming, monospace' }}>
                                            {trait}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Locations ─── */}
            <section>
                <h2 className="text-sm text-[#00ffff] retro-header mb-3" style={{ textShadow: '0 0 6px rgba(0,255,255,0.3)' }}>
                    ▶ Locations ({locations?.length || 0})
                </h2>
                <div className="space-y-3">
                    {locations?.map(loc => (
                        <div key={loc.id} className="retro-card p-4 space-y-2">
                            <h3 className="text-[11px] text-[#eee]" style={{ fontFamily: 'RetroGaming, monospace' }}>{loc.name}</h3>
                            <p className="text-[#888] text-[9px] leading-relaxed" style={{ fontFamily: 'RetroGaming, monospace' }}>{loc.description}</p>
                            <p className="text-[8px] text-[#555]" style={{ fontFamily: 'RetroGaming, monospace' }}>
                                Terrain: <span className="text-[#ff6600]">{loc.terrain_type}</span>
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Tasks ─── */}
            <section>
                <h2 className="text-sm text-[#ff6600] retro-header mb-3" style={{ textShadow: '0 0 6px rgba(255,102,0,0.3)' }}>
                    ▶ Tasks ({tasks?.length || 0})
                </h2>
                <div className="space-y-3">
                    {tasks?.map(task => (
                        <div key={task.id} className="retro-card p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[11px] text-[#eee]" style={{ fontFamily: 'RetroGaming, monospace' }}>{task.title}</h3>
                                <span className="neon-tag text-[#ff6600] border-[#ff6600]">
                                    {task.type}
                                </span>
                            </div>
                            <p className="text-[#888] text-[9px] leading-relaxed" style={{ fontFamily: 'RetroGaming, monospace' }}>{task.description}</p>
                            <div className="pixel-sep" />
                            <div className="grid grid-cols-2 gap-3 text-[8px]" style={{ fontFamily: 'RetroGaming, monospace' }}>
                                <div>
                                    <span className="text-[#ffe600]">Reward:</span>
                                    <span className="text-[#aaa] ml-1">{task.reward}</span>
                                </div>
                                <div>
                                    <span className="text-[#ffe600]">Complete:</span>
                                    <span className="text-[#aaa] ml-1">{task.completion_condition}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
