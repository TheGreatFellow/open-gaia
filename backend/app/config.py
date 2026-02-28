"""
Centralised configuration — reads from .env file via pydantic-settings.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── Mistral AI ───────────────────────────────────
    mistral_api_key: str = ""

    # ── Redis ────────────────────────────────────────
    redis_url: str = "redis://localhost:6379/0"

    # ── Server ───────────────────────────────────────
    port: int = 8000
    frontend_origin: str = "http://localhost:5173"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()
