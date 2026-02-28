"""
Request body models for all API endpoints.
"""

from pydantic import BaseModel, Field


class GenerateWorldRequest(BaseModel):
    """POST /api/generate-world"""
    story: str = Field(..., min_length=10, description="The user's story text")
    end_goal: str = Field(..., min_length=5, description="The desired ending / goal")


class NPCDialogueRequest(BaseModel):
    """POST /api/npc-dialogue"""
    character_id: str
    player_input: str
    trust_level: int = Field(ge=0, le=100)
    history: list[dict] = Field(default_factory=list, description="Previous dialogue turns")


class BranchStoryRequest(BaseModel):
    """POST /api/branch-story"""
    choice: str = Field(..., description="The unexpected player choice")
    story_state: dict = Field(..., description="Current story progress snapshot")
    end_goal: str


class GeneratePortraitRequest(BaseModel):
    """POST /api/generate-portrait"""
    portrait_prompt: str = Field(..., description="FLUX prompt for character portrait")
