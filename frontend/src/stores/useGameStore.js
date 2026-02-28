import { create } from 'zustand'

export const useGameStore = create((set) => ({
    gamePhase: 'playing', // 'input' | 'loading' | 'playing'  (temporarily set to 'playing' for dev)
    setGamePhase: (phase) => set({ gamePhase: phase }),
}))
