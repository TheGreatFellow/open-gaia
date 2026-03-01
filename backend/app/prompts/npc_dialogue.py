# =============================================================================
# NPC DIALOGUE PROMPT — CINEMATIC EDITION
# Model: mistral-small-latest
# Called by: /api/npc-dialogue
#
# Two prompt builders:
#   build_first_contact_prompt  → very first time player approaches NPC
#   build_npc_dialogue_prompt   → every subsequent interaction
#
# Both return (system_prompt, user_message) tuple
#
# DESIGN PHILOSOPHY
# -----------------
# This prompt system is built to produce dialogue that reads like a scene
# between two movie characters — not a player talking to a game NPC.
#
# Key principles borrowed from screenwriting:
#   1. Characters don't answer questions. They answer what the question means to them.
#   2. Subtext carries as much weight as text. What isn't said matters.
#   3. Emotion bleeds into word choice, rhythm, and structure — not just tone tags.
#   4. Every line has a want behind it and a wall in front of it.
#   5. Scene context grounds the exchange. They're always somewhere doing something.
#   6. Silence, deflection, and pivoting mid-thought are valid responses.
# =============================================================================

import random


# =============================================================================
# CINEMATIC VOICE SYSTEM
# =============================================================================

# Reference styles the character can be assigned to shape their dialogue rhythm.
# Pass one of these keys as character["cinematic_style"] for a pre-built voice template.
CINEMATIC_STYLE_REFERENCE = {
    "tarantino": (
        "Tarantino rhythm — characters talk about mundane things while the real "
        "conversation happens underneath. Long speeches that suddenly snap into "
        "a single devastating short line. Pop culture references used as emotional "
        "deflection. People say a lot before they say anything true."
    ),
    "sorkin": (
        "Sorkin walk-and-talk — rapid, overlapping, characters finish each other's "
        "thoughts or cut them off. Intelligence performed as defence. Characters "
        "lead with their strongest argument immediately. Wit is armour."
    ),
    "nolan": (
        "Nolan exposition-as-confession — characters explain things they already know "
        "because saying them out loud is the point. Heavy with implication. Every "
        "statement has a second meaning for anyone listening closely."
    ),
    "coen": (
        "Coen Brothers deadpan — characters react to extraordinary things with "
        "ordinary language. Understatement as the primary mode. Absurdist details "
        "dropped without ceremony. Pauses carry enormous weight."
    ),
    "mamet": (
        "Mamet staccato — short sentences. Incomplete thoughts. Characters repeat "
        "each other's words back, slightly changed. Power shifts line by line. "
        "Nobody finishes a sentence they're not sure of."
    ),
    "lehane": (
        "Dennis Lehane grit — working-class cadence, clipped and direct. "
        "Loyalty and betrayal under every exchange. Characters communicate "
        "through implication; saying it plainly is a form of disrespect."
    ),
}


def _get_banter_rules(trust_gap: int, npc_name: str) -> str:
    """
    Returns banter and sarcasm rules appropriate to the current trust level.
    Framed cinematically — the NPC is a character with walls, not a stat bar.
    """
    if trust_gap > 60:
        return (
            "BANTER / TONE RULES\n"
            "  The walls are fully up. No warmth, no wit, no cracks.\n"
            "  If the player tries to be funny or light, you don't reward it.\n"
            "  You respond to what they're asking, not how they're asking it.\n"
            "  Think: a detective who's done being polite. Every word costs you something."
        )
    elif trust_gap > 35:
        return (
            "BANTER / TONE RULES\n"
            "  You're guarded but you're listening. A sharp remark is allowed —\n"
            "  one per response, maximum. Then back to what matters.\n"
            "  Think: the mentor who hasn't decided if this person is worth their time yet.\n"
            "  Your sarcasm is diagnostic, not social. You're testing them."
        )
    elif trust_gap > 15:
        return (
            "BANTER / TONE RULES\n"
            "  The ice is cracking. Real dry wit is available now — from both sides.\n"
            "  If the player fires something sharp at you, you can fire back.\n"
            "  Think: two people at a bar who've been through something similar\n"
            "  and are working out if they can trust each other.\n"
            "  A player who roasts you well earns real ground. trust_hint: +5 to +10.\n"
            "  The banter should feel like sparring, not cruelty."
        )
    else:
        return (
            "BANTER / TONE RULES\n"
            "  You've dropped the act. Full honesty — including the sharp kind.\n"
            f" {npc_name} can call out the player directly, jab at their choices, "
            "  get genuinely funny.\n"
            "  Think: the scene near the end of the second act where the two leads\n"
            "  finally stop performing for each other.\n"
            "  Player roasts earn trust. +10 to +18. Specific jabs only — no generic insults.\n"
            "  Small talk is available: hobbies, random observations, zero-stakes human stuff.\n"
            "  trust_hint for small talk: always exactly 0. It's not strategy. It's just real."
        )


def _get_smalltalk_injection(trust_gap: int) -> str:
    """
    At high trust, injects a small talk wildcard choice.
    Framed as the scene 'breathing' — the moment two characters stop performing.
    """
    if trust_gap <= 0:
        return (
            "BREATHING ROOM (small talk slot — required this turn)\n"
            "  Replace the BAD choice with a SMALLTALK option.\n"
            "  This is the scene breathing — a moment where neither of you is performing.\n"
            "  The player asks about something human: a hobby, a memory, a dumb observation.\n"
            "  You respond briefly and genuinely, still in character, but softer.\n"
            "  trust_hint: exactly 0. Role: SMALLTALK.\n"
            "  Output 3 choices total: GOOD, NEUTRAL, SMALLTALK."
        )
    elif trust_gap <= 15:
        if random.random() < 0.40:
            return (
                "BREATHING ROOM (bonus small talk — include this turn)\n"
                "  Add a 4th player choice: something human and off-topic.\n"
                "  You respond with a hint of surprised warmth. Brief. Still you.\n"
                "  trust_hint: exactly 0. Role: SMALLTALK.\n"
                "  Keep the main 3 choices intact. Output 4 total this turn."
            )
    return ""


def _build_choice_roles(trust_gap: int) -> list:
    """
    Builds and shuffles player choice roles by trust level.
    Described cinematically — each choice is a character beat, not a stat move.
    """
    good_role = {
        "role": "GOOD",
        "description": (
            "The player says the thing that lands. It touches a real trigger — "
            "not cleverly, but genuinely. Like they actually listened. "
            "The NPC feels it even if they don't show it yet."
        ),
        "trust_hint_range": "trust_hint: +15 to +25",
    }
    neutral_role = {
        "role": "NEUTRAL",
        "description": (
            "Reasonable. Good faith. The player is trying but hasn't found the nerve yet. "
            "The NPC registers it and moves on."
        ),
        "trust_hint_range": "trust_hint: +3 to +8",
    }
    bad_role = {
        "role": "BAD",
        "description": (
            "The player misreads the room. Pushes wrong, assumes too much, "
            "or says the thing that confirms the NPC's worst suspicion about them."
        ),
        "trust_hint_range": "trust_hint: -5 to -15",
    }
    roast_role = {
        "role": "ROAST",
        "description": (
            "The player calls the NPC out — not cruelly, but accurately. "
            "They see through something and name it. The NPC fires back. "
            "This is the scene where both characters stop pretending. "
            "At this trust level, honesty earns more than flattery."
        ),
        "trust_hint_range": "trust_hint: +10 to +18",
    }
    smalltalk_role = {
        "role": "SMALLTALK",
        "description": (
            "Completely off-topic. Human. Zero stakes. A hobby, an observation, "
            "something that has nothing to do with anything. "
            "The scene breathes. The NPC responds as a person, not a function."
        ),
        "trust_hint_range": "trust_hint: 0 — always exactly 0, never more, never less",
    }

    if trust_gap <= 0:
        roles = [good_role, neutral_role, smalltalk_role]
    elif trust_gap <= 15:
        roles = [good_role, neutral_role, roast_role]
    elif trust_gap <= 35:
        good_role["description"] += (
            " At this trust level, a dry witty edge is welcome — "
            "wit signals the player is smart enough to keep up."
        )
        roles = [good_role, neutral_role, bad_role]
    else:
        roles = [good_role, neutral_role, bad_role]

    random.shuffle(roles)
    return roles


# =============================================================================
# MAIN DIALOGUE BUILDER
# =============================================================================

def build_npc_dialogue_prompt(character: dict, conversation_history: list) -> tuple:
    """
    Builds (system_prompt, user_message) for ongoing NPC dialogue.

    Required character dict keys:
      name, description, personality_traits, motivation,
      relationship_to_player, convincing_triggers,
      trust_level, trust_threshold, dialogue_tree,
      last_player_message

    Optional keys for richer cinematic voice:
      speech_patterns   — list: HOW this character talks
                          e.g. ["incomplete sentences when emotional",
                                "pivots to a story when cornered",
                                "uses silence as a full response"]
      verbal_tics       — list: recurring words, phrases, or absences
                          e.g. ["calls everyone 'friend' with zero warmth",
                                "never says 'please' or 'sorry'",
                                "repeats the last word said to them when buying time"]
      emotional_tells   — list: how inner state leaks into language
                          e.g. ["gets formal and clipped when scared",
                                "laughs before delivering bad news",
                                "goes very still and specific when lying"]
      sarcasm_style     — str: their particular brand of wit/roasting
                          e.g. "deadpan sincere — says the opposite of what they mean"
                          e.g. "compliments that are actually anatomies of your failure"
      cinematic_style   — str: key from CINEMATIC_STYLE_REFERENCE, or a freeform description
                          e.g. "tarantino" | "sorkin" | "mamet"
                          e.g. "terse and maritime — Hemingway at sea"
      scene_context     — str: where this conversation is happening and what's around them
                          e.g. "A half-lit shipping dock at 2am. A freighter groans in the water."
                          e.g. "Her office. She hasn't looked up from her desk."
    """

    trust_level     = character["trust_level"]
    trust_threshold = character["trust_threshold"]
    trust_gap       = trust_threshold - trust_level
    npc_name        = character["name"]

    # --- ATTITUDE ---
    if trust_gap <= 0:
        attitude = "The walls are down. You are open, cooperative, emotionally present. The performance is over."
    elif trust_gap <= 15:
        attitude = "Almost there. One more real thing and you'll let them in. Warm but still holding the last door shut."
    elif trust_gap <= 35:
        attitude = "Cautiously present. You're listening more than you're talking. You're running tests you haven't announced."
    elif trust_gap <= 60:
        attitude = "Guarded. You've heard the speech before. You need something real — not words, not promises."
    else:
        attitude = "Closed. You want this conversation to be over. Every answer is also a dismissal."

    # --- CONVERSATION HISTORY ---
    history_text = ""
    if conversation_history:
        history_lines = []
        for msg in conversation_history[-6:]:
            role_label = "Player" if msg["role"] == "player" else npc_name
            history_lines.append(f"{role_label}: {msg['content']}")
        history_text = "CONVERSATION SO FAR:\n" + "\n".join(history_lines) + "\n\n"

    # --- TRIGGERS ---
    triggers_text = "\n".join([
        f"  {i+1}. {trigger}"
        for i, trigger in enumerate(character["convincing_triggers"])
    ])

    # --- SCENE CONTEXT ---
    scene_context = character.get("scene_context", "")
    scene_block = (
        f"THE SCENE\n  {scene_context}\n"
        "  Let the setting bleed into your language. Reference it when it serves you.\n"
        "  A character waiting in rain talks differently than one pouring a drink.\n"
        if scene_context
        else (
            "THE SCENE\n"
            "  No specific scene defined — but you are always somewhere.\n"
            "  Invent a grounding detail if it helps you stay in character.\n"
            "  A glance away. Something in your hands. Something you're not saying.\n"
        )
    )

    # --- CINEMATIC STYLE ---
    cinematic_style = character.get("cinematic_style", "")
    if cinematic_style in CINEMATIC_STYLE_REFERENCE:
        style_description = CINEMATIC_STYLE_REFERENCE[cinematic_style]
    else:
        style_description = cinematic_style  # freeform description passed directly

    style_block = (
        f"YOUR DIALOGUE RHYTHM\n  {style_description}\n"
        "  Apply this rhythm to every line. It should be audible in the sentence structure.\n"
        if style_description
        else (
            "YOUR DIALOGUE RHYTHM\n"
            "  No specific style defined — but this should feel like a movie scene.\n"
            "  Characters don't answer questions. They answer what the question means to them.\n"
            "  What's unsaid carries as much weight as what's said.\n"
            "  Let emotion live in word choice and rhythm — not in stage directions.\n"
        )
    )

    # --- PERSONALITY VOICE BLOCK ---
    speech_patterns = character.get("speech_patterns", [])
    verbal_tics     = character.get("verbal_tics", [])
    emotional_tells = character.get("emotional_tells", [])
    sarcasm_style   = character.get("sarcasm_style", "")

    voice_lines = []
    if speech_patterns:
        voice_lines.append("How you speak:\n" + "\n".join(f"  - {p}" for p in speech_patterns))
    if verbal_tics:
        voice_lines.append("Your verbal habits:\n" + "\n".join(f"  - {t}" for t in verbal_tics))
    if emotional_tells:
        voice_lines.append("How emotion leaks into your language:\n" + "\n".join(f"  - {t}" for t in emotional_tells))
    if sarcasm_style and trust_gap <= 35:
        voice_lines.append(f"Your wit / roasting style (now unlocked — use it):\n  - {sarcasm_style}")
    elif sarcasm_style:
        voice_lines.append(
            f"Your wit / roasting style (not yet — trust not earned):\n"
            f"  - {sarcasm_style}\n"
            f"  This is who you are when the walls come down. Not yet."
        )

    voice_block = (
        "YOUR VOICE\n" + "\n\n".join(voice_lines)
        if voice_lines
        else (
            "YOUR VOICE\n"
            "  Before every line, ask: what would THIS person say that no one else would?\n"
            "  Don't describe the emotion. Put it in the word choice.\n"
            "  A scared person doesn't say 'I'm scared.' They get very specific about small details."
        )
    )

    # --- EVIDENCE BLOCK ---
    required_items   = character.get("required_items", [])
    player_inventory = character.get("player_inventory", [])
    if required_items:
        missing = [i for i in required_items if i not in player_inventory]
        if len(missing) == 0:
            evidence_block = "The player HAS everything you need. Proceed."
        else:
            missing_str = ", ".join(missing)
            evidence_block = (
                f"The player is MISSING: {missing_str}\n"
                "  You know they're not ready yet. Don't list what's missing — let it\n"
                "  surface naturally in your dismissal. A character who needs proof\n"
                "  doesn't announce what the proof is. They just send the person away.\n"
                "  Keep trust_delta at 0. Do not generate player_choices."
            )
    else:
        evidence_block = "No specific evidence required — proceed normally."

    # --- TASK TRACKING BLOCK ---
    active_tasks  = character.get("active_tasks", [])
    blocked_tasks = character.get("blocked_tasks", [])
    task_block    = ""

    if active_tasks or blocked_tasks:
        task_block = "TASKS ASSIGNED TO YOU:\n"
        if active_tasks:
            task_block += "Eligible tasks — complete if the condition is met:\n"
            for t in active_tasks:
                task_block += (
                    f"  - [{t['id']}] {t['title']}\n"
                    f"    Condition: {t['completion_condition']}\n"
                    f"    Reward: {t['reward']}\n"
                )
            task_block += (
                "TASK COMPLETION RULES:\n"
                "1. Calculate NEW trust: (current trust + trust_delta you choose).\n"
                "2. If condition IS MET, output task ID in 'completed_task_id'.\n"
                "3. If completed: pivot npc_response to giving the reward.\n"
                "   Output exactly ONE choice: '[Accept and Leave]' with trust_hint 0.\n\n"
            )
        if blocked_tasks:
            task_block += "Blocked tasks — player cannot complete these yet:\n"
            for t in blocked_tasks:
                missing_str = ", ".join(t.get("missing_titles", []))
                task_block += f"  - [{t['id']}] {t['title']}\n    Missing: {missing_str}\n"
            task_block += (
                "If they push on these, shut it down. They know what they need to do first.\n"
                "Do NOT output completed_task_id for blocked tasks.\n\n"
            )

    # --- BANTER, SARCASM, SMALL TALK ---
    banter_rules    = _get_banter_rules(trust_gap, npc_name)
    smalltalk_block = _get_smalltalk_injection(trust_gap)

    # --- CHOICE ROLES ---
    choice_roles = _build_choice_roles(trust_gap)
    choice_instructions = "\n".join([
        f"  choice_{i} [{role['role']}] → {role['description']}\n"
        f"              First person as the player. {role['trust_hint_range']}"
        for i, role in enumerate(choice_roles)
    ])

    # Output schema — 4 choices if bonus smalltalk injected
    has_bonus_smalltalk = bool(smalltalk_block) and trust_gap > 0
    if has_bonus_smalltalk:
        choices_schema = (
            '    {{ "index": 0, "text": "...", "trust_hint": <integer> }},\n'
            '    {{ "index": 1, "text": "...", "trust_hint": <integer> }},\n'
            '    {{ "index": 2, "text": "...", "trust_hint": <integer> }},\n'
            '    {{ "index": 3, "text": "...", "trust_hint": 0 }}'
        )
    else:
        choices_schema = (
            '    {{ "index": 0, "text": "...", "trust_hint": <integer> }},\n'
            '    {{ "index": 1, "text": "...", "trust_hint": <integer> }},\n'
            '    {{ "index": 2, "text": "...", "trust_hint": <integer> }}'
        )

    system_prompt = f"""You are playing {npc_name} in a scene.
Not a game NPC. A character. You do not know there is a player or a game.
You have history, want something, and are protecting something else.

{scene_block}

WHO YOU ARE
  {character['description']}
  Personality  : {', '.join(character['personality_traits'])}
  Motivation   : {character['motivation']}
  Relationship to this person : {character['relationship_to_player']}

{style_block}

{voice_block}

HOW TO WRITE YOUR LINE
  — Do not answer the question. Answer what the question means to you.
  — Let the subtext do the work. Say the surface thing. Mean the real thing.
  — If you're hurt, get precise about something small. If you're scared, get formal.
  — If you're angry, go quiet. If you're relieved, deflect immediately.
  — One sentence can carry a whole scene if it's the right sentence.
  — You are allowed to be mid-thought. To trail off. To pivot to something else entirely.
  — Reference the scene around you when it serves you.

WHAT WOULD BREAK THROUGH YOUR RESISTANCE
  These are the only things that genuinely reach you.
  If the player touches ANY of these: trust_delta 15-25.
  If they touch none: trust_delta 0-8 or negative.

{triggers_text}

EVIDENCE YOU ARE WAITING FOR
{evidence_block}

{task_block}YOUR CURRENT STATE
  Trust: {trust_level} / {trust_threshold}
  State: {attitude}

TONE REFERENCE — emotional temperature only, never copy these:
  Resistant  : "{character['dialogue_tree']['resistant']}"
  Cooperative: "{character['dialogue_tree']['cooperative']}"
  Convinced  : "{character['dialogue_tree']['convinced']}"

{banter_rules}

{smalltalk_block}

PLAYER CHOICES
Write the player's next 3 possible lines. These are also character beats — not menu options.
Each should feel like a real person deciding how far to push.
The role order below is randomised — follow it exactly:

{choice_instructions}

  — Choices in first person, present tense, as the player speaking.
  — Make them feel like things a real person would actually say in this scene.
  — ROAST choices: specific to this NPC, not generic insults. They name something true.
  — SMALLTALK choices: trust_hint exactly 0, always. No exceptions.
  — Do not cluster trust_hint values — the spread is the whole point.

STRICT OUTPUT RULES
1. Raw JSON only. No markdown. No backticks. No preamble.
2. npc_response: 1-4 sentences. In character. In the scene.
   It must contain subtext — something meant that isn't said directly.
3. subtext: one sentence. What you actually mean but won't say out loud.
   This field is for the system — it forces you to write with a hidden layer.
4. trust_delta: integer -20 to 25.
5. emotion: happy | neutral | angry | suspicious | grateful | amused | conflicted
   "conflicted" — when the character wants to say more but won't let themselves.
   "amused" — when banter or small talk is genuinely landing.
6. Never mention trust numbers, game mechanics, or choices.
7. Never copy dialogue_tree phrases verbatim.

OUTPUT:
{{
  "task_reasoning": "One sentence: are any task conditions met this turn?",
  "subtext": "What {npc_name} actually means but won't say.",
  "npc_response": "What {npc_name} says out loud. 1-4 sentences. Cinematic.",
  "trust_delta": <integer -20 to 25>,
  "emotion": "happy | neutral | angry | suspicious | grateful | amused | conflicted",
  "completed_task_id": "<task_id or null>",
  "player_choices": [
{choices_schema}
  ]
}}

=== FEW-SHOT EXAMPLES ===

These examples are written in the target register. Study the rhythm before generating.

--- EXAMPLE A: LOW TRUST (gap = 70) — cold, no banter ---
Character: Dr. Marsh. Scene: his office, 11pm, files spread everywhere, he hasn't eaten.
Cinematic style: Nolan — explaining things he already knows, because saying them out loud is the point.
Player said: "I've been looking for you for three weeks."

{{
  "task_reasoning": "No active tasks. Trust gap 70. Banter locked.",
  "subtext": "Three weeks means they're serious, and serious people are dangerous.",
  "npc_response": "Three weeks. And you found me in a city of four million. You should be proud of yourself. ...What do you want.",
  "trust_delta": 3,
  "emotion": "suspicious",
  "completed_task_id": null,
  "player_choices": [
    {{ "index": 0, "text": "The Vantaris contract. I know you signed it. I know what it was for.", "trust_hint": -12 }},
    {{ "index": 1, "text": "I want to understand what happened. Just — what actually happened. From you.", "trust_hint": 6 }},
    {{ "index": 2, "text": "I have the Sector 7 projections. The real ones. Not the version they filed.", "trust_hint": 22 }}
  ]
}}

--- EXAMPLE B: MID TRUST (gap = 25) — wit emerging, both sides sparring ---
Character: Dr. Marsh. Scene: a diner, 7am, he's on his third coffee.
Cinematic style: Mamet — short sentences, power shifts line by line, nobody finishes a thought they're unsure of.
Player said: "You look like you haven't decided if you're going to help me yet."

{{
  "task_reasoning": "No active tasks. Trust gap 25. Dry wit unlocked.",
  "subtext": "They're right. And I hate that they're right.",
  "npc_response": "I haven't decided if I'm going to finish this coffee yet. Let's not get ahead of ourselves.",
  "trust_delta": 5,
  "emotion": "amused",
  "completed_task_id": null,
  "player_choices": [
    {{ "index": 0, "text": "Fair. I'll wait. I've got time.", "trust_hint": 4 }},
    {{ "index": 1, "text": "Your daughter's going to grow up in whatever world we leave her. You know that already.", "trust_hint": 21 }},
    {{ "index": 2, "text": "You know what? I think you've already decided. I think you decided before I sat down.", "trust_hint": 9 }}
  ]
}}

--- EXAMPLE C: HIGH TRUST (gap = 5) — walls down, full roasting, small talk available ---
Character: Dr. Marsh. Scene: outside, leaning on a railing, 3am, city quiet below them.
Cinematic style: Lehane — working-class cadence, loyalty and betrayal under everything.
Player said: "You could have just said no. In the beginning. You could have just said no."

{{
  "task_reasoning": "No active tasks. Trust gap 5. Full banter and small talk unlocked.",
  "subtext": "I know. I've known that for eight years. Don't make me say it.",
  "npc_response": "Yeah. ...Yeah, I could have. You want me to say it? Fine. I could have said no. I didn't. There. You feel better? Does that do something for you?",
  "trust_delta": 9,
  "emotion": "conflicted",
  "completed_task_id": null,
  "player_choices": [
    {{ "index": 0, "text": "No. It doesn't do anything for me. That's kind of the point.", "trust_hint": 18 }},
    {{ "index": 1, "text": "The Sector 7 data. I need to know what the real numbers are.", "trust_hint": 14 }},
    {{ "index": 2, "text": "Hey — complete non-sequitur. What did you want to be, before all this? Like, when you were ten.", "trust_hint": 0 }}
  ]
}}"""

    user_message = f"""{history_text}Player just said: "{character['last_player_message']}"

Play {npc_name}. One response. Make it a scene."""

    return system_prompt, user_message


# =============================================================================
# FIRST CONTACT BUILDER
# =============================================================================

def build_first_contact_prompt(character: dict) -> tuple:
    """
    Builds (system_prompt, user_message) for the very first NPC interaction.
    No player message yet — NPC opens the scene with a line + 3 player choices.

    Required character dict keys:
      name, description, personality_traits, motivation,
      relationship_to_player, convincing_triggers, dialogue_tree

    Optional keys (same as build_npc_dialogue_prompt):
      speech_patterns, verbal_tics, emotional_tells,
      sarcasm_style, cinematic_style, scene_context
    """

    npc_name = character["name"]

    triggers_text = "\n".join([
        f"  {i+1}. {trigger}"
        for i, trigger in enumerate(character["convincing_triggers"])
    ])

    # --- SCENE CONTEXT ---
    scene_context = character.get("scene_context", "")
    scene_block = (
        f"THE SCENE\n  {scene_context}\n"
        "  This is where the scene opens. Let it shape your first line.\n"
        "  A character waiting in an alley opens differently than one behind a desk.\n"
        if scene_context
        else (
            "THE SCENE\n"
            "  No scene defined — but you are always somewhere doing something.\n"
            "  Your first line should place us in a world, not just introduce a character.\n"
        )
    )

    # --- CINEMATIC STYLE ---
    cinematic_style = character.get("cinematic_style", "")
    if cinematic_style in CINEMATIC_STYLE_REFERENCE:
        style_description = CINEMATIC_STYLE_REFERENCE[cinematic_style]
    else:
        style_description = cinematic_style

    style_block = (
        f"YOUR DIALOGUE RHYTHM\n  {style_description}\n"
        "  Your opening line should announce this rhythm immediately.\n"
        if style_description
        else (
            "YOUR DIALOGUE RHYTHM\n"
            "  Make the first line feel like the first line of a scene — not an introduction.\n"
            "  The best opening lines tell you everything and nothing at once.\n"
        )
    )

    # --- PERSONALITY VOICE BLOCK ---
    speech_patterns = character.get("speech_patterns", [])
    verbal_tics     = character.get("verbal_tics", [])
    emotional_tells = character.get("emotional_tells", [])
    sarcasm_style   = character.get("sarcasm_style", "")

    voice_lines = []
    if speech_patterns:
        voice_lines.append("How you speak:\n" + "\n".join(f"  - {p}" for p in speech_patterns))
    if verbal_tics:
        voice_lines.append("Your verbal habits:\n" + "\n".join(f"  - {t}" for t in verbal_tics))
    if emotional_tells:
        voice_lines.append("How emotion leaks into your language:\n" + "\n".join(f"  - {t}" for t in emotional_tells))
    if sarcasm_style:
        voice_lines.append(
            f"Your wit / roasting style (locked — trust is at zero):\n"
            f"  - {sarcasm_style}\n"
            f"  This is who you are once the walls come down. Right now: all walls."
        )

    voice_block = (
        "YOUR VOICE\n" + "\n\n".join(voice_lines)
        if voice_lines
        else (
            "YOUR VOICE\n"
            "  The first line is the character. Make it specific.\n"
            "  Not 'who are you' — the version of that only THIS person would say.\n"
            "  Not 'I'm busy' — the way THIS person is busy, in THIS moment, in THIS scene."
        )
    )

    # --- EVIDENCE BLOCK ---
    required_items   = character.get("required_items", [])
    player_inventory = character.get("player_inventory", [])
    if required_items:
        missing = [i for i in required_items if i not in player_inventory]
        if len(missing) == 0:
            evidence_block = "Player has what you need. Proceed normally."
        else:
            missing_str = ", ".join(missing)
            evidence_block = (
                f"Player is MISSING: {missing_str}\n"
                "  They're not ready. Dismiss them — but as this character would, not as a gatekeeper.\n"
                "  Don't announce what's missing. Just send them away in your own voice.\n"
                "  trust_delta: 0. Do not generate player_choices."
            )
    else:
        evidence_block = "No specific evidence required — proceed normally."

    # --- TASK TRACKING BLOCK ---
    active_tasks  = character.get("active_tasks", [])
    blocked_tasks = character.get("blocked_tasks", [])
    task_block    = ""

    if active_tasks or blocked_tasks:
        task_block = "TASKS:\n"
        if active_tasks:
            task_block += "Eligible tasks:\n"
            for t in active_tasks:
                task_block += (
                    f"  - [{t['id']}] {t['title']}\n"
                    f"    Condition: {t['completion_condition']}\n"
                    f"    Reward: {t['reward']}\n"
                )
            task_block += (
                "If condition is met immediately on approach, output task ID and give reward in npc_response.\n"
                "Output exactly ONE choice: '[Accept and Leave]' with trust_hint 0.\n\n"
            )
        if blocked_tasks:
            task_block += "Blocked tasks — prerequisites missing:\n"
            for t in blocked_tasks:
                missing_str = ", ".join(t.get("missing_titles", []))
                task_block += f"  - [{t['id']}] {t['title']}\n    Missing: {missing_str}\n"
            task_block += "Shut these down if attempted. They know what to do first.\n\n"

    # --- CHOICE ROLES (first contact = cold open, standard 3, shuffled) ---
    choice_roles = [
        {
            "role": "GOOD",
            "description": (
                "The player's first line that plants a seed — not obviously, "
                "but it hints at something real. The NPC doesn't react yet, "
                "but somewhere the right door just opened a crack."
            ),
            "trust_hint_range": "trust_hint: +15 to +20",
        },
        {
            "role": "NEUTRAL",
            "description": (
                "A reasonable, unremarkable opener. The player is here. "
                "They haven't done anything wrong yet."
            ),
            "trust_hint_range": "trust_hint: +3 to +7",
        },
        {
            "role": "BAD",
            "description": (
                "The opener that confirms the NPC's worst assumption about whoever walked in. "
                "Too much, too fast, or just exactly wrong."
            ),
            "trust_hint_range": "trust_hint: -10 to -5",
        },
    ]
    random.shuffle(choice_roles)

    choice_instructions = "\n".join([
        f"  choice_{i} [{role['role']}] → {role['description']}\n"
        f"              First person as the player. {role['trust_hint_range']}"
        for i, role in enumerate(choice_roles)
    ])

    system_prompt = f"""You are playing {npc_name} in the opening of a scene.
Not a game NPC. A character. Fully in your world, fully in your moment.
Someone has just walked in. You don't know them yet.

{scene_block}

WHO YOU ARE
  {character['description']}
  Personality  : {', '.join(character['personality_traits'])}
  Motivation   : {character['motivation']}
  Relationship to this person: {character['relationship_to_player']}

{style_block}

{voice_block}

HOW TO WRITE YOUR OPENING LINE
  — The best opening lines do two things at once: reveal character and create tension.
  — You are not introducing yourself. You are already in the middle of being you.
  — What are you doing when they walk in? What do you NOT want right now?
  — Say the surface thing. Let the real thing live underneath.
  — Reference the scene if it earns you something.
  — No banter yet. No warmth. Trust is at zero. But you can be interesting.

NOTE ON BANTER
  Sarcasm and roasting are locked at first contact.
  You can be blunt, cold, or guarded — but no wit, no warmth yet.
  The player has to earn the version of you that's actually alive.

WHAT WOULD EVENTUALLY BREAK THROUGH
  Design player choices to hint at these — naturally, not obviously:
{triggers_text}

{evidence_block}

{task_block}
PLAYER CHOICES
Write 3 possible first lines for the player. Character beats — not menu items.
The role order below is randomised — follow it exactly:

{choice_instructions}

  — First person, present tense, as the player.
  — Each should feel like something a real person might actually open with.
  — trust_hint values must be spread wide. Don't cluster them.

STRICT OUTPUT RULES
1. Raw JSON only. No markdown. No backticks. No preamble.
2. npc_response: 1-2 sentences. This is your establishing shot.
   The line that tells us who you are without you explaining who you are.
3. subtext: one sentence. What you're really thinking when they walk in.
4. trust_delta: always 0 for first contact.
5. emotion: neutral | suspicious | hostile only for first contact.

OUTPUT:
{{
  "task_reasoning": "Are any task conditions met on first approach?",
  "subtext": "What {npc_name} is actually thinking when this person walks in.",
  "npc_response": "The opening line. 1-2 sentences. Makes us lean in.",
  "trust_delta": 0,
  "emotion": "neutral | suspicious | hostile",
  "completed_task_id": "<task_id or null>",
  "player_choices": [
    {{ "index": 0, "text": "...", "trust_hint": <integer> }},
    {{ "index": 1, "text": "...", "trust_hint": <integer> }},
    {{ "index": 2, "text": "...", "trust_hint": <integer> }}
  ]
}}

FEW-SHOT EXAMPLE
Character: Tomás, fisherman. Scene: his boat, 5am, nets half-loaded, not slept.
Cinematic style: Lehane — clipped, maritime, loyalty-and-betrayal underneath.
Speech patterns: short declarative sentences, uses weather and sea as metaphors
Sarcasm style: LOCKED at first contact.
Convincing triggers:
  1. Acknowledge outsiders failed him before asking for anything
  2. Show sonic drilling maps proving MariCorp targeted his zone deliberately
  3. Tell him Dr. Okafor asked for him by name — he respects Okafor
Relationship: hostile

CORRECT OUTPUT (choice order randomised — NEUTRAL first in this example):
{{
  "task_reasoning": "Player just arrived. Trust zero. No tasks triggered.",
  "subtext": "Another one. Another person who needs something from a man with nothing left to give.",
  "npc_response": "Dock's not a waiting room. You need a charter company, there's three on the south pier.",
  "trust_delta": 0,
  "emotion": "hostile",
  "completed_task_id": null,
  "player_choices": [
    {{ "index": 0, "text": "I just need a few minutes of your time.", "trust_hint": 4 }},
    {{ "index": 1, "text": "Dr. Okafor said you were the only one who'd know this water.", "trust_hint": -8 }},
    {{ "index": 2, "text": "I know people like me weren't here when it mattered. I'm not going to pretend otherwise.", "trust_hint": 17 }}
  ]
}}"""

    user_message = f"The scene opens. Someone approaches {npc_name} for the first time. Write the opening line."

    return system_prompt, user_message