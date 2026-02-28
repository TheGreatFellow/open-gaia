"""
Response models for all API endpoints.
"""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel

from app.models.game_bible import GameBible


class GenerateWorldResponse(BaseModel):
    """Returned by POST /api/generate-world"""
    game_bible: GameBible


class PlayerChoice(BaseModel):
    """A single dialogue choice presented to the player."""
    index: int
    text: str
    trust_hint: int


class NPCDialogueResponse(BaseModel):
    """Returned by POST /api/npc-dialogue"""
    npc_response: str
    trust_delta: int
    new_trust_level: int
    is_convinced: bool
    emotion: str  # happy | neutral | angry | suspicious | grateful
    player_choices: list[PlayerChoice]


class BranchStoryResponse(BaseModel):
    """Returned by POST /api/branch-story"""
    narrative: str
    consequence: str
    new_scene_description: str
    tasks_affected: list[str] = []
    steers_toward_goal: bool = True


class GeneratePortraitResponse(BaseModel):
    """Returned by POST /api/generate-portrait"""
    image_url: str


class GenerateTileMapResponse(BaseModel):
    """Returned by POST /api/generate-tilemap"""
    tile_map: dict
