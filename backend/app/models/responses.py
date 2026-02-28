"""
Response models for all API endpoints.
"""

from typing import Optional

from pydantic import BaseModel

from app.models.game_bible import GameBible


class GenerateWorldResponse(BaseModel):
    """Returned by POST /api/generate-world"""
    game_bible: GameBible
    portraits: dict[str, str]  # { character_id: image_url }


class DialogueOption(BaseModel):
    """A single dialogue choice presented to the player."""
    text: str
    trust_delta: int  # e.g. +20, +5, -10


class NPCDialogueResponse(BaseModel):
    """Returned by POST /api/npc-dialogue"""
    npc_reply: str
    emotion: str  # e.g. "angry", "pleased", "neutral"
    new_trust_level: int
    options: list[DialogueOption]  # Next 3 choices for the player
    task_unlocked: Optional[str] = None  # task_id if trust crossed threshold


class BranchStoryResponse(BaseModel):
    """Returned by POST /api/branch-story"""
    narrative: str
    new_tasks: list[dict] = []  # Any newly injected tasks
    location_change: Optional[str] = None  # location_id to transition to


class GeneratePortraitResponse(BaseModel):
    """Returned by POST /api/generate-portrait"""
    image_url: str
