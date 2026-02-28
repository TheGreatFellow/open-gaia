"""
POST /api/generate-world

Orchestrates the full 3-step world-building pipeline:
  Step 1: Mistral Large → character extraction
  Step 2: Mistral Large → world, tasks, locations (using Step 1 characters)
  Step 3: Mistral Large → merge into final Game Bible
  Step 4: Fan-out portrait + sprite generation in parallel
  Step 5: Cache and return
"""

import hashlib
import logging

from fastapi import APIRouter, HTTPException

from app.models.game_bible import GameBible
from app.models.requests import GenerateWorldRequest
from app.models.responses import GenerateWorldResponse
from app.services import mistral_client, portrait_service
from app.services.redis_cache import redis_manager
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

    # 2. Run the 3-step Mistral Large pipeline
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

    # 5. Cache
    await redis_manager.set_game_bible(cache_key, bible.model_dump())

    # 6. Return
    return GenerateWorldResponse(game_bible=bible)
