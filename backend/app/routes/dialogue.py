"""
POST /api/npc-dialogue

Handles live NPC dialogue via Mistral Small.
Frontend sends the full character object from the Game Bible in Zustand.
Uses build_npc_system_prompt() for dynamic, trust-aware prompting.
"""

import logging

from fastapi import APIRouter, HTTPException

from app.models.requests import NPCDialogueRequest
from app.models.responses import NPCDialogueResponse
from app.services import mistral_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["NPC Dialogue"])


@router.post("/npc-dialogue", response_model=NPCDialogueResponse)
async def npc_dialogue(req: NPCDialogueRequest):
    """
    The frontend sends the full character object (from Game Bible in Zustand)
    along with the player's input and current trust level.
    """
    try:
        result = await mistral_client.generate_npc_dialogue(
            character=req.character,
            player_input=req.player_input,
            trust_level=req.trust_level,
            history=req.history,
        )
    except Exception as exc:
        logger.error("NPC dialogue generation failed: %s", exc)
        raise HTTPException(status_code=502, detail="Dialogue generation failed")

    # Extract trust delta and compute new trust level
    trust_delta = result.get("trust_delta", 0)
    new_trust = max(0, min(100, req.trust_level + trust_delta))

    return NPCDialogueResponse(
        npc_response=result.get("npc_response", "..."),
        emotion=result.get("emotion", "neutral"),
        trust_delta=trust_delta,
        new_trust_level=new_trust,
        task_unlocked=None,  # frontend checks threshold against Game Bible
    )
