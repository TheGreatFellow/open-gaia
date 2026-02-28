"""
Pydantic v2 models that mirror the Game Bible JSON schema exactly.
"""

from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ── Enums ────────────────────────────────────────────

class Tone(str, Enum):
    DARK = "dark"
    ADVENTURE = "adventure"
    MYSTERY = "mystery"
    COMEDY = "comedy"


class Archetype(str, Enum):
    WARRIOR = "warrior"
    MERCHANT = "merchant"
    WIZARD = "wizard"
    GUARD = "guard"
    VILLAIN = "villain"
    ELDER = "elder"
    CHILD = "child"


class Role(str, Enum):
    PROTAGONIST = "protagonist"
    NPC = "npc"
    ANTAGONIST = "antagonist"
    ALLY = "ally"


class Relationship(str, Enum):
    NEUTRAL = "neutral"
    HOSTILE = "hostile"
    FRIENDLY = "friendly"
    UNKNOWN = "unknown"


class TaskType(str, Enum):
    NPC_PERSUASION = "npc_persuasion"
    ITEM_FETCH = "item_fetch"
    INFORMATION_GATHER = "information_gather"
    MORAL_CHOICE = "moral_choice"
    PUZZLE = "puzzle"


class LocationType(str, Enum):
    FOREST = "forest"
    TOWN = "town"
    DUNGEON = "dungeon"
    CASTLE = "castle"
    MARKETPLACE = "marketplace"
    CAVE = "cave"


# ── Sub-models ───────────────────────────────────────

class DialogueTree(BaseModel):
    greeting: str
    cooperative: str
    resistant: str
    convinced: str


class World(BaseModel):
    title: str
    setting: str
    end_goal: str
    tone: Tone


class Character(BaseModel):
    id: str
    name: str
    archetype: Archetype
    role: Role
    motivation: str
    personality_traits: list[str]
    relationship_to_player: Relationship
    convincing_triggers: list[str]
    trust_threshold: int = Field(ge=0, le=100)
    dialogue_tree: DialogueTree
    portrait_prompt: str
    sprite_key: str


class Task(BaseModel):
    id: str
    title: str
    description: str
    type: TaskType
    assigned_npc: Optional[str] = None
    unlocks: list[str] = Field(default_factory=list)
    requires: list[str] = Field(default_factory=list)
    blocking: bool
    completion_condition: str
    reward: str


class Act(BaseModel):
    act_number: int
    title: str
    description: str
    tasks_in_act: list[str]
    location: LocationType


class StoryGraph(BaseModel):
    opening_scene: str
    acts: list[Act]
    ending_scene: str


class Location(BaseModel):
    id: str
    name: str
    type: LocationType
    background_key: str
    npcs_present: list[str] = Field(default_factory=list)
    connected_to: list[str] = Field(default_factory=list)


# ── Top-level Game Bible ────────────────────────────

class GameBible(BaseModel):
    world: World
    characters: list[Character]
    tasks: list[Task]
    story_graph: StoryGraph
    locations: list[Location]
