"""
POST /api/story-branch

Handles unexpected player choices via Magistral Medium (reasoning model).
Uses build_story_branch_prompt() from story_branch.py.
"""

import json
import logging

from fastapi import APIRouter, HTTPException

from app.models.requests import StoryBranchRequest
from app.models.responses import StoryBranchResponse
from app.services.mistral_client import chat_complete
from app.prompts.story_branch import build_story_branch_prompt

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Story Branching"])


@router.post("/story-branch", response_model=StoryBranchResponse)
async def story_branch(request: StoryBranchRequest):

    # Build game_state dict for prompt builder
    game_state = {
        "end_goal":         request.end_goal,
        "world_tone":       request.world_tone,
        "story_so_far":     request.story_so_far,
        "current_location": request.current_location.model_dump(),
        "player_choice":    request.player_choice,
        "completed_tasks":  [t.model_dump() for t in request.completed_tasks],
        "pending_tasks":    [t.model_dump() for t in request.pending_tasks],
        "npc_states":       [n.model_dump() for n in request.npc_states],
        "player_inventory": request.player_inventory,
    }

    system_prompt, user_message = build_story_branch_prompt(game_state)

    try:
        raw = await chat_complete(
            model="magistral-medium-2506",
            system_prompt=system_prompt,
            user_message=user_message,
            json_mode=True,
            temperature=0.7,
        )
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        logger.error("Story branch parse error: %s", e)
        raise HTTPException(status_code=500, detail=f"Story branch parse error: {e}")
    except Exception as e:
        logger.error("Story branch failed: %s", e)
        raise HTTPException(status_code=500, detail=f"Story branch failed: {e}")

    return StoryBranchResponse(
        narrative=data.get("narrative", ""),
        consequence=data.get("consequence", ""),
        new_scene_description=data.get("new_scene_description", ""),
        tasks_unlocked=data.get("tasks_unlocked", []),
        tasks_blocked=data.get("tasks_blocked", []),
        npc_trust_changes=data.get("npc_trust_changes", {}),
        inventory_changes=data.get("inventory_changes", {"gained": [], "lost": []}),
        steers_toward_goal=data.get("steers_toward_goal", True),
        player_choices=data.get("player_choices", []),
    )