import { useEffect, useState, useRef } from 'react'
import { PhaserGame } from '../game/PhaserGame'
import { EventBus } from '../game/EventBus'
import { useGameStore } from '../stores/useGameStore'
import { sendNPCDialogue } from '../lib/services'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'
// Voice preference stored in localStorage so it persists across sessions
const VOICE_PREF_KEY = 'open_gaia_voice_enabled'
function getVoicePref() {
    const val = localStorage.getItem(VOICE_PREF_KEY)
    return val === null ? true : val === 'true'
}
function setVoicePref(enabled) {
    localStorage.setItem(VOICE_PREF_KEY, String(enabled))
}

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
        // Any task with an assigned NPC needs character interaction — skip auto-complete
        const allTasks = gameBible?.tasks || []
        allTasks.forEach(task => {
            if (completedTasks.includes(task.id)) return  // already done
            if (task.assigned_npc) return
            const reqsMet = (task.requires || []).every(reqId => completedTasks.includes(reqId))
            if (reqsMet) {
                completeTask(task.id)
            }
        })
        // If we auto-completed tasks, the next render cycle will re-run this effect
        // because completeTask updates completedTasks in Zustand → cascading completion
    }, [completedTasks, gameBible, completeTask])

    const { width, height } = useWindowSize()
    const allTasksCompleted = gameBible?.tasks?.length > 0 && completedTasks.length === gameBible.tasks.length

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
                // Read current voice preference
                const enableVoice = getVoicePref()

                // Call the API endpoint
                const response = await sendNPCDialogue(
                    character,
                    state.trust_level,
                    choiceIndex,
                    choiceText,
                    state.conversation_history,
                    activeTasksForNPC,
                    blockedTasksForNPC,
                    enableVoice
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
                    // Tell WorldScene to make the NPC escort the player to the exit
                    EventBus.emit('npc-task-completed', { characterId: charId })
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

        const onVoiceToggle = (enabled) => {
            setVoicePref(enabled)
        }

        EventBus.on('npc-interact', onNpcInteract)
        EventBus.on('player-choice', onPlayerChoice)
        EventBus.on('voice-toggle', onVoiceToggle)

        return () => {
            EventBus.off('npc-interact', onNpcInteract)
            EventBus.off('player-choice', onPlayerChoice)
            EventBus.off('voice-toggle', onVoiceToggle)
        }
    }, [])

    return (
        <div className="flex flex-col min-h-screen bg-neutral-950">
            {allTasksCompleted && (
                <>
                    <Confetti width={width} height={height} numberOfPieces={300} recycle={false} />
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] animate-bounce">
                        <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-black px-8 py-5 rounded-xl shadow-[0_0_40px_rgba(234,179,8,0.5)] border-2 border-yellow-200 text-center flex flex-col items-center gap-4">
                            <div>
                                <h2 className="text-3xl font-black font-['RetroGaming'] tracking-widest mb-1">MISSION ACCOMPLISHED</h2>
                                <p className="font-bold opacity-80 text-sm">All tasks have been completed!</p>
                            </div>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="mt-2 px-6 py-2 bg-black text-yellow-400 font-['RetroGaming'] text-sm tracking-wider rounded border border-yellow-500/50 hover:bg-neutral-900 hover:border-yellow-400 hover:scale-105 transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                            >
                                RETURN TO HOME
                            </button>
                        </div>
                    </div>
                </>
            )}
            <div className="flex-1 flex items-center justify-center p-4 relative">
                <div className="overflow-hidden rounded-lg shadow-2xl ring-1 ring-white/10 relative">
                    <PhaserGame />
                    {isDialogueLoading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-[#0a0a1a] border-2 border-[#44aaff] px-6 py-4 rounded-sm flex items-center gap-4 shadow-[0_0_20px_rgba(68,170,255,0.3)]">
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 bg-[#44aaff] rounded-sm animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-[#44aaff] rounded-sm animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-[#44aaff] rounded-sm animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                                <p className="font-['RetroGaming'] text-[#ccddee] text-sm tracking-widest pt-1">
                                    Awaiting Response...
                                </p>
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
