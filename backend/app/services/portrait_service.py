from __future__ import annotations

"""
Portrait generation via FLUX through the Mistral Agents API.
"""

import asyncio
import logging
from typing import Optional

from mistralai import Mistral

from app.config import get_settings

logger = logging.getLogger(__name__)

_client: Optional[Mistral] = None


def _get_client() -> Mistral:
    global _client
    if _client is None:
        settings = get_settings()
        _client = Mistral(api_key=settings.mistral_api_key)
    return _client


async def generate_portrait(prompt: str) -> str:
    """
    Generate a single character portrait using FLUX via Mistral's image
    generation API.  Returns the image URL.
    """
    client = _get_client()

    response = await client.images.generate_async(
        model="flux-pro",
        prompt=prompt,
        width=512,
        height=512,
        num_images=1,
    )

    image_url = response.data[0].url
    logger.info("Portrait generated: %s…", image_url[:80])
    return image_url


async def generate_portraits_batch(
    characters: list[dict],
) -> dict[str, str]:
    """
    Fan-out portrait generation for all characters in parallel.
    Returns { character_id: image_url }.
    """
    async def _gen(char: dict) -> tuple[str, str]:
        try:
            url = await generate_portrait(char["portrait_prompt"])
            return char["id"], url
        except Exception as exc:
            logger.warning(
                "Portrait generation failed for %s: %s", char["id"], exc
            )
            # Return a placeholder so the game can still run
            return char["id"], ""

    results = await asyncio.gather(*[_gen(c) for c in characters])
    return dict(results)
