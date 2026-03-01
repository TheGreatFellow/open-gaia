# =============================================================================
# voice_service.py
# Handles all ElevenLabs TTS logic.
# Called by /api/npc-voice endpoint in routes/voice.py
# =============================================================================

import logging
from typing import AsyncGenerator

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# EMOTION → VOICE SETTINGS
# Each emotion maps to ElevenLabs voice_settings parameters.
#
#   stability        low = more expressive/varied, high = consistent/flat
#   similarity_boost how closely it sticks to the original voice clone
#   style            low = neutral, high = dramatic/exaggerated
#   speed            0.7 = slow and heavy, 1.2 = fast and clipped
# ---------------------------------------------------------------------------

EMOTION_VOICE_SETTINGS: dict[str, dict] = {
    "angry": {
        "stability": 0.25,
        "similarity_boost": 0.75,
        "style": 0.80,
        "speed": 1.30,
    },
    "hostile": {
        "stability": 0.20,
        "similarity_boost": 0.75,
        "style": 0.90,
        "speed": 1.35,
    },
    "suspicious": {
        "stability": 0.45,
        "similarity_boost": 0.80,
        "style": 0.40,
        "speed": 1.05,
    },
    "neutral": {
        "stability": 0.65,
        "similarity_boost": 0.80,
        "style": 0.15,
        "speed": 1.15,
    },
    "happy": {
        "stability": 0.55,
        "similarity_boost": 0.75,
        "style": 0.55,
        "speed": 1.25,
    },
    "grateful": {
        "stability": 0.60,
        "similarity_boost": 0.80,
        "style": 0.35,
        "speed": 1.08,
    },
    "amused": {
        "stability": 0.40,
        "similarity_boost": 0.75,
        "style": 0.65,
        "speed": 1.20,
    },
    "conflicted": {
        "stability": 0.35,
        "similarity_boost": 0.80,
        "style": 0.50,
        "speed": 1.00,
    },
    "sad": {
        "stability": 0.55,
        "similarity_boost": 0.80,
        "style": 0.30,
        "speed": 0.95,
    },
}

DEFAULT_VOICE_SETTINGS = EMOTION_VOICE_SETTINGS["neutral"]

# ---------------------------------------------------------------------------
# NPC VOICE REGISTRY
# voice_id  → copy from ElevenLabs "My Voices" page
# model     → "eleven_turbo_v2" is fastest (lowest latency)
#             "eleven_multilingual_v2" for non-English support
# ---------------------------------------------------------------------------

NPC_VOICE_REGISTRY: dict[str, dict] = {
    "man": {
        "voice_id": "YOq2y2Up4RgXP2HyXjE5",
        "model":    "eleven_v3",
    },
    "women": {
        "voice_id": "flHkNRp1BlvT73UL6gyz",
        "model":    "eleven_v3",
    },
    # Add more NPCs:
    # "npc_key": {"voice_id": "...", "model": "eleven_turbo_v2"},
}


def get_voice_settings(emotion: str) -> dict:
    """Returns ElevenLabs voice_settings for a given emotion string."""
    return EMOTION_VOICE_SETTINGS.get(emotion.lower(), DEFAULT_VOICE_SETTINGS)


async def stream_npc_voice(
    npc_id: str,
    text: str,
    emotion: str,
) -> AsyncGenerator[bytes, None]:
    """
    Streams TTS audio from ElevenLabs for a given NPC, text, and emotion.

    Yields raw mp3 bytes as they arrive — the FastAPI endpoint forwards
    these directly so playback can start immediately.

    Raises:
        ValueError:  if npc_id is not in NPC_VOICE_REGISTRY
        EnvironmentError: if ELEVENLABS_API_KEY is not set
        httpx.HTTPStatusError: if ElevenLabs returns an error
    """
    if npc_id not in NPC_VOICE_REGISTRY:
        raise ValueError(f"NPC '{npc_id}' not found in NPC_VOICE_REGISTRY")

    npc_config     = NPC_VOICE_REGISTRY[npc_id]
    voice_id       = npc_config["voice_id"]
    model_id       = npc_config.get("model", "eleven_turbo_v2")
    voice_settings = get_voice_settings(emotion)

    settings = get_settings()
    api_key  = settings.elevenlabs_api_key
    if not api_key:
        raise EnvironmentError("ELEVENLABS_API_KEY environment variable not set")

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream"

    headers = {
        "xi-api-key":   api_key,
        "Content-Type": "application/json",
        "Accept":       "audio/mpeg",
    }

    payload = {
        "text":           text,
        "model_id":       model_id,
        "voice_settings": voice_settings,
    }

    logger.info("Streaming TTS for npc=%s emotion=%s len=%d", npc_id, emotion, len(text))

    async with httpx.AsyncClient(timeout=30.0) as client:
        async with client.stream("POST", url, headers=headers, json=payload) as response:
            response.raise_for_status()
            async for chunk in response.aiter_bytes(chunk_size=4096):
                if chunk:
                    yield chunk


# ---------------------------------------------------------------------------
# CHARACTER DESCRIPTION → VOICE TYPE DETECTION
# Simple keyword matching to classify a character as "man" or "women"
# based on their description text.
# ---------------------------------------------------------------------------

_FEMALE_KEYWORDS = {
    "woman", "women", "female", "girl", "lady", "she", "her",
    "mother", "sister", "daughter", "queen", "princess", "priestess",
    "mrs", "ms", "miss", "grandmother", "aunt", "wife", "maiden",
}

_MALE_KEYWORDS = {
    "man", "male", "boy", "he", "him", "his",
    "father", "brother", "son", "king", "prince", "priest",
    "mr", "sir", "grandfather", "uncle", "husband",
}


def detect_voice_type(description: str) -> str:
    """
    Detects whether a character should use a 'man' or 'women' voice
    based on keywords in the character description.

    Returns 'man' or 'women' (matching NPC_VOICE_REGISTRY keys).
    Defaults to 'man' if no clear signal is found.
    """
    desc_lower = description.lower()
    words = set(desc_lower.split())

    female_score = len(words & _FEMALE_KEYWORDS)
    male_score = len(words & _MALE_KEYWORDS)

    if female_score > male_score:
        return "women"
    return "man"


async def generate_npc_audio(
    description: str,
    text: str,
    emotion: str,
) -> bytes:
    """
    Generates TTS audio for an NPC line, auto-detecting voice type
    from the character description.

    Returns the complete mp3 audio as bytes (for base64 encoding).

    Args:
        description: Character description text (used to detect voice type)
        text:        The NPC's dialogue line to synthesise
        emotion:     Emotion string from the LLM response (e.g. "angry")

    Returns:
        Raw mp3 audio bytes
    """
    voice_type = detect_voice_type(description)
    logger.info("Auto-detected voice_type=%s for description snippet: %.60s...", voice_type, description)

    chunks: list[bytes] = []
    async for chunk in stream_npc_voice(
        npc_id=voice_type,
        text=text,
        emotion=emotion,
    ):
        chunks.append(chunk)

    return b"".join(chunks)
