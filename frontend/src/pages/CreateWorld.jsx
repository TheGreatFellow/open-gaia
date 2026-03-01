import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateWorld } from '../lib/services'
import { useGameStore } from '../stores/useGameStore'

export default function CreateWorld() {
    const [story, setStory] = useState('')
    const [endGoal, setEndGoal] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const setGamePhase = useGameStore((s) => s.setGamePhase)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const data = await generateWorld(story, endGoal)
            useGameStore.setState({ gameBible: data.game_bible })
            setGamePhase('playing')
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Something went wrong')
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 fade-in">
                <p className="text-[#ff00ff] text-[10px] uppercase tracking-widest animate-pulse" style={{ fontFamily: 'RetroGaming, monospace', textShadow: '0 0 8px rgba(255,0,255,0.4)' }}>
                    ▶ Generating world...
                </p>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-[70vh] fade-in">
            <div className="retro-card w-full max-w-2xl p-6">
                <h1 className="text-xl text-[#39ff14] uppercase tracking-wider mb-2" style={{ fontFamily: 'RetroGaming, monospace', textShadow: '0 0 10px rgba(57,255,20,0.3)' }}>
                    Create Your World
                </h1>
                <p className="text-[#555] text-[9px] mb-6 uppercase tracking-wide" style={{ fontFamily: 'RetroGaming, monospace' }}>
                    Describe your story premise and define the end goal.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Story Premise */}
                    <div className="space-y-2">
                        <label htmlFor="story" className="text-[9px] text-[#ffe600] uppercase tracking-widest" style={{ fontFamily: 'RetroGaming, monospace' }}>
                            Story Premise
                        </label>
                        <textarea
                            id="story"
                            placeholder="Describe your world, setting, and main conflict..."
                            value={story}
                            onChange={(e) => setStory(e.target.value)}
                            required
                            minLength={10}
                            rows={5}
                            className="w-full px-3 py-2.5 bg-[#0a0a0a] border-2 border-[#333] text-[#ccc] placeholder:text-[#444] text-[10px] leading-relaxed resize-y focus:outline-none focus:border-[#39ff14] transition-colors"
                            style={{ fontFamily: 'RetroGaming, monospace' }}
                        />
                    </div>

                    {/* End Goal */}
                    <div className="space-y-2">
                        <label htmlFor="end-goal" className="text-[9px] text-[#ffe600] uppercase tracking-widest" style={{ fontFamily: 'RetroGaming, monospace' }}>
                            End Goal
                        </label>
                        <input
                            id="end-goal"
                            type="text"
                            placeholder="e.g. Deliver evidence to the UN tribunal within 72 hours"
                            value={endGoal}
                            onChange={(e) => setEndGoal(e.target.value)}
                            required
                            minLength={5}
                            className="w-full px-3 py-2.5 bg-[#0a0a0a] border-2 border-[#333] text-[#ccc] placeholder:text-[#444] text-[10px] focus:outline-none focus:border-[#39ff14] transition-colors"
                            style={{ fontFamily: 'RetroGaming, monospace' }}
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-[10px] text-[#ff4444]" style={{ fontFamily: 'RetroGaming, monospace' }}>⚠ {error}</p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#39ff14] text-black text-[10px] neon-btn disabled:opacity-50"
                    >
                        ▶ Generate World
                    </button>
                </form>
            </div>
        </div>
    )
}
