"""
Request body models for all API endpoints.
"""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from app.models.game_bible import DialogueTree


class GenerateWorldRequest(BaseModel):
    """POST /api/generate-world"""
    story: str = Field(..., min_length=10, description="The user's story text")
    end_goal: str = Field(..., min_length=5, description="The desired ending / goal")


class NPCDialogueRequest(BaseModel):
    """POST /api/npc-dialogue — frontend sends character fields from Zustand"""
    character_id: str
    character_name: str
    description: str
    personality_traits: list[str]
    motivation: str
    relationship_to_player: str
    convincing_triggers: list[str]
    trust_level: int = Field(ge=0, le=100)
    trust_threshold: int = Field(ge=0, le=100)
    dialogue_tree: DialogueTree
    player_choice_index: int = Field(ge=0, le=2)
    player_choice_text: str
    conversation_history: list[dict] = Field(default_factory=list)


class BranchStoryRequest(BaseModel):
    """POST /api/branch-story"""
    choice: str = Field(..., description="The unexpected player choice")
    story_state: dict = Field(..., description="Current story progress snapshot")
    end_goal: str


class GeneratePortraitRequest(BaseModel):
    """POST /api/generate-portrait"""
    portrait_prompt: str = Field(..., description="FLUX prompt for character portrait")


class GenerateTileMapRequest(BaseModel):
    """POST /api/generate-tilemap"""
    tile_map_prompt: str = Field(..., description="Tile map description from location")
