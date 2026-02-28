import { create } from 'zustand'

export const useGameStore = create((set) => ({
    gamePhase: 'input', // 'input' | 'loading' | 'playing'
    setGamePhase: (phase) => set({ gamePhase: phase }),

    gameBible: null,
    setGameBible: (bible) => set({ gameBible: bible }),
}))
