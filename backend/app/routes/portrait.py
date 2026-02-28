"""
POST /api/generate-portrait

Generate a single character portrait via FLUX.
Also used internally by /api/generate-world for batch generation.
"""

import logging

from fastapi import APIRouter, HTTPException

from app.models.requests import GeneratePortraitRequest
from app.models.responses import GeneratePortraitResponse
from app.services import portrait_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Portrait Generation"])


@router.post("/generate-portrait", response_model=GeneratePortraitResponse)
async def generate_portrait(req: GeneratePortraitRequest):
    try:
        image_url = await portrait_service.generate_portrait(req.portrait_prompt)
    except Exception as exc:
        logger.error("Portrait generation failed: %s", exc)
        raise HTTPException(
            status_code=502,
            detail="Portrait generation failed",
        )

    if not image_url:
        raise HTTPException(status_code=502, detail="Empty image URL returned")

    return GeneratePortraitResponse(image_url=image_url)
