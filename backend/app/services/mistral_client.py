from __future__ import annotations

"""
Mistral AI service — wraps all three model tiers + tile map generation.

• mistral-large-latest   → 3-step Game Bible generation (JSON mode)
• mistral-small-latest   → live NPC dialogue (via chat_complete)
• magistral-medium-2506  → unexpected story branching (via chat_complete)
"""

import json
import logging
from typing import Optional

from mistralai import Mistral

from app.config import get_settings
from app.prompts.world_builder import (
    WORLD_STEP1_SYSTEM,
    WORLD_STEP2_SYSTEM,
    WORLD_STEP3_SYSTEM,
    TILE_MAP_SYSTEM,
)

logger = logging.getLogger(__name__)

# ── Singleton client ─────────────────────────────────

_client: Optional[Mistral] = None


def _get_client() -> Mistral:
    global _client
    if _client is None:
        settings = get_settings()
        _client = Mistral(api_key=settings.mistral_api_key)
    return _client


# ── Helper: single Mistral Large JSON call ───────────

async def _call_large(system_prompt: str, user_content: str) -> dict:
    """Shared helper for all mistral-large-latest calls with JSON mode."""
    client = _get_client()
    response = await client.chat.complete_async(
        model="mistral-medium-latest",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ],
    )
    return json.loads(response.choices[0].message.content)


# ── Generic chat complete (used by dialogue + story routes) ───

async def chat_complete(
    model: str,
    system_prompt: str,
    user_message: str,
    json_mode: bool = False,
    temperature: float = 0.7,
) -> str:
    """
    Generic async chat completion helper.
    Returns the raw string content from the model response.
    Used by dialogue and story branch routes with configurable model/temp/json_mode.
    """
    client = _get_client()

    kwargs = {
        "model": model,
        "temperature": temperature,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
    }
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    response = await client.chat.complete_async(**kwargs)
    return response.choices[0].message.content


# ── STEP 1: Character extraction (Mistral Large) ────

async def generate_characters(story: str, end_goal: str) -> dict:
    """
    Step 1 of world building — extract characters from the story.
    Returns: { "characters": [...] }
    """
    result = await _call_large(
        WORLD_STEP1_SYSTEM,
        f"Story: {story}\nEnd Goal: {end_goal}",
    )
    logger.info("Step 1 — %d characters extracted", len(result.get("characters", [])))
    return result


# ── STEP 2: World, tasks, locations (Mistral Large) ──

async def generate_world_structure(
    story: str, end_goal: str, characters_json: str
) -> dict:
    """
    Step 2 of world building — design world, tasks, locations.
    Receives the character list from Step 1 as context.
    Returns: { "world": {...}, "tasks": [...], "story_graph": {...}, "locations": [...] }
    """
    user_content = (
        f"Story: {story}\n"
        f"End Goal: {end_goal}\n\n"
        f"Characters (from Step 1):\n{characters_json}"
    )
    result = await _call_large(WORLD_STEP2_SYSTEM, user_content)
    logger.info(
        "Step 2 — world '%s', %d tasks, %d locations",
        result.get("world", {}).get("title", "?"),
        len(result.get("tasks", [])),
        len(result.get("locations", [])),
    )
    return result


# ── STEP 3: Final assembly (Mistral Large) ───────────

async def assemble_game_bible(characters_data: dict, world_data: dict) -> dict:
    """
    Step 3 — merge Step 1 characters + Step 2 world into one Game Bible.
    This is a simple merge call — the model just concatenates the two JSONs.
    """
    user_content = (
        f"CHARACTERS_DATA:\n{json.dumps(characters_data, indent=2)}\n\n"
        f"WORLD_DATA:\n{json.dumps(world_data, indent=2)}"
    )
    result = await _call_large(WORLD_STEP3_SYSTEM, user_content)
    logger.info("Step 3 — Game Bible assembled (%d chars)", len(json.dumps(result)))
    return result


# ── Full 3-step pipeline ─────────────────────────────

async def generate_game_bible(story: str, end_goal: str) -> dict:
    """
    Run the complete 3-step world generation pipeline:
      Step 1 → characters
      Step 2 → world + tasks + locations (using Step 1 characters as context)
      Step 3 → merge into final Game Bible
    """
    # Step 1: Extract characters
    characters_data = await generate_characters(story, end_goal)

    # Step 2: Build world structure (needs characters as input)
    characters_json = json.dumps(characters_data, indent=2)
    world_data = await generate_world_structure(story, end_goal, characters_json)

    # Step 3: Assemble final Game Bible
    game_bible = await assemble_game_bible(characters_data, world_data)

    return game_bible


# ── Tile map generation (Mistral Large) ──────────────

async def generate_tile_map(tile_map_prompt: str) -> dict:
    """
    Generate a Tiled-compatible JSON map for a location
    based on its tile_map_prompt field.
    """
    result = await _call_large(TILE_MAP_SYSTEM, tile_map_prompt)
    logger.info("Tile map generated (%d layers)", len(result.get("layers", [])))
    return result
