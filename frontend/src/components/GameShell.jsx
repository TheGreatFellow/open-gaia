import { PhaserGame } from '../game/PhaserGame'

export function GameShell() {
    return (
        <div className="flex flex-col min-h-screen bg-neutral-950">
            <div className="flex-1 flex items-center justify-center p-4">
                {/* The Phaser Game Canvas mounts inside this bounds */}
                <div className="overflow-hidden rounded-lg shadow-2xl ring-1 ring-white/10">
                    <PhaserGame />
                </div>
            </div>
            <div className="p-4 border-t border-neutral-800 text-neutral-400 text-center text-sm">
                HUD will go here
            </div>
        </div>
    )
}
