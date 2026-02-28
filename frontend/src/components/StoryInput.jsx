import { useGameStore } from '../stores/useGameStore'
import { Button } from './ui/button'
import { Link } from 'react-router-dom'

export function StoryInput() {
    const setGamePhase = useGameStore((state) => state.setGamePhase)

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-neutral-50 px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8">
                StoryForge
            </h1>
            <div className="flex flex-col gap-4">
                <Link to="/create">
                    <Button size="lg" className="w-full font-semibold">
                        Create New World
                    </Button>
                </Link>
                <Link to="/bibles">
                    <Button variant="outline" size="lg" className="w-full font-semibold bg-transparent border-neutral-700 text-neutral-200">
                        View Generated Worlds
                    </Button>
                </Link>
                <div className="pt-8">
                    <Button
                        variant="ghost"
                        onClick={() => setGamePhase('playing')}
                        size="sm"
                        className="text-neutral-500 hover:text-neutral-300"
                    >
                        Skip to Test Game
                    </Button>
                </div>
            </div>
        </div>
    )
}
