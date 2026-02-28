from __future__ import annotations

"""
Mistral AI service — wraps all three model tiers.

• mistral-large-latest   → Game Bible generation (JSON mode)
• mistral-small-latest   → live NPC dialogue
• magistral-medium-2506  → unexpected story branching (reasoning)
"""

import json
import logging
from typing import Optional

from mistralai import Mistral

from app.config import get_settings
from app.prompts.world_builder import WORLD_BUILDER_SYSTEM_PROMPT
from app.prompts.npc_dialogue import NPC_DIALOGUE_SYSTEM_PROMPT
from app.prompts.story_branch import STORY_BRANCH_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

# ── Singleton client ─────────────────────────────────

_client: Optional[Mistral] = None


def _get_client() -> Mistral:
    global _client
    if _client is None:
        settings = get_settings()
        _client = Mistral(api_key=settings.mistral_api_key)
    return _client


# ── Game Bible generation (Mistral Large) ────────────

async def generate_game_bible(story: str, end_goal: str) -> dict:
    """
    Send the user's story + end goal to Mistral Large
    and receive a complete Game Bible JSON.
    """
    client = _get_client()

    response = await client.chat.complete_async(
        model="mistral-large-latest",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": WORLD_BUILDER_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Story: {story}\nEnd Goal: {end_goal}",
            },
        ],
    )

    raw = response.choices[0].message.content
    logger.info("Game Bible generated (%d chars)", len(raw))
    return json.loads(raw)


# ── NPC dialogue (Mistral Small) ─────────────────────

async def generate_npc_dialogue(
    character: dict,
    player_input: str,
    trust_level: int,
    history: list[dict],
) -> dict:
    """
    Role-play as the NPC and return:
      { npc_reply, emotion, trust_delta, options: [{text, trust_delta}…] }
    """
    client = _get_client()

    # Build a context message with the character's personality
    character_context = (
        f"You are {character['name']}, a {character['archetype']}.\n"
        f"Motivation: {character['motivation']}\n"
        f"Personality: {', '.join(character.get('personality_traits', []))}\n"
        f"Current trust level from player: {trust_level}/100\n"
        f"Convincing triggers: {', '.join(character.get('convincing_triggers', []))}\n"
    )

    messages = [
        {"role": "system", "content": NPC_DIALOGUE_SYSTEM_PROMPT},
        {"role": "system", "content": character_context},
    ]

    # Append dialogue history
    for turn in history[-6:]:  # keep last 6 turns for context window
        messages.append(turn)

    messages.append({"role": "user", "content": player_input})

    response = await client.chat.complete_async(
        model="mistral-small-latest",
        response_format={"type": "json_object"},
        messages=messages,
    )

    return json.loads(response.choices[0].message.content)


# ── Story branching (Magistral Medium) ───────────────

async def handle_story_branch(
    choice: str,
    story_state: dict,
    end_goal: str,
) -> dict:
    """
    Reason about an unexpected player choice and produce
    the next story beat that steers back toward the end goal.

    Returns: { narrative, new_tasks: [], location_change: str|null }
    """
    client = _get_client()

    state_summary = json.dumps(story_state, indent=2)

    response = await client.chat.complete_async(
        model="magistral-medium-2506",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": STORY_BRANCH_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"Player's unexpected choice: {choice}\n\n"
                    f"Current story state:\n{state_summary}\n\n"
                    f"The story MUST eventually reach this end goal: {end_goal}"
                ),
            },
        ],
    )

    return json.loads(response.choices[0].message.content)
