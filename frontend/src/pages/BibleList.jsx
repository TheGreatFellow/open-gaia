import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getBibles, getBibleById } from '../lib/services'
import { LoadingScreen } from '../components/LoadingScreen'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useGameStore } from '../stores/useGameStore'

export default function BibleList() {
    const [bibles, setBibles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const navigate = useNavigate()
    const { setGameBible, setGamePhase } = useGameStore()

    const handlePlayGame = async (bibleSummary) => {
        try {
            setIsPlaying(true)
            const data = await getBibleById(bibleSummary.id)
            const actualBible = data.game_bible || data
            setGameBible(actualBible)
            setGamePhase('playing')
            navigate('/')
        } catch (err) {
            console.error("Failed to fetch full bible for playing:", err)
            setError(err.response?.data?.detail || err.message || 'Failed to load world for playing')
            setIsPlaying(false)
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

    if (loading || isPlaying) return <LoadingScreen />

    return (
        <div className="min-h-screen bg-neutral-950 p-6 md:p-12">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-50">
                            Generated Worlds
                        </h1>
                        <p className="text-neutral-400 mt-2">
                            Explore all the game bibles you've created.
                        </p>
                    </div>
                    <Link to="/create">
                        <Button className="font-semibold">Create New World</Button>
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-md">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {bibles.length === 0 && !error ? (
                    <div className="text-center py-20 border-2 border-dashed border-neutral-800 rounded-xl">
                        <p className="text-neutral-500">No worlds created yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {bibles.map((bible) => (
                            <Card key={bible.id} className="bg-neutral-900 border-neutral-800 flex flex-col h-full">
                                <CardHeader>
                                    <CardTitle className="text-2xl font-bold text-neutral-50">
                                        {bible.title}
                                    </CardTitle>
                                    <CardDescription className="text-neutral-400 uppercase tracking-widest text-xs font-semibold mt-1">
                                        {bible.tone}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-4">
                                    <div>
                                        <h4 className="text-neutral-300 font-medium mb-1">Setting</h4>
                                        <p className="text-sm text-neutral-400 line-clamp-3">
                                            {bible.setting}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-neutral-300 font-medium mb-1">End Goal</h4>
                                        <p className="text-sm text-neutral-400 line-clamp-2">
                                            {bible.end_goal}
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                                    <span className="text-xs text-neutral-500">
                                        {new Date(bible.created_at).toLocaleDateString()}
                                    </span>
                                    <div className="flex gap-2">
                                        <Link to={`/bibles/${bible.id}`}>
                                            <Button variant="outline" size="sm" className="bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700">
                                                View Details
                                            </Button>
                                        </Link>
                                        <Button
                                            size="sm"
                                            onClick={() => handlePlayGame(bible)}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                        >
                                            Play
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
