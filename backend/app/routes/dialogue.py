"""
POST /api/npc-dialogue

Handles live NPC dialogue via Mistral Small.
Receives the player's chosen input + character context,
returns the NPC's response and next set of dialogue options.
"""

import logging

from fastapi import APIRouter, HTTPException

from app.models.requests import NPCDialogueRequest
from app.models.responses import NPCDialogueResponse, DialogueOption
from app.services import mistral_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["NPC Dialogue"])


@router.post("/npc-dialogue", response_model=NPCDialogueResponse)
async def npc_dialogue(req: NPCDialogueRequest):
    """
    Expects the frontend to pass the full character object in the request
    body under `character_id`.  The frontend holds the Game Bible in Zustand,
    so it looks up the character and sends the relevant fields.

    For the hackathon, we accept `character_id` and expect the frontend to
    also embed the character data in the `history` context.  A cleaner v2
    would accept the full character object directly.
    """
    # Build a minimal character dict from the request
    # In production, the backend would look this up from cached Game Bible
    character = {
        "id": req.character_id,
        "name": req.character_id,  # frontend should send enriched data
        "archetype": "npc",
        "motivation": "",
        "personality_traits": [],
        "convincing_triggers": [],
    }

    # If history contains a __character_context message, extract it
    for entry in req.history:
        if entry.get("role") == "__character_context":
            character.update(entry.get("content", {}))
            break

    try:
        result = await mistral_client.generate_npc_dialogue(
            character=character,
            player_input=req.player_input,
            trust_level=req.trust_level,
            history=[h for h in req.history if h.get("role") != "__character_context"],
        )
    except Exception as exc:
        logger.error("NPC dialogue generation failed: %s", exc)
        raise HTTPException(status_code=502, detail="Dialogue generation failed")

    # Compute new trust level
    trust_delta = result.get("trust_delta", 0)
    new_trust = max(0, min(100, req.trust_level + trust_delta))

    # Parse options
    raw_options = result.get("options", [])
    options = [
        DialogueOption(
            text=opt.get("text", "..."),
            trust_delta=opt.get("trust_delta", 0),
        )
        for opt in raw_options[:3]
    ]

    # Pad to 3 options if model returned fewer
    while len(options) < 3:
        options.append(DialogueOption(text="...", trust_delta=0))

    return NPCDialogueResponse(
        npc_reply=result.get("npc_reply", "..."),
        emotion=result.get("emotion", "neutral"),
        new_trust_level=new_trust,
        options=options,
        task_unlocked=None,  # frontend checks threshold
    )
