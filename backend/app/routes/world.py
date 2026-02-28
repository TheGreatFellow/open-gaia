"""
POST /api/generate-world
GET  /api/bibles
GET  /api/bibles/{bible_id}

Orchestrates world-building + persistence.
"""

import hashlib
import logging

from fastapi import APIRouter, HTTPException

from app.models.game_bible import GameBible
from app.models.requests import GenerateWorldRequest
from app.models.responses import (
    GenerateWorldResponse,
    BibleListResponse,
    BibleSummary,
)
from app.services import mistral_client, portrait_service
from app.services.redis_cache import redis_manager
from app.services.mongo_client import mongo_manager
from app.fallback_bible import FALLBACK_GAME_BIBLE

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["World Generation"])


def _cache_key(story: str, end_goal: str) -> str:
    raw = f"{story}::{end_goal}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


@router.post("/generate-world", response_model=GenerateWorldResponse)
async def generate_world(req: GenerateWorldRequest):
    cache_key = _cache_key(req.story, req.end_goal)

    # 1. Check cache
    cached = await redis_manager.get_game_bible(cache_key)
    if cached:
        logger.info("Cache HIT for key=%s", cache_key)
        bible = GameBible(**cached)
        return GenerateWorldResponse(game_bible=bible)

    # 2. Run the 3-step Mistral pipeline
    try:
        raw_bible = await mistral_client.generate_game_bible(
            req.story, req.end_goal
        )
    except Exception as exc:
        logger.error("World generation pipeline failed: %s — using fallback", exc)
        raw_bible = FALLBACK_GAME_BIBLE

    # 3. Validate with Pydantic
    try:
        bible = GameBible(**raw_bible)
    except Exception as exc:
        logger.error("Game Bible validation failed: %s — using fallback", exc)
        bible = GameBible(**FALLBACK_GAME_BIBLE)

    # 4. Cache in Redis
    await redis_manager.set_game_bible(cache_key, bible.model_dump())

    # 5. Persist in MongoDB
    await mongo_manager.save_game_bible(
        story=req.story,
        end_goal=req.end_goal,
        bible_dict=bible.model_dump(),
    )

    # 6. Return
    return GenerateWorldResponse(game_bible=bible)


# ── List all stored bibles ──────────────────────────

@router.get("/bibles", response_model=BibleListResponse)
async def list_bibles():
    """Return summary list of all stored Game Bibles."""
    docs = await mongo_manager.get_all_bibles()
    summaries = [BibleSummary(**doc) for doc in docs]
    return BibleListResponse(bibles=summaries)


# ── Get a single bible by ID ────────────────────────

@router.get("/bibles/{bible_id}")
async def get_bible(bible_id: str):
    """Return a full Game Bible by its MongoDB _id."""
    doc = await mongo_manager.get_bible_by_id(bible_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Bible not found")
    return doc
