"""
Async MongoDB helper — stores Game Bibles for listing and retrieval.

Gracefully degrades if MongoDB is unavailable — the app runs fine
without persistence, just like Redis cache.
"""

import logging
from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import get_settings

logger = logging.getLogger(__name__)

COLLECTION_NAME = "gameGen"


class MongoManager:
    """Manages a single async MongoDB connection."""

    def __init__(self):
        self._client: Optional[AsyncIOMotorClient] = None
        self._db = None

    async def connect(self):
        settings = get_settings()
        try:
            self._client = AsyncIOMotorClient(settings.mongodb_url)
            self._db = self._client[settings.mongodb_db_name]
            # Verify connection
            await self._client.admin.command("ping")
            logger.info("MongoDB connected — db=%s", settings.mongodb_db_name)
        except Exception as exc:
            logger.warning("MongoDB unavailable (%s) — persistence disabled", exc)
            self._client = None
            self._db = None

    async def disconnect(self):
        if self._client:
            self._client.close()
            logger.info("MongoDB disconnected")

    # ── Save a Game Bible ────────────────────────────

    async def save_game_bible(
        self, story: str, end_goal: str, bible_dict: dict
    ) -> Optional[str]:
        """Insert a Game Bible document. Returns the inserted _id as string."""
        if self._db is None:
            return None
        try:
            doc = {
                "story": story,
                "end_goal": end_goal,
                "game_bible": bible_dict,
                "created_at": datetime.now(timezone.utc),
            }
            result = await self._db[COLLECTION_NAME].insert_one(doc)
            doc_id = str(result.inserted_id)
            logger.info("Game Bible saved — id=%s", doc_id)
            return doc_id
        except Exception as exc:
            logger.error("MongoDB insert failed: %s", exc)
            return None

    # ── List all bibles (summary only) ───────────────

    async def get_all_bibles(self) -> list[dict]:
        """Return all stored bibles with summary fields only."""
        if self._db is None:
            return []
        try:
            cursor = self._db[COLLECTION_NAME].find(
                {},
                {
                    "_id": 1,
                    "story": 1,
                    "end_goal": 1,
                    "game_bible.world.title": 1,
                    "game_bible.world.setting": 1,
                    "game_bible.world.tone": 1,
                    "created_at": 1,
                },
            ).sort("created_at", -1)

            results = []
            async for doc in cursor:
                world = doc.get("game_bible", {}).get("world", {})
                results.append({
                    "id": str(doc["_id"]),
                    "title": world.get("title", "Untitled"),
                    "setting": world.get("setting", ""),
                    "tone": world.get("tone", ""),
                    "end_goal": doc.get("end_goal", ""),
                    "created_at": doc.get("created_at", "").isoformat()
                    if doc.get("created_at")
                    else "",
                })
            return results
        except Exception as exc:
            logger.error("MongoDB list failed: %s", exc)
            return []

    # ── Get a single bible by ID ─────────────────────

    async def get_bible_by_id(self, bible_id: str) -> Optional[dict]:
        """Return full Game Bible by _id."""
        if self._db is None:
            return None
        try:
            doc = await self._db[COLLECTION_NAME].find_one(
                {"_id": ObjectId(bible_id)}
            )
            if not doc:
                return None
            doc["_id"] = str(doc["_id"])
            return doc
        except Exception as exc:
            logger.error("MongoDB get failed: %s", exc)
            return None


# Module-level singleton
mongo_manager = MongoManager()
