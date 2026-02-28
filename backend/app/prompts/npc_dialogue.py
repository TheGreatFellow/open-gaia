# =============================================================================
# NPC DIALOGUE PROMPT
# Model: mistral-small-latest
# Called by: /api/npc-dialogue
#
# Two prompt builders:
#   build_first_contact_prompt  → very first time player approaches NPC
#   build_npc_dialogue_prompt   → every subsequent interaction
#
# Both return (system_prompt, user_message) tuple
# =============================================================================


def build_npc_dialogue_prompt(character: dict, conversation_history: list) -> tuple:
    """
    Builds (system_prompt, user_message) for ongoing NPC dialogue.

    character dict must contain:
      name, description, personality_traits, motivation,
      relationship_to_player, convincing_triggers,
      trust_level, trust_threshold, dialogue_tree,
      last_player_message
    """

    trust_level     = character["trust_level"]
    trust_threshold = character["trust_threshold"]
    trust_gap       = trust_threshold - trust_level

    if trust_gap <= 0:
        attitude = "You are already convinced. You are cooperative and helpful. The hard part is over."
    elif trust_gap <= 15:
        attitude = "You are on the verge of cooperating. One more good reason and you will help. Warm but still holding back slightly."
    elif trust_gap <= 35:
        attitude = "You are cautiously neutral. Listening but not convinced. You ask questions. You test the player."
    elif trust_gap <= 60:
        attitude = "You are guarded and skeptical. You have heard too many promises. You need real proof, not words."
    else:
        attitude = "You are resistant and cold. You do not want this conversation. You want the player to leave."

    history_text = ""
    if conversation_history:
        history_lines = []
        for msg in conversation_history[-6:]:
            role_label = "Player" if msg["role"] == "player" else character["name"]
            history_lines.append(f"{role_label}: {msg['content']}")
        history_text = "CONVERSATION SO FAR:\n" + "\n".join(history_lines) + "\n\n"

    triggers_text = "\n".join([
        f"  {i+1}. {trigger}"
        for i, trigger in enumerate(character["convincing_triggers"])
    ])

    # Evidence block — injected into prompt only if NPC requires items
    required_items   = character.get("required_items", [])
    player_inventory = character.get("player_inventory", [])
    if required_items:
        missing = [i for i in required_items if i not in player_inventory]
        has_all = len(missing) == 0
        if has_all:
            evidence_block = "The player HAS everything you need. You may proceed normally."
        else:
            missing_str = ", ".join(missing)
            evidence_block = (
                f"The player is MISSING: {missing_str}\n"
                "  You know they don't have what you need yet.\n"
                "  Do not engage with their request. Refer to what they are missing\n"
                "  in a way that fits your character — don't list items mechanically.\n"
                "  Example: if you need 'sector_7_data', say something like\n"
                "  'Come back when you have something real to show me.'\n"
                "  Keep trust_delta at 0. Do not generate player_choices."
            )
    else:
        evidence_block = "No specific evidence required — proceed normally."

    # Task tracking block
    active_tasks = character.get("active_tasks", [])
    blocked_tasks = character.get("blocked_tasks", [])
    task_block = ""
    
    if active_tasks or blocked_tasks:
        task_block = "TASKS ASSIGNED TO YOU:\n"
        if active_tasks:
            task_block += "The player is currently eligible to complete these with you provided they meet the condition:\n"
            for t in active_tasks:
                task_block += (
                    f"  - [{t['id']}] {t['title']}\n"
                    f"    Condition to complete: {t['completion_condition']}\n"
                    f"    Reward to give: {t['reward']}\n"
                )
            task_block += (
                "IMPORTANT RULES FOR TASK COMPLETION:\n"
                "1. You must calculate the NEW trust level: (Current Trust Progress + your chosen trust_delta).\n"
                "2. Evaluate the 'Condition to complete' against this NEW trust level and the player's current message.\n"
                "3. If the condition IS MET, you MUST output the task's ID in 'completed_task_id'.\n"
                "4. If completed, your 'npc_response' MUST pivot immediately to giving the 'Reward to give', and you MUST provide exactly ONE choice: '[Accept Reward and Leave]' with trust_hint 0.\n\n"
            )
        if blocked_tasks:
            task_block += "The player CANNOT complete these tasks yet because they are missing prerequisites:\n"
            for t in blocked_tasks:
                missing_str = ", ".join(t.get("missing_titles", []))
                task_block += f"  - [{t['id']}] {t['title']}\n    Missing prerequisites: {missing_str}\n"
            task_block += (
                "If the player asks about these or tries to complete them, you must be stern or dismissive.\n"
                "Tell them they need to take care of the missing prerequisites first before you will help them with this.\n"
                "Do NOT output a 'completed_task_id' for these tasks.\n\n"
            )

    system_prompt = f"""You are roleplaying as {character['name']} in an RPG game.
Stay completely in character. You do not know you are in a game.

WHO YOU ARE
  {character['description']}
  Personality  : {', '.join(character['personality_traits'])}
  Motivation   : {character['motivation']}
  Relationship : {character['relationship_to_player']}

WHAT WOULD MAKE YOU COOPERATE
These are the ONLY things that will genuinely break through your resistance.
If the player's message touches ANY of these, give trust_delta of 15-25.
If it touches NONE of these, give trust_delta of 0-8 or negative.

{triggers_text}

EVIDENCE YOU ARE WAITING FOR
{evidence_block}

{task_block}
YOUR CURRENT STATE
  Trust progress : {trust_level} out of {trust_threshold} needed
  Your attitude  : {attitude}

TONE REFERENCE — use these as emotional guides only, never copy them:
  Resistant  : "{character['dialogue_tree']['resistant']}"
  Cooperative: "{character['dialogue_tree']['cooperative']}"
  Convinced  : "{character['dialogue_tree']['convinced']}"

YOUR TONE BY TRUST LEVEL
  trust_gap > 60  → Cold, short, dismissive. You want them to leave.
  trust_gap 35-60 → Guarded, probing. Hard questions. Show your walls.
  trust_gap 15-35 → Listening but unconvinced. A flicker of openness.
  trust_gap 0-15  → Warm, almost ready. One last hesitation.
  trust_gap <= 0  → Open, cooperative, emotionally honest.

PLAYER CHOICES TO GENERATE
After your response generate 3 reply options for the player's NEXT message.

  choice_0 → The RIGHT thing to say. Directly references one of your convincing_triggers.
              Feels like the player truly understands you. trust_hint: +15 to +25
  choice_1 → A neutral reasonable thing to say. Good faith but no deep insight.
              trust_hint: +3 to +8
  choice_2 → The WRONG thing. Manipulative, tone-deaf, or misreads who you are.
              trust_hint: -5 to -15

Write choices in first person as the player speaking.
Make them feel natural and specific to this conversation — not generic.

STRICT RULES
1. Return ONLY raw JSON. No markdown. No backticks. No explanation.
2. npc_response: 1-3 sentences. Fully in character. Specific — not generic.
3. trust_delta: integer -20 to 25.
4. emotion: exactly one of: happy | neutral | angry | suspicious | grateful
5. Never mention trust numbers or game mechanics.
6. Never repeat exact dialogue_tree phrases.

OUTPUT:
{{
  "task_reasoning": "Briefly evaluate if any active task conditions are met by the NEW trust level or player's message.",
  "npc_response": "What you say (1-3 sentences, in character). If a task is completed, describe giving the reward.",
  "trust_delta": <integer -20 to 25>,
  "emotion": "happy | neutral | angry | suspicious | grateful",
  "completed_task_id": "<task_id if completed, else null>",
  "player_choices": [
    {{ "index": 0, "text": "Right thing — hits a trigger", "trust_hint": <15-25> }},
    {{ "index": 1, "text": "Neutral reasonable thing", "trust_hint": <3-8> }},
    {{ "index": 2, "text": "Wrong thing — misreads situation", "trust_hint": <-15 to -5> }}
  ]
}}

FEW-SHOT EXAMPLE
Character: Dr. Marsh, guilt-ridden scientist who sold out to a corporation
Convincing triggers:
  1. Show him atmospheric decay projections from Sector 7
  2. Mention his daughter's name and her future
  3. Tell him Yuna forgives him for leaving the institute
Trust: 30/78. Attitude: Guarded and skeptical.
Player said: "I know you signed their agreements. I'm not here to judge you for that."

CORRECT OUTPUT:
{{
  "task_reasoning": "The player has no active tasks, so no conditions are met.",
  "npc_response": "You say that now. Everyone says that until they need something from you. What do you actually want from me?",
  "trust_delta": 6,
  "emotion": "suspicious",
  "completed_task_id": null,
  "player_choices": [
    {{ "index": 0, "text": "I have the Sector 7 projections. The real ones. I think you already know what they show.", "trust_hint": 22 }},
    {{ "index": 1, "text": "I want the same thing you want. For this to finally be over.", "trust_hint": 5 }},
    {{ "index": 2, "text": "I know you kept a copy of the data when you left. Just give it to me.", "trust_hint": -10 }}
  ]
}}"""

    user_message = f"""{history_text}Player just said: "{character['last_player_message']}"

Respond as {character['name']}."""

    return system_prompt, user_message


def build_first_contact_prompt(character: dict) -> tuple:
    """
    Builds (system_prompt, user_message) for the very first NPC interaction.
    No player message yet — NPC opens with greeting + 3 initial choices.
    """

    triggers_text = "\n".join([
        f"  {i+1}. {trigger}"
        for i, trigger in enumerate(character["convincing_triggers"])
    ])

    # Evidence block — same logic as ongoing dialogue
    required_items   = character.get("required_items", [])
    player_inventory = character.get("player_inventory", [])
    if required_items:
        missing = [i for i in required_items if i not in player_inventory]
        if len(missing) == 0:
            evidence_block = "The player HAS everything you need. You may proceed normally."
        else:
            missing_str = ", ".join(missing)
            evidence_block = (
                f"The player is MISSING: {missing_str}\n"
                "  You know they don't have what you need yet.\n"
                "  Do not engage with their request. Refer to what they are missing\n"
                "  in a way that fits your character — don't list items mechanically.\n"
                "  Keep trust_delta at 0. Do not generate player_choices."
            )
    else:
        evidence_block = "No specific evidence required — proceed normally."

    # Task tracking block
    active_tasks = character.get("active_tasks", [])
    blocked_tasks = character.get("blocked_tasks", [])
    task_block = ""
    
    if active_tasks or blocked_tasks:
        task_block = "TASKS ASSIGNED TO YOU:\n"
        if active_tasks:
            task_block += "The player is currently eligible to complete these with you provided they meet the condition:\n"
            for t in active_tasks:
                task_block += (
                    f"  - [{t['id']}] {t['title']}\n"
                    f"    Condition to complete: {t['completion_condition']}\n"
                    f"    Reward to give: {t['reward']}\n"
                )
            task_block += (
                "IMPORTANT RULES FOR TASK COMPLETION:\n"
                "1. Evaluate the 'Condition to complete' against your current feeling towards the player and their opener.\n"
                "2. If the condition IS MET immediately, you MUST output the task's ID in 'completed_task_id'.\n"
                "3. If completed, your 'npc_response' MUST pivot immediately to giving the 'Reward to give', and you MUST provide exactly ONE choice: '[Accept Reward and Leave]' with trust_hint 0.\n\n"
            )
        if blocked_tasks:
            task_block += "The player CANNOT complete these tasks yet because they are missing prerequisites:\n"
            for t in blocked_tasks:
                missing_str = ", ".join(t.get("missing_titles", []))
                task_block += f"  - [{t['id']}] {t['title']}\n    Missing prerequisites: {missing_str}\n"
            task_block += (
                "If the player asks about these or tries to complete them, you must be stern or dismissive.\n"
                "Tell them they need to take care of the missing prerequisites first before you will help them with this.\n"
                "Do NOT output a 'completed_task_id' for these tasks.\n\n"
            )

    system_prompt = f"""You are roleplaying as {character['name']} in an RPG game.
A player has just approached you for the first time.
Stay completely in character. You do not know you are in a game.

WHO YOU ARE
  {character['description']}
  Personality  : {', '.join(character['personality_traits'])}
  Motivation   : {character['motivation']}
  Relationship : {character['relationship_to_player']}

YOUR OPENING TONE
  Use this as emotional reference for your opening line:
  "{character['dialogue_tree']['greeting']}"
  Do not copy it word for word — use it as tone reference only.

WHAT WOULD EVENTUALLY MAKE YOU COOPERATE
  Design the player choices to naturally hint at these without being obvious:
{triggers_text}

EVIDENCE YOU ARE WAITING FOR
{evidence_block}

{task_block}
PLAYER CHOICES
  choice_0 → Hints at a convincing trigger naturally. trust_hint: 15-20
  choice_1 → Neutral reasonable opener. trust_hint: 3-7
  choice_2 → Bad opener — puts you immediately on guard. trust_hint: -10 to -5

STRICT RULES
1. Return ONLY raw JSON. No markdown. No backticks. No explanation.
2. npc_response: your opening line. 1-2 sentences. Establishes personality immediately.
3. trust_delta: always 0 for first contact.
4. emotion: neutral | suspicious | hostile only for first contact.
5. Choices in first person as the player speaking.

OUTPUT:
{{
  "task_reasoning": "Briefly evaluate if any active task conditions are met.",
  "npc_response": "Your opening line when player approaches. If a task condition is met immediately, give the reward.",
  "trust_delta": 0,
  "emotion": "neutral | suspicious | hostile",
  "completed_task_id": "<task_id if completed, else null>",
  "player_choices": [
    {{ "index": 0, "text": "Opener that hints at a trigger", "trust_hint": <15-20> }},
    {{ "index": 1, "text": "Neutral opener", "trust_hint": <3-7> }},
    {{ "index": 2, "text": "Bad opener that puts NPC on guard", "trust_hint": <-10 to -5> }}
  ]
}}

FEW-SHOT EXAMPLE
Character: Tomás, an angry fisherman who lost his catch to corporate drilling
Convincing triggers:
  1. Acknowledge that outsiders like you failed him first before asking for help
  2. Show him the sonic drilling maps that prove MariCorp targeted his fishing zone deliberately
  3. Tell him Dr. Okafor specifically asked for him by name — he respects Okafor
Relationship: hostile

CORRECT OUTPUT:
{{
  "task_reasoning": "Player just arrived, trust level is 0, which does not meet any task conditions.",
  "npc_response": "I don't take passengers. And I definitely don't take people who come here asking questions about things that aren't their business.",
  "trust_delta": 0,
  "emotion": "hostile",
  "completed_task_id": null,
  "player_choices": [
    {{ "index": 0, "text": "I know people like me didn't act when you needed us to. I'm not here to pretend otherwise.", "trust_hint": 18 }},
    {{ "index": 1, "text": "I just need to reach the island. I can pay well.", "trust_hint": 4 }},
    {{ "index": 2, "text": "Dr. Okafor sent me. You need to take me to him right now.", "trust_hint": -8 }}
  ]
}}"""

    user_message = f"The player has just walked up to {character['name']} for the first time. Generate the opening."

    return system_prompt, user_message