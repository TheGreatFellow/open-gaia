"""
Pydantic v2 models that mirror the Game Bible JSON schema.

Fully dynamic — no fixed archetypes, terrain types, or task types.
Everything derives from the user's story.
"""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


# ── Sub-models ───────────────────────────────────────

class DialogueTree(BaseModel):
    greeting: str
    cooperative: str
    resistant: str
    convinced: str


class MovementProfile(BaseModel):
    speed: int = Field(ge=20, le=160)
    friction: float = Field(ge=0.1, le=1.0)
    camera_shake: bool = False
    ambient_sound: str
    step_sound: str


class World(BaseModel):
    title: str
    setting: str
    end_goal: str
    tone: str  # Free text — e.g. "tense sci-fi political thriller"
    time_of_day: str = "unknown"
    weather: str = "clear"


class Character(BaseModel):
    id: str
    name: str
    description: str  # Free text — what kind of person/entity
    visual_description: str  # What they look like in detail
    role: str  # protagonist | npc | antagonist | ally
    motivation: str
    personality_traits: list[str]
    relationship_to_player: str  # neutral | hostile | friendly | unknown
    convincing_triggers: list[str]
    trust_threshold: int = Field(ge=0, le=100)
    movement_style: str  # How they move when idle
    sprite_prompt: str  # FLUX prompt for sprite generation
    portrait_prompt: str  # FLUX prompt for dialogue portrait
    dialogue_tree: DialogueTree


class Task(BaseModel):
    id: str
    title: str
    description: str
    type: str  # Free text — e.g. "stealth infiltration", "emotional persuasion"
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
    location_id: str  # References a location id


class StoryGraph(BaseModel):
    opening_scene: str
    acts: list[Act]
    ending_scene: str


class Location(BaseModel):
    id: str
    name: str
    description: str  # What this place is and feels like
    terrain_type: str  # Free text terrain description
    background_prompt: str  # FLUX prompt for background image
    tile_map_prompt: str  # Description for procedural tile map gen
    movement_profile: MovementProfile
    npcs_present: list[str] = Field(default_factory=list)
    npc_spawn_slots: dict[str, str] = Field(default_factory=dict)
    player_spawn: str = "player_start"
    connected_to: list[str] = Field(default_factory=list)


# ── Top-level Game Bible ────────────────────────────

class GameBible(BaseModel):
    world: World
    characters: list[Character]
    tasks: list[Task]
    story_graph: StoryGraph
    locations: list[Location]
