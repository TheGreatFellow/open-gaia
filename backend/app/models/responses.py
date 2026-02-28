"""
Response models for all API endpoints.
"""

from __future__ import annotations

from typing import Optional, List, Dict

from pydantic import BaseModel, Field

from app.models.game_bible import GameBible


class GenerateWorldResponse(BaseModel):
    """Returned by POST /api/generate-world"""
    game_bible: GameBible


class PlayerChoice(BaseModel):
    """A single dialogue choice presented to the player."""
    index: int
    text: str
    trust_hint: int

class BlockedTask(BaseModel):
    task_id: str
    reason: str
    new_condition: str

class BranchPlayerChoice(BaseModel):
    index: int
    text: str
    consequence_hint: str

class InventoryChanges(BaseModel):
    gained: List[str] = []
    lost: List[str] = []


class NPCDialogueResponse(BaseModel):
    """Returned by POST /api/npc-dialogue"""
    npc_response: str
    trust_delta: int
    new_trust_level: int
    is_convinced: bool
    emotion: str  # happy | neutral | angry | suspicious | grateful
    player_choices: list[PlayerChoice]
    blocked: bool = False
    blocked_reason: str = ""
    completed_task_id: str | None = Field(default=None, description="ID of the task completed in this turn, if any")

class GeneratePortraitResponse(BaseModel):
    """Returned by POST /api/generate-portrait"""
    image_url: str


class GenerateTileMapResponse(BaseModel):
    """Returned by POST /api/generate-tilemap"""
    tile_map: dict

class StoryBranchResponse(BaseModel):
    """Returned by POST /api/story-branch"""
    narrative: str
    consequence: str
    new_scene_description: str
    tasks_unlocked: List[str] = []
    tasks_blocked: List[BlockedTask] = []
    npc_trust_changes: Dict[str, int] = {}
    inventory_changes: InventoryChanges
    steers_toward_goal: bool
    player_choices: List[BranchPlayerChoice] = []


# ── Bible listing models ─────────────────────────

class BibleSummary(BaseModel):
    """Summary of a stored Game Bible for listing."""
    id: str
    title: str
    setting: str
    tone: str
    end_goal: str
    created_at: str


class BibleListResponse(BaseModel):
    """Returned by GET /api/bibles"""
    bibles: List[BibleSummary]
