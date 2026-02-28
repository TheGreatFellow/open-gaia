import { useGameStore } from '../stores/useGameStore'
import { Button } from './ui/button'

export function StoryInput() {
    const setGamePhase = useGameStore((state) => state.setGamePhase)

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-neutral-50 px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8">
                StoryForge
            </h1>
            <Button
                onClick={() => setGamePhase('playing')}
                size="lg"
                className="font-semibold"
            >
                Test Game
            </Button>
        </div>
    )
}
