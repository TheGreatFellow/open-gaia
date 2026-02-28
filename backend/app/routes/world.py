"""
POST /api/generate-world

Orchestrates the full world-building pipeline:
  1. Check Redis cache
  2. Call Mistral Large → Game Bible JSON
  3. Validate with Pydantic
  4. Fan-out portrait generation in parallel
  5. Cache result in Redis
  6. Return to frontend
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
        # Still need portraits — they aren't cached separately yet
        portraits = await portrait_service.generate_portraits_batch(
            [c.model_dump() for c in bible.characters]
        )
        return GenerateWorldResponse(game_bible=bible, portraits=portraits)

    # 2. Generate via Mistral Large
    try:
        raw_bible = await mistral_client.generate_game_bible(
            req.story, req.end_goal
        )
    except Exception as exc:
        logger.error("Mistral Large failed: %s — using fallback", exc)
        raw_bible = FALLBACK_GAME_BIBLE

    # 3. Validate
    try:
        bible = GameBible(**raw_bible)
    except Exception as exc:
        logger.error("Game Bible validation failed: %s — using fallback", exc)
        bible = GameBible(**FALLBACK_GAME_BIBLE)

    # 4. Generate portraits in parallel
    portraits = await portrait_service.generate_portraits_batch(
        [c.model_dump() for c in bible.characters]
    )

    # 5. Cache
    await redis_manager.set_game_bible(cache_key, bible.model_dump())

    # 6. Return
    return GenerateWorldResponse(game_bible=bible, portraits=portraits)
