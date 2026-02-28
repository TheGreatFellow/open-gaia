import { create } from 'zustand'

export const useGameStore = create((set) => ({
    gamePhase: 'input', // 'input' | 'loading' | 'playing'
    setGamePhase: (phase) => set({ gamePhase: phase }),

    gameBible: null,
    completedTasks: [],
    completeTask: (taskId) => set((state) => ({
        completedTasks: [...new Set([...state.completedTasks, taskId])]
    })),
    setGameBible: (bible) => set((state) => {
        // Initialize npcStates for all characters from the new bible
        const newNpcStates = {}
        if (bible?.characters) {
            bible.characters.forEach(char => {
                newNpcStates[char.id] = {
                    trust_level: 0,
                    is_convinced: false,
                    conversation_history: []
                }
            })
        }
        return { gameBible: bible, npcStates: newNpcStates, completedTasks: [] }
    }),

    npcStates: {},
    updateNpcState: (characterId, updates) => set((state) => ({
        npcStates: {
            ...state.npcStates,
            [characterId]: {
                ...state.npcStates[characterId],
                ...updates
            }
        }
    })),
}))
