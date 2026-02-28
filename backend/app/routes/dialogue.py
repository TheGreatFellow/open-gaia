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

    # If player is missing required items, return immediate refusal.
    if request.required_items:
        missing = [
            item for item in request.required_items
            if item not in request.player_inventory
        ]
        if missing:
            missing_str = ", ".join(missing)
            return NPCDialogueResponse(
                npc_response    = f"{request.character_name} glances at you, then looks away. They don't seem ready to talk.",
                trust_delta     = 0,
                new_trust_level = request.trust_level,
                is_convinced    = False,
                emotion         = "neutral",
                player_choices  = [],
                blocked         = True,
                blocked_reason  = f"You need the following before {request.character_name} will engage: {missing_str}",
            )
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
        "required_items":        request.required_items,
        "player_inventory":      request.player_inventory,
        "active_tasks":          request.active_tasks,
        "blocked_tasks":         request.blocked_tasks,
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
    completed_task_id = data.get("completed_task_id")
    
    # Strict Validation: Only allow completion of explicitly active tasks
    is_valid_task = False
    hallucinated_task = False
    if completed_task_id:
        active_ids = [t.get("id") for t in request.active_tasks]
        if completed_task_id in active_ids:
            is_valid_task = True
        else:
            logger.warning(f"LLM hallucinated task completion for blocked or unknown task: {completed_task_id}")
            completed_task_id = None
            hallucinated_task = True
            
            # Identify if it was a blocked task to make the warning more specific
            blocked_task_info = next((t for t in request.blocked_tasks if t.get("id") == data.get("completed_task_id")), None)
            if blocked_task_info:
                missing_str = ", ".join(blocked_task_info.get("missing_titles", []))
                data["npc_response"] = f"Do not waste my time. You cannot help me with '{blocked_task_info.get('title')}' until you have taken care of: {missing_str}."
            else:
                data["npc_response"] = "I am not interested in discussing this further. Please leave."
            
            final_delta = 0
            data["emotion"] = "hostile"

    if is_valid_task:
        player_choices = [
            PlayerChoice(
                index=0,
                text="[Accept Reward and Leave]",
                trust_hint=0
            )
        ]
    elif hallucinated_task:
        player_choices = [
            PlayerChoice(
                index=0,
                text="[Leave]",
                trust_hint=0
            )
        ]
    else:
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
        completed_task_id=completed_task_id,
        player_choices=player_choices,
        blocked=False,
        blocked_reason="",
    )