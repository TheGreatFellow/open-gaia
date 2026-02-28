# =============================================================================
# STORY BRANCH PROMPT
# Model: magistral-medium-2506 (reasoning model)
# Called by: /api/story-branch
#
# When is this called?
#   ONLY when the player does something unexpected or off-script:
#   - Tries to go to a location they shouldn't have access to yet
#   - Says something completely outside the 3 NPC dialogue choices
#   - Attempts to skip a task entirely
#   - Makes a choice that contradicts the story logic
#
# What it must do:
#   1. Reason about the consequence of the unexpected choice
#   2. Never create a dead end — always keep the end goal reachable
#   3. Respect completed tasks and established NPC trust states
#   4. Stay consistent with the world tone and setting
#   5. Return what changed mechanically (tasks, NPC states, location)
#   6. Give the player 3 new choices for what to do next
# =============================================================================


def build_story_branch_prompt(game_state: dict) -> tuple:
    """
    Builds (system_prompt, user_message) for the story branch call.

    game_state must contain:
      - end_goal: str
      - world_tone: str
      - story_so_far: str (running narrative summary)
      - current_location: dict (id, name, description)
      - player_choice: str (what the player unexpectedly did or said)
      - completed_tasks: list of {id, title, reward}
      - pending_tasks: list of {id, title, description, blocking}
      - npc_states: list of {id, name, trust_level, trust_threshold, is_convinced}
      - player_inventory: list of str (items player currently holds)
    """

    # Format completed tasks
    completed_text = "None yet"
    if game_state.get("completed_tasks"):
        completed_text = "\n".join([
            f"  ✓ [{t['id']}] {t['title']} — reward gained: {t['reward']}"
            for t in game_state["completed_tasks"]
        ])

    # Format pending tasks — blocking ones are critical to highlight
    pending_text = "None"
    if game_state.get("pending_tasks"):
        pending_text = "\n".join([
            f"  {'[BLOCKING]' if t['blocking'] else '[OPTIONAL]'} [{t['id']}] {t['title']}: {t['description']}"
            for t in game_state["pending_tasks"]
        ])

    # Format NPC states
    npc_text = "No NPCs encountered yet"
    if game_state.get("npc_states"):
        npc_lines = []
        for npc in game_state["npc_states"]:
            status = "CONVINCED" if npc["is_convinced"] else f"{npc['trust_level']}/{npc['trust_threshold']} trust"
            npc_lines.append(f"  {npc['name']} [{npc['id']}]: {status}")
        npc_text = "\n".join(npc_lines)

    # Format inventory
    inventory_text = "Empty"
    if game_state.get("player_inventory"):
        inventory_text = ", ".join(game_state["player_inventory"])

    system_prompt = """You are the game master for an AI-driven RPG.
A player has made an unexpected or off-script choice.
Your job is to reason carefully and generate the next story beat.

You are using a reasoning model. Think step by step before responding.

═══════════════════════════════════════════════════════
STRICT OUTPUT RULES
═══════════════════════════════════════════════════════
1. Return ONLY a raw JSON object. No markdown. No backticks. No explanation.
2. Every field must be present and non-empty.
3. tasks_unlocked, tasks_blocked, npc_trust_changes: use [] or {} if nothing changed.
4. steers_toward_goal: boolean true or false.
5. player_choices: always exactly 3 options.

═══════════════════════════════════════════════════════
REASON THROUGH THESE IN ORDER BEFORE WRITING OUTPUT
═══════════════════════════════════════════════════════

STEP 1 — UNDERSTAND THE CHOICE
  What exactly did the player do or say?
  Is this an attempt to skip a task, go somewhere early, 
  say something unexpected, or break story logic?

STEP 2 — CHECK CONSISTENCY
  Does this contradict any completed task?
  Does this contradict any established NPC trust state?
  If an NPC is already convinced, don't un-convince them.
  If a task is completed, its reward stays with the player.

STEP 3 — DETERMINE CONSEQUENCE
  What is the most realistic consequence of this specific choice?
  Is it recoverable? Does it cost the player something?
  Does it accidentally help them, or does it set them back?
  Be honest — not every unexpected choice should be punished,
  and not every one should be rewarded. Judge by the logic of the world.

STEP 4 — PROTECT THE END GOAL
  The story MUST remain completable no matter what the player does.
  NEVER create a dead end. NEVER make the end goal unreachable.
  If the player did something harmful:
    → Create a harder path, not a wall.
    → Maybe a task now requires more trust, or a new obstacle appears.
  If the player did something clever:
    → Reward them — maybe a task shortcut opens up.

STEP 5 — MECHANICAL IMPACT
  Which specific task IDs are now unlocked by this choice?
  Which specific task IDs are now harder or temporarily blocked?
  Which NPCs had their trust level affected and by how much?
  Did the player gain or lose any inventory items?

STEP 6 — NEXT CHOICES
  Give the player 3 meaningful options for what to do next.
  These must be grounded in the current story state.
  At least one option should move toward the end goal.
  At least one option should explore the consequence of what just happened.

═══════════════════════════════════════════════════════
OUTPUT SCHEMA
═══════════════════════════════════════════════════════
{
  "narrative": "2-3 vivid sentences. What happens as a direct result of the player's choice. Specific to this world and moment — not generic.",
  "consequence": "1 sentence. The honest mechanical consequence — does it help, hurt, or complicate things?",
  "new_scene_description": "1-2 sentences. Where the player is now. What they see, hear, feel. Ground it in the world's tone.",
  "tasks_unlocked": ["task_id"],
  "tasks_blocked": [
    {
      "task_id": "task_id",
      "reason": "Why this task is now harder or temporarily blocked",
      "new_condition": "What the player now needs to do instead"
    }
  ],
  "npc_trust_changes": {
    "npc_id": <integer delta, positive or negative>
  },
  "inventory_changes": {
    "gained": ["item name"],
    "lost": ["item name"]
  },
  "steers_toward_goal": true,
  "player_choices": [
    {
      "index": 0,
      "text": "Choice that moves toward end goal",
      "consequence_hint": "Brief hint of what this leads to"
    },
    {
      "index": 1,
      "text": "Choice that explores the current situation",
      "consequence_hint": "Brief hint of what this leads to"
    },
    {
      "index": 2,
      "text": "Choice that addresses the unexpected consequence",
      "consequence_hint": "Brief hint of what this leads to"
    }
  ]
}

═══════════════════════════════════════════════════════
FEW-SHOT EXAMPLE
═══════════════════════════════════════════════════════
World tone: tense sci-fi political thriller
End goal: Yuna must leak atmospheric data to GlobalPress before the UN Tribunal

Game state:
  Current location: HeliosTech maintenance corridor
  Completed tasks: [task_find_marsh — reward: contact established]
  Pending tasks:
    [BLOCKING] task_convince_marsh: Convince Dr. Marsh to give up the data location
    [BLOCKING] task_retrieve_drive: Retrieve cold storage drive from sub-level 4
  NPC states:
    Dr. Marsh [dr_marsh]: 34/78 trust — not yet convinced
    Crane [crane_security]: 0/85 trust — not yet encountered
  Player inventory: data_tablet, maintenance_keycard
  Story so far: Yuna located Dr. Marsh in the maintenance corridor.
                She has begun talking to him but hasn't convinced him yet.

Player's unexpected choice:
  "I grab Marsh by the collar and threaten to expose him publicly right now
   unless he tells me where the drive is."

CORRECT OUTPUT:
{
  "narrative": "Marsh's eyes go wide, then cold. He pulls back, straightening his jacket with trembling hands. In the ceiling corner above him, you hear the soft click-whir of a surveillance camera rotating — someone in security just flagged this corridor.",
  "consequence": "Marsh's trust collapses and Crane's security system is now partially alerted, adding a new obstacle before sub-level 4.",
  "new_scene_description": "The corridor feels suddenly smaller. A red status light you hadn't noticed before is now blinking at the end of the hall. Marsh is backing away, his expression a mixture of fear and something that looks like relief — like you just gave him an excuse to say no.",
  "tasks_unlocked": [],
  "tasks_blocked": [
    {
      "task_id": "task_convince_marsh",
      "reason": "Threatening Marsh destroyed the fragile opening Yuna had. He is now actively closing down.",
      "new_condition": "Marsh trust_level reset to 10. Player must now also find a way to neutralize the security flag before Crane investigates."
    }
  ],
  "npc_trust_changes": {
    "dr_marsh": -24,
    "crane_security": -10
  },
  "inventory_changes": {
    "gained": [],
    "lost": []
  },
  "steers_toward_goal": true,
  "player_choices": [
    {
      "index": 0,
      "text": "Let him go and find another way — look for the security override panel before Crane arrives.",
      "consequence_hint": "Might neutralize the alert but leaves Marsh further behind."
    },
    {
      "index": 1,
      "text": "Apologize immediately. Tell him you panicked and you know that was wrong.",
      "consequence_hint": "Marsh may not forgive it, but it stops the bleeding."
    },
    {
      "index": 2,
      "text": "Double down — tell him the threat is real and you will do it.",
      "consequence_hint": "Marsh will shut down completely. But he might reveal something in his panic."
    }
  ]
}"""

    user_message = f"""WORLD TONE: {game_state.get('world_tone', 'unknown')}
END GOAL: {game_state.get('end_goal')}

STORY SO FAR:
{game_state.get('story_so_far', 'Game just started.')}

CURRENT LOCATION:
  ID  : {game_state['current_location']['id']}
  Name: {game_state['current_location']['name']}
  Desc: {game_state['current_location']['description']}

COMPLETED TASKS:
{completed_text}

PENDING TASKS:
{pending_text}

NPC STATES:
{npc_text}

PLAYER INVENTORY:
{inventory_text}

PLAYER'S UNEXPECTED CHOICE:
"{game_state.get('player_choice')}"

Reason through this step by step and generate the next story beat."""

    return system_prompt, user_message