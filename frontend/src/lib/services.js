import api from './api';
import MOCK_GENERATE_WORLD_RESPONSE from '../data/mockGameBible';

// ── Feature flag: flip to false to use the real backend ─────
const USE_MOCK = false;

// ── World Generation ───────────────────────────────

/**
 * POST /api/generate-world
 *
 * @param {string} story     – The user's story premise (min 10 chars).
 * @param {string} endGoal   – The desired ending / win condition (min 5 chars).
 * @returns {Promise<object>} – { game_bible: { world, characters, tasks, story_graph, locations } }
 */
export async function generateWorld(story, endGoal) {
    if (USE_MOCK) {
        // Simulate a short network delay
        await new Promise((r) => setTimeout(r, 800));
        return MOCK_GENERATE_WORLD_RESPONSE;
    }

    const { data } = await api.post('/generate-world', {
        story,
        end_goal: endGoal,
    });
    return data;
}

// ── Bibles Listing & Retrieving ─────────────────────

/**
 * GET /api/bibles
 * Returns an array of game bible summaries.
 */
export async function getBibles() {
    // If mocking, return our single mock item as a summary
    if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 400));
        return {
            bibles: [
                {
                    id: 'mock-123',
                    title: MOCK_GENERATE_WORLD_RESPONSE.game_bible.world.title,
                    setting: MOCK_GENERATE_WORLD_RESPONSE.game_bible.world.setting,
                    tone: MOCK_GENERATE_WORLD_RESPONSE.game_bible.world.tone,
                    end_goal: MOCK_GENERATE_WORLD_RESPONSE.game_bible.world.end_goal,
                    created_at: new Date().toISOString(),
                }
            ]
        };
    }
    const { data } = await api.get('/bibles');
    return data;
}

/**
 * GET /api/bibles/:id
 * Returns a specific game bible by its ID.
 */
export async function getBibleById(id) {
    if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 400));
        // We only have one mock item, return it regardless of ID
        return MOCK_GENERATE_WORLD_RESPONSE;
    }
    const { data } = await api.get(`/bibles/${id}`);
    return data;
}

// ── NPC Dialogue ───────────────────────────────────

/**
 * POST /api/npc-dialogue
 *
 * @param {object}   character            – The full character object from game_bible.
 * @param {number}   trustLevel           – Current trust score (0-100).
 * @param {number}   playerChoiceIndex    – Index of the choice the player picked (0-2).
 * @param {string}   playerChoiceText     – Text of the choice the player picked.
 * @param {Array}    conversationHistory  – Array of { role, content } messages so far.
 * @returns {Promise<object>}             – { npc_response, trust_delta, new_trust_level, is_convinced, emotion, player_choices }
 */
export async function sendNPCDialogue(
    character,
    trustLevel,
    playerChoiceIndex,
    playerChoiceText,
    conversationHistory = [],
) {
    const { data } = await api.post('/npc-dialogue', {
        character_id: character.id,
        character_name: character.name,
        description: character.description,
        personality_traits: character.personality_traits,
        motivation: character.motivation,
        relationship_to_player: character.relationship_to_player,
        convincing_triggers: character.convincing_triggers,
        trust_level: trustLevel,
        trust_threshold: character.trust_threshold,
        dialogue_tree: character.dialogue_tree,
        player_choice_index: playerChoiceIndex,
        player_choice_text: playerChoiceText,
        conversation_history: conversationHistory,
    });
    return data;
}
