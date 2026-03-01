import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getBibles, getBibleById } from '../lib/services'
import { useGameStore } from '../stores/useGameStore'

export default function BibleList() {
    const [bibles, setBibles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [playingId, setPlayingId] = useState(null)
    const navigate = useNavigate()
    const { setGameBible, setGamePhase } = useGameStore()

    const handlePlayGame = async (bibleSummary) => {
        try {
            setPlayingId(bibleSummary.id)
            const data = await getBibleById(bibleSummary.id)
            const actualBible = data.game_bible || data
            setGameBible(actualBible)
            setGamePhase('playing')
            navigate('/')
        } catch (err) {
            console.error("Failed to fetch full bible for playing:", err)
            setError(err.response?.data?.detail || err.message || 'Failed to load world for playing')
            setPlayingId(null)
        }
    }

    useEffect(() => {
        const fetchBibles = async () => {
            try {
                const data = await getBibles()
                setBibles(data.bibles || [])
            } catch (err) {
                setError(err.response?.data?.detail || err.message || 'Failed to fetch bibles')
            } finally {
                setLoading(false)
            }
        }
        fetchBibles()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-[#39ff14] text-[10px] uppercase tracking-widest animate-pulse" style={{ fontFamily: 'RetroGaming, monospace', textShadow: '0 0 8px rgba(57,255,20,0.4)' }}>
                    Loading...
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl text-[#ffe600] uppercase tracking-wider" style={{ fontFamily: 'RetroGaming, monospace', textShadow: '0 0 10px rgba(255,230,0,0.3)' }}>
                        Generated Worlds
                    </h1>
                    <p className="text-[#555] text-[9px] mt-1 uppercase tracking-wide" style={{ fontFamily: 'RetroGaming, monospace' }}>
                        Explore all the game worlds you have created.
                    </p>
                </div>
                <Link to="/create">
                    <button className="px-5 py-2.5 bg-[#39ff14] text-black text-[10px] neon-btn">
                        + New World
                    </button>
                </Link>
            </div>

            {/* Error */}
            {error && (
                <div className="retro-card border-[#ff0000] p-4">
                    <p className="text-[#ff4444] text-[10px]" style={{ fontFamily: 'RetroGaming, monospace' }}>⚠ {error}</p>
                </div>
            )}

            {/* Grid */}
            {bibles.length === 0 && !error ? (
                <div className="retro-card text-center py-16">
                    <p className="text-[#555] text-[10px] mb-4" style={{ fontFamily: 'RetroGaming, monospace' }}>No worlds created yet.</p>
                    <Link to="/create">
                        <button className="px-4 py-2 bg-transparent text-[#39ff14] text-[10px] neon-btn">
                            Create your first world
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bibles.map((bible, i) => (
                        <div key={bible.id} className="retro-card p-5 flex flex-col h-full slide-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
                            {/* Title + Tone */}
                            <div className="mb-3">
                                <h2 className="text-[13px] text-[#eee] mb-1" style={{ fontFamily: 'RetroGaming, monospace' }}>{bible.title}</h2>
                                {bible.tone && (
                                    <span className="neon-tag text-[#ff00ff] border-[#ff00ff]">
                                        {bible.tone}
                                    </span>
                                )}
                            </div>

                            {/* Setting */}
                            <div className="mb-2">
                                <h4 className="text-[#39ff14] text-[8px] uppercase tracking-widest mb-1" style={{ fontFamily: 'RetroGaming, monospace' }}>Setting</h4>
                                <p className="text-[#999] text-[9px] line-clamp-3" style={{ fontFamily: 'RetroGaming, monospace' }}>{bible.setting}</p>
                            </div>

                            {/* End Goal */}
                            <div className="mb-4 flex-grow">
                                <h4 className="text-[#ff00ff] text-[8px] uppercase tracking-widest mb-1" style={{ fontFamily: 'RetroGaming, monospace' }}>End Goal</h4>
                                <p className="text-[#999] text-[9px] line-clamp-2" style={{ fontFamily: 'RetroGaming, monospace' }}>{bible.end_goal}</p>
                            </div>

                            {/* Footer */}
                            <div className="pixel-sep mb-3" />
                            <div className="flex items-center justify-between">
                                <span className="text-[8px] text-[#444]" style={{ fontFamily: 'RetroGaming, monospace' }}>
                                    {new Date(bible.created_at).toLocaleDateString()}
                                </span>
                                <div className="flex gap-2">
                                    <Link to={`/bibles/${bible.id}`}>
                                        <button className="px-3 py-1.5 bg-transparent text-[#ffe600] text-[8px] border border-[#ffe600] uppercase tracking-wider hover:bg-[#ffe600]/10 transition-colors" style={{ fontFamily: 'RetroGaming, monospace' }}>
                                            Details
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => handlePlayGame(bible)}
                                        disabled={playingId === bible.id}
                                        className="px-3 py-1.5 bg-transparent text-[#39ff14] text-[8px] border border-[#39ff14] uppercase tracking-wider hover:bg-[#39ff14]/10 transition-colors disabled:opacity-50"
                                        style={{ fontFamily: 'RetroGaming, monospace' }}
                                    >
                                        {playingId === bible.id ? 'Loading...' : '▶ Play'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
