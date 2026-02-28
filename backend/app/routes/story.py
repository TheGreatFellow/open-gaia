"""
POST /api/branch-story

Handles unexpected player choices via Magistral Medium (reasoning model).
Produces the next story beat while steering back toward the end goal.
"""

import logging

from fastapi import APIRouter, HTTPException

from app.models.requests import BranchStoryRequest
from app.models.responses import BranchStoryResponse
from app.services import mistral_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Story Branching"])


@router.post("/branch-story", response_model=BranchStoryResponse)
async def branch_story(req: BranchStoryRequest):
    try:
        result = await mistral_client.handle_story_branch(
            choice=req.choice,
            story_state=req.story_state,
            end_goal=req.end_goal,
        )
    except Exception as exc:
        logger.error("Story branching failed: %s", exc)
        raise HTTPException(
            status_code=502,
            detail="Story branching failed — try again",
        )

    return BranchStoryResponse(
        narrative=result.get("narrative", "The story continues..."),
        consequence=result.get("consequence", ""),
        new_scene_description=result.get("new_scene_description", ""),
        tasks_affected=result.get("tasks_affected", []),
        steers_toward_goal=result.get("steers_toward_goal", True),
    )
