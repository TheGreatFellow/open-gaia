import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getBibles, getBibleById } from '../lib/services'
import { useGameStore } from '../stores/useGameStore'
import heroImg from '../assets/hero_world.png'
import stepDescribe from '../assets/step_describe.png'
import stepGenerate from '../assets/step_generate.png'
import stepPlay from '../assets/step_play.png'

export default function HomePage() {
    const [bibles, setBibles] = useState([])
    const [loading, setLoading] = useState(true)
    const [playingId, setPlayingId] = useState(null)
    const navigate = useNavigate()
    const { setGameBible, setGamePhase } = useGameStore()

    useEffect(() => {
        getBibles()
            .then((data) => setBibles(data.bibles || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const handlePlay = async (bible) => {
        try {
            setPlayingId(bible.id)
            const data = await getBibleById(bible.id)
            const actualBible = data.game_bible || data
            setGameBible(actualBible)
            setGamePhase('playing')
            navigate('/')
        } catch {
            setPlayingId(null)
        }
    }

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'Just now'
        if (mins < 60) return `${mins}m ago`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs}h ago`
        const days = Math.floor(hrs / 24)
        return `${days}d ago`
    }

    return (
        <div className="space-y-6 fade-in">
            {/* ─── Hero Banner ─── */}
            <section className="relative overflow-hidden retro-card scanlines p-0">
                <div className="relative z-10 flex items-center gap-6 p-6 md:p-8">
                    {/* Left: Text */}
                    <div className="flex-1 min-w-0">
                        <p className="text-[#ff00ff] text-[10px] uppercase tracking-[0.2em] mb-3" style={{ textShadow: '0 0 8px rgba(255,0,255,0.5)' }}>
                            ★ AI-Powered Story Worlds ★
                        </p>
                        <h1 className="text-2xl md:text-3xl text-[#39ff14] leading-tight mb-3" style={{ fontFamily: 'RetroGaming, monospace', textShadow: '0 0 12px rgba(57,255,20,0.4)' }}>
                            Create, Explore &<br />Play Living Worlds
                        </h1>
                        <p className="text-[#999] text-[11px] leading-relaxed mb-6 max-w-md" style={{ fontFamily: 'RetroGaming, monospace' }}>
                            Describe any story and instantly generate a complete game world with
                            locations, NPCs, quests, and cinematic AI-driven dialogue.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link to="/create">
                                <button className="px-5 py-2.5 bg-[#39ff14] text-black text-[10px] neon-btn">
                                    Create a World
                                </button>
                            </Link>
                            <Link to="/bibles">
                                <button className="px-5 py-2.5 bg-transparent text-[#ff00ff] text-[10px] neon-btn-magenta">
                                    Browse Stories
                                </button>
                            </Link>
                        </div>
                    </div>
                    {/* Right: Hero Image */}
                    <div className="hidden lg:block shrink-0">
                        <img
                            src={heroImg}
                            alt="Floating world"
                            className="w-56 h-56 object-cover border-2 border-[#333] shadow-[4px_4px_0px_#000,0_0_20px_rgba(57,255,20,0.1)]"
                            style={{ imageRendering: 'pixelated' }}
                        />
                    </div>
                </div>
            </section>

            {/* ─── How It Works ─── */}
            <section>
                <h2 className="text-sm text-[#00ffff] retro-header mb-4" style={{ textShadow: '0 0 6px rgba(0,255,255,0.3)' }}>
                    ▶ How It Works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { num: '01', title: 'Describe', desc: 'Write a story premise and end goal.', color: '#39ff14', img: stepDescribe },
                        { num: '02', title: 'Generate', desc: 'AI builds locations, characters & quests.', color: '#ff00ff', img: stepGenerate },
                        { num: '03', title: 'Play', desc: 'Walk through your world & talk to NPCs.', color: '#ffe600', img: stepPlay },
                    ].map((step, i) => (
                        <div key={i} className="retro-card p-4 flex flex-col items-center text-center">
                            <img
                                src={step.img}
                                alt={step.title}
                                className="w-24 h-24 object-contain mb-3"
                                style={{ imageRendering: 'pixelated' }}
                            />
                            <span className="text-lg leading-none mb-1" style={{ color: step.color, fontFamily: 'RetroGaming, monospace', textShadow: `0 0 8px ${step.color}55` }}>{step.num}</span>
                            <h3 className="text-[11px] mb-1 uppercase tracking-wider" style={{ color: step.color, fontFamily: 'RetroGaming, monospace' }}>{step.title}</h3>
                            <p className="text-[#777] text-[9px] leading-relaxed" style={{ fontFamily: 'RetroGaming, monospace' }}>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Featured Games ─── */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm text-[#ffe600] retro-header" style={{ textShadow: '0 0 6px rgba(255,230,0,0.3)' }}>
                        ▶ Featured Games
                    </h2>
                    <Link to="/bibles" className="text-[9px] text-[#39ff14] hover:text-[#6fff6f] uppercase tracking-wider transition-colors" style={{ fontFamily: 'RetroGaming, monospace' }}>
                        View all →
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="retro-card p-4 h-36 animate-pulse">
                                <div className="h-3 bg-[#222] w-2/3 mb-3" />
                                <div className="h-2 bg-[#222] w-1/3 mb-3" />
                                <div className="h-2 bg-[#222] w-full mb-2" />
                                <div className="h-2 bg-[#222] w-4/5" />
                            </div>
                        ))}
                    </div>
                ) : bibles.length === 0 ? (
                    <div className="retro-card p-8 text-center">
                        <p className="text-[#555] text-[10px] mb-3" style={{ fontFamily: 'RetroGaming, monospace' }}>No worlds created yet.</p>
                        <Link to="/create">
                            <button className="px-4 py-2 bg-transparent text-[#39ff14] text-[10px] neon-btn">
                                Create your first world
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bibles.slice(0, 6).map((bible, i) => (
                            <div key={bible.id} className="retro-card p-4 flex flex-col slide-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-[#eee] text-[11px] leading-snug line-clamp-1" style={{ fontFamily: 'RetroGaming, monospace' }}>{bible.title}</h3>
                                    {bible.tone && (
                                        <span className="neon-tag text-[#ff00ff] border-[#ff00ff] shrink-0 ml-2">
                                            {bible.tone}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[#777] text-[9px] leading-relaxed line-clamp-3 flex-1 mb-3" style={{ fontFamily: 'RetroGaming, monospace' }}>
                                    {bible.setting || 'An AI-generated story world.'}
                                </p>
                                <div className="pixel-sep mb-3" />
                                <div className="flex items-center justify-between">
                                    <Link to={`/bibles/${bible.id}`} className="text-[9px] text-[#555] hover:text-[#aaa] uppercase tracking-wider transition-colors" style={{ fontFamily: 'RetroGaming, monospace' }}>
                                        Details
                                    </Link>
                                    <button
                                        onClick={() => handlePlay(bible)}
                                        disabled={playingId === bible.id}
                                        className="px-3 py-1 bg-transparent text-[#39ff14] text-[9px] border border-[#39ff14] uppercase tracking-wider hover:bg-[#39ff14]/10 transition-colors disabled:opacity-50"
                                        style={{ fontFamily: 'RetroGaming, monospace' }}
                                    >
                                        {playingId === bible.id ? 'Loading...' : '▶ Play'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ─── Latest Generations ─── */}
            {bibles.length > 0 && (
                <section>
                    <h2 className="text-sm text-[#00ffff] retro-header mb-3" style={{ textShadow: '0 0 6px rgba(0,255,255,0.3)' }}>
                        ▶ Latest Generations
                    </h2>
                    <div className="retro-card divide-y divide-[#222]">
                        {bibles.slice(0, 5).map((bible) => (
                            <div key={bible.id} className="flex items-center gap-4 px-4 py-3 hover:bg-[#1a1a1a] transition-colors">
                                <div className="w-8 h-8 border border-[#333] flex items-center justify-center text-sm shrink-0 bg-[#0a0a0a]">
                                    🌍
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[#ddd] text-[10px] truncate" style={{ fontFamily: 'RetroGaming, monospace' }}>{bible.title}</p>
                                    <p className="text-[#555] text-[8px]" style={{ fontFamily: 'RetroGaming, monospace' }}>{timeAgo(bible.created_at)}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Link to={`/bibles/${bible.id}`} className="text-[8px] text-[#555] hover:text-[#aaa] uppercase px-2 py-1 transition-colors" style={{ fontFamily: 'RetroGaming, monospace' }}>
                                        View
                                    </Link>
                                    <button
                                        onClick={() => handlePlay(bible)}
                                        disabled={playingId === bible.id}
                                        className="text-[8px] text-[#39ff14] hover:text-[#6fff6f] uppercase px-2 py-1 transition-colors disabled:opacity-50"
                                        style={{ fontFamily: 'RetroGaming, monospace' }}
                                    >
                                        {playingId === bible.id ? '...' : 'Play'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}
