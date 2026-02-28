import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getBibleById } from '../lib/services'
import { LoadingScreen } from '../components/LoadingScreen'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'

export default function BibleDetail() {
    const { id } = useParams()
    const [bibleData, setBibleData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchBible = async () => {
            try {
                const data = await getBibleById(id)
                // The data might come wrapped in generic responses or standalone based on backend route implementation
                // If it came from /api/bibles/:id it's probably the plain dict. If it has a game_bible key, extract it.
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

    if (loading) return <LoadingScreen />

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-950">
                <div className="text-center space-y-4">
                    <p className="text-red-400">{error}</p>
                    <Link to="/bibles">
                        <Button variant="outline">Back to Bibles</Button>
                    </Link>
                </div>
            </div>
        )
    }

    if (!bibleData) return null

    const { world, characters, tasks, locations } = bibleData

    return (
        <div className="min-h-screen bg-neutral-950 p-6 md:p-12 text-neutral-200">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="flex items-center gap-4">
                    <Link to="/bibles">
                        <Button variant="outline" size="sm" className="bg-neutral-800 border-neutral-700 text-neutral-300">
                            ← Back
                        </Button>
                    </Link>
                    <h1 className="text-4xl font-extrabold tracking-tight text-neutral-50 ml-auto">
                        Game Bible Details
                    </h1>
                </div>

                {/* World Overvew */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-neutral-50 border-b border-neutral-800 pb-2">
                        World Overview
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-neutral-900 border-neutral-800 md:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-xl text-neutral-100">{world?.title || 'Unknown World'}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-1">Setting</h4>
                                    <p className="text-neutral-300">{world?.setting}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-1">End Goal</h4>
                                    <p className="text-neutral-300">{world?.end_goal}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <h4 className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-1">Tone</h4>
                                        <p className="text-neutral-300">{world?.tone}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-1">Weather / Time</h4>
                                        <p className="text-neutral-300">{world?.weather} / {world?.time_of_day}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Characters */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-neutral-50 border-b border-neutral-800 pb-2">
                        Characters ({characters?.length || 0})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {characters?.map(char => (
                            <Card key={char.id} className="bg-neutral-900 border-neutral-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg text-neutral-100 flex items-center justify-between">
                                        {char.name}
                                        <span className="text-xs px-2 py-1 bg-neutral-800 rounded-full text-neutral-400 capitalize">
                                            {char.role}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-neutral-300">{char.description}</p>
                                    <div className="text-sm">
                                        <h4 className="font-medium text-neutral-400 mb-1">Traits</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {char.personality_traits?.map(trait => (
                                                <span key={trait} className="bg-neutral-800 px-2 py-0.5 rounded text-xs text-neutral-300">
                                                    {trait}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Locations */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-neutral-50 border-b border-neutral-800 pb-2">
                        Locations ({locations?.length || 0})
                    </h2>
                    <div className="space-y-4">
                        {locations?.map(loc => (
                            <Card key={loc.id} className="bg-neutral-900 border-neutral-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg text-neutral-100">{loc.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="text-sm text-neutral-300">{loc.description}</p>
                                    <p className="text-xs text-neutral-500">Terrain: {loc.terrain_type}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Tasks */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-neutral-50 border-b border-neutral-800 pb-2">
                        Tasks ({tasks?.length || 0})
                    </h2>
                    <div className="space-y-4">
                        {tasks?.map(task => (
                            <Card key={task.id} className="bg-neutral-900 border-neutral-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg text-neutral-100 flex items-center justify-between">
                                        {task.title}
                                        <span className="text-xs px-2 py-1 bg-neutral-800 rounded-full text-neutral-400">
                                            {task.type}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="text-sm text-neutral-300">{task.description}</p>
                                    <div className="mt-2 text-xs grid grid-cols-2 gap-2 text-neutral-400">
                                        <div><strong className="text-neutral-300">Reward:</strong> {task.reward}</div>
                                        <div><strong className="text-neutral-300">Completion:</strong> {task.completion_condition}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
