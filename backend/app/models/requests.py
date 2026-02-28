"""
Request body models for all API endpoints.
"""

from __future__ import annotations

from typing import Optional, List

from pydantic import BaseModel, Field

from app.models.game_bible import DialogueTree

class CompletedTask(BaseModel):
    id: str
    title: str
    reward: str

class PendingTask(BaseModel):
    id: str
    title: str
    description: str
    blocking: bool

class NPCState(BaseModel):
    id: str
    name: str
    trust_level: int
    trust_threshold: int
    is_convinced: bool

class LocationContext(BaseModel):
    id: str
    name: str
    description: str

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
    active_tasks: list[dict] = Field(
        default=[],
        description="List of currently active tasks assigned to this NPC"
    )
    blocked_tasks: list[dict] = Field(
        default=[],
        description="List of blocked tasks missing prerequisites"
    )
    player_choice_index: int = Field(ge=0, le=2)
    player_choice_text: str
    conversation_history: list[dict] = Field(default_factory=list)
    required_items: List[str] = []
    player_inventory: List[str] = []

class GeneratePortraitRequest(BaseModel):
    """POST /api/generate-portrait"""
    portrait_prompt: str = Field(..., description="FLUX prompt for character portrait")


class GenerateTileMapRequest(BaseModel):
    """POST /api/generate-tilemap"""
    tile_map_prompt: str = Field(..., description="Tile map description from location")

class StoryBranchRequest(BaseModel):
    """POST /api/story-branch"""
    end_goal: str
    world_tone: str
    story_so_far: str
    player_choice: str
    current_location: LocationContext
    completed_tasks: List[CompletedTask] = []
    pending_tasks: List[PendingTask] = []
    npc_states: List[NPCState] = []
    player_inventory: List[str] = []
