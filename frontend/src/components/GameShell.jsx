import { useEffect, useState, useRef } from 'react'
import { PhaserGame } from '../game/PhaserGame'
import { EventBus } from '../game/EventBus'
import { useGameStore } from '../stores/useGameStore'
import { sendNPCDialogue } from '../lib/services'

export function GameShell() {
    const gameBible = useGameStore(state => state.gameBible)
    const npcStates = useGameStore(state => state.npcStates)
    const updateNpcState = useGameStore(state => state.updateNpcState)
    const completedTasks = useGameStore(state => state.completedTasks)
    const completeTask = useGameStore(state => state.completeTask)

    // Use refs to avoid stale closures in event listeners
    const storeRef = useRef({ gameBible, npcStates, updateNpcState, completedTasks, completeTask })

    useEffect(() => {
        storeRef.current = { gameBible, npcStates, updateNpcState, completedTasks, completeTask }
    }, [gameBible, npcStates, updateNpcState, completedTasks, completeTask])

    // Sync completedTasks to Phaser (WorldScene uses this for act gating)
    // Also auto-complete tasks with no assigned NPC when prerequisites are met
    useEffect(() => {
        EventBus.emit('sync-completed-tasks', completedTasks)

        // Auto-complete tasks whose prerequisites are now all met
        // Only persuasion tasks require actual NPC dialogue
        const PERSUASION_TYPES = ['persuasion', 'emotional persuasion', 'AI persuasion']
        const allTasks = gameBible?.tasks || []
        allTasks.forEach(task => {
            if (completedTasks.includes(task.id)) return  // already done
            // Persuasion tasks with an NPC need dialogue — skip auto-complete
            if (task.assigned_npc && PERSUASION_TYPES.includes(task.type)) return
            const reqsMet = (task.requires || []).every(reqId => completedTasks.includes(reqId))
            if (reqsMet) {
                completeTask(task.id)
            }
        })
        // If we auto-completed tasks, the next render cycle will re-run this effect
        // because completeTask updates completedTasks in Zustand → cascading completion
    }, [completedTasks, gameBible, completeTask])

    const [isDialogueLoading, setIsDialogueLoading] = useState(false)

    useEffect(() => {
        const handleDialogueFlow = async (charId, choiceIndex, choiceText) => {
            const { gameBible, npcStates, updateNpcState, completedTasks, completeTask } = storeRef.current
            const character = gameBible?.characters?.find(c => c.id === charId)
            if (!character) {
                console.error("Character not found:", charId)
                EventBus.emit('dialogue-closed')
                return
            }

            // Figure out active tasks for this NPC
            const allTasks = gameBible?.tasks || []
            const activeTasksForNPC = []
            const blockedTasksForNPC = []

            // Check how many total tasks this NPC has (completed or not)
            const totalNpcTasks = allTasks.filter(t => t.assigned_npc === charId)
            const allNpcTasksDone = totalNpcTasks.length > 0 && totalNpcTasks.every(t => completedTasks.includes(t.id))

            allTasks.forEach(task => {
                if (task.assigned_npc !== charId) return
                if (completedTasks.includes(task.id)) return

                const reqsMet = (task.requires || []).every(reqId => completedTasks.includes(reqId))
                if (reqsMet) {
                    activeTasksForNPC.push(task)
                } else {
                    const missingReqs = (task.requires || []).filter(reqId => !completedTasks.includes(reqId))
                    const missingTitles = missingReqs.map(reqId => allTasks.find(t => t.id === reqId)?.title || reqId)
                    blockedTasksForNPC.push({
                        ...task,
                        missing_titles: missingTitles
                    })
                }
            })

            const state = npcStates[charId] || { trust_level: 0, conversation_history: [] }

            // If ALL of this NPC's tasks are already completed, dismiss
            if (allNpcTasksDone && character.role !== 'protagonist') {
                setTimeout(() => {
                    EventBus.emit('dialogue-ready', {
                        npc_response: `We've done what we needed to do. Good luck on the rest of your journey.`,
                        trust_delta: 0,
                        new_trust_level: state.trust_level,
                        is_convinced: true,
                        emotion: 'friendly',
                        player_choices: [],
                        blocked: false,
                        blocked_reason: '',
                        characterId: charId,
                        characterName: character.name,
                        activeTasks: [],
                        blockedTasks: [],
                    })
                }, 0)
                return
            }

            // If NPC has ONLY blocked tasks (no active ones), refuse without calling the API
            if (activeTasksForNPC.length === 0 && blockedTasksForNPC.length > 0 && character.role !== 'protagonist') {
                const refusalText = `I have nothing to say to you right now. Come back when you're ready.`

                // Defer to next tick — synchronous emit causes a race condition
                // between WorldScene (still mid-update) and DialogueScene launch
                setTimeout(() => {
                    EventBus.emit('dialogue-ready', {
                        npc_response: refusalText,
                        trust_delta: 0,
                        new_trust_level: state.trust_level,
                        is_convinced: false,
                        emotion: 'neutral',
                        player_choices: [],
                        blocked: true,
                        blocked_reason: `Complete prerequisite tasks first.`,
                        characterId: charId,
                        characterName: character.name,
                        activeTasks: [],
                        blockedTasks: blockedTasksForNPC,
                    })
                }, 0)
                return
            }

            setIsDialogueLoading(true)

            try {
                // Call the API endpoint
                const response = await sendNPCDialogue(
                    character,
                    state.trust_level,
                    choiceIndex,
                    choiceText,
                    state.conversation_history,
                    activeTasksForNPC,
                    blockedTasksForNPC
                )

                // Keep track of what was just said
                const newHistory = [...state.conversation_history]
                if (choiceText) {
                    newHistory.push({ role: 'user', content: choiceText })
                }
                newHistory.push({ role: 'assistant', content: response.npc_response })

                // Update Zustand per-NPC memory
                updateNpcState(charId, {
                    trust_level: response.new_trust_level,
                    is_convinced: response.is_convinced,
                    conversation_history: newHistory
                })

                if (response.completed_task_id) {
                    completeTask(response.completed_task_id)
                }

                // Notify Phaser it can open/update the DialogueScene
                EventBus.emit('dialogue-ready', {
                    ...response,
                    characterId: charId,
                    characterName: character.name,
                    activeTasks: activeTasksForNPC,
                    blockedTasks: blockedTasksForNPC
                })

            } catch (err) {
                console.error("Failed to fetch NPC dialogue:", err)
                EventBus.emit('dialogue-closed')
            } finally {
                setIsDialogueLoading(false)
            }
        }

        const onNpcInteract = ({ characterId }) => {
            // New interaction, pass empty string
            handleDialogueFlow(characterId, 0, "")
        }

        const onPlayerChoice = (choice) => {
            // choice: { index, text, characterId }
            handleDialogueFlow(choice.characterId, choice.index, choice.text)
        }

        EventBus.on('npc-interact', onNpcInteract)
        EventBus.on('player-choice', onPlayerChoice)

        return () => {
            EventBus.off('npc-interact', onNpcInteract)
            EventBus.off('player-choice', onPlayerChoice)
        }
    }, [])

    return (
        <div className="flex flex-col min-h-screen bg-neutral-950">
            <div className="flex-1 flex items-center justify-center p-4 relative">
                <div className="overflow-hidden rounded-lg shadow-2xl ring-1 ring-white/10 relative">
                    <PhaserGame />
                    {isDialogueLoading && (
                        <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="text-neutral-50 flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                                <p className="font-medium animate-pulse text-neutral-300 tracking-wide">Connecting to AI...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-4 border-t border-neutral-800 text-neutral-400 text-center text-sm">
                HUD will go here
            </div>
        </div>
    )
}
