"""
POST /api/generate-portrait — single portrait generation
POST /api/generate-tilemap — tile map generation for a location
"""

import logging

from fastapi import APIRouter, HTTPException

from app.models.requests import GeneratePortraitRequest, GenerateTileMapRequest
from app.models.responses import GeneratePortraitResponse, GenerateTileMapResponse
from app.services import portrait_service, mistral_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Asset Generation"])


@router.post("/generate-portrait", response_model=GeneratePortraitResponse)
async def generate_portrait(req: GeneratePortraitRequest):
    try:
        image_url = await portrait_service.generate_image(req.portrait_prompt)
    except Exception as exc:
        logger.error("Portrait generation failed: %s", exc)
        raise HTTPException(
            status_code=502,
            detail="Portrait generation failed",
        )

    if not image_url:
        raise HTTPException(status_code=502, detail="Empty image URL returned")

    return GeneratePortraitResponse(image_url=image_url)


@router.post("/generate-tilemap", response_model=GenerateTileMapResponse)
async def generate_tilemap(req: GenerateTileMapRequest):
    """Generate a Tiled-compatible JSON map for a location."""
    try:
        tile_map = await mistral_client.generate_tile_map(req.tile_map_prompt)
    except Exception as exc:
        logger.error("Tile map generation failed: %s", exc)
        raise HTTPException(
            status_code=502,
            detail="Tile map generation failed",
        )

    return GenerateTileMapResponse(tile_map=tile_map)
