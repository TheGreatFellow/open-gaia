from __future__ import annotations

"""
Portrait and sprite generation via FLUX through the Mistral Agents API.
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


async def generate_image(prompt: str) -> str:
    """
    Generate a single image using FLUX via Mistral's image
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
    logger.info("Image generated: %s…", image_url[:80])
    return image_url


async def _batch_generate(
    characters: list[dict],
    prompt_field: str,
) -> dict[str, str]:
    """
    Fan-out image generation for all characters in parallel.
    Returns { character_id: image_url }.

    prompt_field: which field on the character to use as the FLUX prompt
                  (either "portrait_prompt" or "sprite_prompt")
    """
    async def _gen(char: dict) -> tuple[str, str]:
        prompt = char.get(prompt_field, "")
        if not prompt:
            return char["id"], ""
        try:
            url = await generate_image(prompt)
            return char["id"], url
        except Exception as exc:
            logger.warning(
                "Image generation failed for %s (%s): %s",
                char["id"], prompt_field, exc,
            )
            return char["id"], ""

    results = await asyncio.gather(*[_gen(c) for c in characters])
    return dict(results)
