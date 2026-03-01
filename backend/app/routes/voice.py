# =============================================================================
# voice.py
# POST /api/npc-voice — streams ElevenLabs TTS audio for an NPC line.
#
# Usage: After /api/npc-dialogue returns npc_response + emotion,
# the client posts those values here to get streamed mp3 audio.
# =============================================================================

import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.services.voice_service import stream_npc_voice

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["NPC Voice"])


class VoiceRequest(BaseModel):
    npc_id:  str   # Must match a key in NPC_VOICE_REGISTRY (e.g. "dr_marsh")
    text:    str   # The NPC's dialogue line (npc_response from dialogue endpoint)
    emotion: str   # Emotion string from dialogue response (e.g. "angry")


@router.post("/npc-voice")
async def npc_voice(request: VoiceRequest):
    """
    Streams ElevenLabs TTS audio for an NPC line.

    The client should call this endpoint immediately after receiving the
    dialogue response from /api/npc-dialogue, passing the npc_response
    text and emotion directly through.

    Returns a streaming mp3 response that can be piped into Web Audio API.
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="text cannot be empty")

    try:
        audio_stream = stream_npc_voice(
            npc_id=request.npc_id,
            text=request.text,
            emotion=request.emotion,
        )
        return StreamingResponse(
            audio_stream,
            media_type="audio/mpeg",
            headers={
                "X-Content-Type-Options": "nosniff",
                "Cache-Control": "no-cache",
            },
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    except EnvironmentError as e:
        raise HTTPException(status_code=500, detail=str(e))

    except Exception as e:
        logger.error("ElevenLabs TTS error: %s", e)
        raise HTTPException(status_code=502, detail=f"ElevenLabs error: {str(e)}")
