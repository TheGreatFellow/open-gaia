"""
Centralised configuration — reads from .env file via pydantic-settings.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    # ── Mistral AI ───────────────────────────────────
    mistral_api_key: str = os.getenv("MISTRAL_API_KEY")

    # ── Redis ────────────────────────────────────────
    redis_url: str = os.getenv("REDIS_URL")

    # ── MongoDB ─────────────────────────────────────
    mongodb_url: str = os.getenv("MONGODB_URL")
    mongodb_db_name: str = os.getenv("MONGODB_DB_NAME")
    # ── ElevenLabs TTS ──────────────────────────────
    elevenlabs_api_key: str = os.getenv("ELEVENLABS_API_KEY", "")

    # ── Server ───────────────────────────────────────
    port: int = os.getenv("PORT")
    frontend_origin: str = os.getenv("FRONTEND_ORIGIN")

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()
