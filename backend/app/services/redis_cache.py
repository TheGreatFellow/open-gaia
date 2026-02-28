"""
Async Redis cache helper.

Gracefully degrades if Redis is unavailable — the app runs fine
without caching, just slower on repeat calls.
"""

import json
import logging
from typing import Optional

import redis.asyncio as aioredis

from app.config import get_settings

logger = logging.getLogger(__name__)

DEFAULT_TTL = 3600  # 1 hour


class RedisManager:
    """Manages a single async Redis connection pool."""

    def __init__(self):
        self._redis: Optional[aioredis.Redis] = None

    async def connect(self):
        settings = get_settings()
        try:
            self._redis = aioredis.from_url(
                settings.redis_url,
                decode_responses=True,
            )
            await self._redis.ping()
            logger.info("Redis connected at %s", settings.redis_url)
        except Exception as exc:
            logger.warning("Redis unavailable (%s) — caching disabled", exc)
            self._redis = None

    async def disconnect(self):
        if self._redis:
            await self._redis.aclose()
            logger.info("Redis disconnected")

    # ── Game Bible cache ────────────────────────────

    async def get_game_bible(self, key: str) -> Optional[dict]:
        if not self._redis:
            return None
        try:
            raw = await self._redis.get(f"bible:{key}")
            return json.loads(raw) if raw else None
        except Exception as exc:
            logger.warning("Redis GET failed: %s", exc)
            return None

    async def set_game_bible(
        self, key: str, data: dict, ttl: int = DEFAULT_TTL
    ):
        if not self._redis:
            return
        try:
            await self._redis.set(
                f"bible:{key}", json.dumps(data), ex=ttl
            )
            logger.info("Game Bible cached under key=%s (ttl=%ds)", key, ttl)
        except Exception as exc:
            logger.warning("Redis SET failed: %s", exc)

    # ── Generic helpers ─────────────────────────────

    async def get(self, key: str) -> Optional[str]:
        if not self._redis:
            return None
        try:
            return await self._redis.get(key)
        except Exception:
            return None

    async def set(self, key: str, value: str, ttl: int = DEFAULT_TTL):
        if not self._redis:
            return
        try:
            await self._redis.set(key, value, ex=ttl)
        except Exception:
            pass


# Module-level singleton used by main.py lifespan + routes
redis_manager = RedisManager()
