import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../components/ui/card'
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
            // Store the game bible in Zustand (we'll read it from the game later)
            useGameStore.setState({ gameBible: data.game_bible })
            setGamePhase('playing')
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-950 p-6">
            <Card className="w-full max-w-2xl bg-neutral-900 border-neutral-800">
                <CardHeader>
                    <CardTitle className="text-3xl font-extrabold tracking-tight text-neutral-50">
                        Create Your World
                    </CardTitle>
                    <CardDescription className="text-neutral-400">
                        Describe your story premise and define the end goals for your adventure.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {/* Story Premise */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="story" className="text-neutral-200">
                                Story Premise
                            </Label>
                            <Textarea
                                id="story"
                                placeholder="Describe your world, setting, and main conflict…"
                                value={story}
                                onChange={(e) => setStory(e.target.value)}
                                required
                                minLength={10}
                                rows={6}
                                className="bg-neutral-800 border-neutral-700 text-neutral-50 placeholder:text-neutral-500 resize-y"
                            />
                        </div>

                        {/* End Goal */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="end-goal" className="text-neutral-200">
                                End Goal
                            </Label>
                            <Input
                                id="end-goal"
                                placeholder="e.g. Deliver evidence to the UN tribunal within 72 hours"
                                value={endGoal}
                                onChange={(e) => setEndGoal(e.target.value)}
                                required
                                minLength={5}
                                className="bg-neutral-800 border-neutral-700 text-neutral-50 placeholder:text-neutral-500"
                            />
                        </div>

                        {/* Error message */}
                        {error && (
                            <p className="text-sm text-red-400">{error}</p>
                        )}

                        {/* Submit */}
                        <Button type="submit" size="lg" disabled={loading} className="font-semibold">
                            {loading ? 'Generating…' : 'Generate World'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
