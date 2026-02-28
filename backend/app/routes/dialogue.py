"""
POST /api/npc-dialogue

Handles live NPC dialogue via Mistral Small.
Frontend sends individual character fields from Zustand.
Uses build_npc_dialogue_prompt / build_first_contact_prompt from npc_dialogue.py.
"""

import json
import logging

from fastapi import APIRouter, HTTPException

from app.models.requests import NPCDialogueRequest
from app.models.responses import NPCDialogueResponse, PlayerChoice
from app.services.mistral_client import chat_complete
from app.prompts.npc_dialogue import build_npc_dialogue_prompt, build_first_contact_prompt

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["NPC Dialogue"])

TRUST_DELTA_MAP = {0: 20, 1: 5, 2: -10}


@router.post("/npc-dialogue", response_model=NPCDialogueResponse)
async def npc_dialogue(request: NPCDialogueRequest):

    # Build character context dict for prompt builder
    character = {
        "name":                  request.character_name,
        "description":           request.description,
        "personality_traits":    request.personality_traits,
        "motivation":            request.motivation,
        "relationship_to_player": request.relationship_to_player,
        "convincing_triggers":   request.convincing_triggers,
        "trust_level":           request.trust_level,
        "trust_threshold":       request.trust_threshold,
        "dialogue_tree":         request.dialogue_tree.model_dump(),
        "last_player_message":   request.player_choice_text,
    }

    # First contact vs ongoing conversation
    is_first_contact = len(request.conversation_history) == 0

    if is_first_contact:
        system_prompt, user_message = build_first_contact_prompt(character)
    else:
        system_prompt, user_message = build_npc_dialogue_prompt(
            character, request.conversation_history
        )

    try:
        raw = await chat_complete(
            model="mistral-small-latest",
            system_prompt=system_prompt,
            user_message=user_message,
            json_mode=True,
            temperature=0.75,
        )
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        logger.error("NPC response parse error: %s", e)
        raise HTTPException(status_code=500, detail=f"NPC response parse error: {e}")
    except Exception as e:
        logger.error("NPC dialogue failed: %s", e)
        raise HTTPException(status_code=500, detail=f"NPC dialogue failed: {e}")

    # Trust calculation
    # First contact always 0 delta
    # Otherwise: use model suggestion, clamped to safe range
    if is_first_contact:
        final_delta = 0
    else:
        base_delta = TRUST_DELTA_MAP.get(request.player_choice_index, 0)
        model_delta = data.get("trust_delta", base_delta)
        final_delta = max(-20, min(25, model_delta))

    new_trust = max(0, min(100, request.trust_level + final_delta))
    is_convinced = new_trust >= request.trust_threshold

    # Parse player choices from model response, with fallback
    raw_choices = data.get("player_choices", [
        {"index": 0, "text": "I understand.", "trust_hint": 10},
        {"index": 1, "text": "Tell me more.", "trust_hint": 5},
        {"index": 2, "text": "Never mind.", "trust_hint": -5},
    ])
    player_choices = [
        PlayerChoice(
            index=opt.get("index", i),
            text=opt.get("text", "..."),
            trust_hint=opt.get("trust_hint", 0),
        )
        for i, opt in enumerate(raw_choices[:3])
    ]

    return NPCDialogueResponse(
        npc_response=data.get("npc_response", "..."),
        trust_delta=final_delta,
        new_trust_level=new_trust,
        is_convinced=is_convinced,
        emotion=data.get("emotion", "neutral"),
        player_choices=player_choices,
    )