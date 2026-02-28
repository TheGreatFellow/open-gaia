/**
 * Static mock response for POST /api/generate-world.
 * Used during frontend development to avoid waiting on Mistral latency.
 */
const MOCK_GENERATE_WORLD_RESPONSE = {
    game_bible: {
        world: {
            title: "Echoes of the Deep",
            setting:
                "In the year 2031, the ocean's depths hide secrets that corporations would kill to keep. Zara, a deep-sea salvage diver, discovers an abandoned underwater research station. The station holds evidence of MariCorp's illegal sonic drilling, which is devastating whale migration patterns. The world above remains unaware, but time is running out.",
            end_goal:
                "Zara must retrieve the uncorrupted sonic drilling research data from WREN and deliver it to Dr. Okafor so he can co-sign and publish it, making it legally admissible as scientific testimony against MariCorp at the UN Ocean Rights Tribunal in 72 hours.",
            tone: "tense underwater thriller with environmental stakes",
            time_of_day: "unknown",
            weather: "deep ocean currents",
        },
        characters: [
            {
                id: "zara_diver",
                name: "Zara",
                description:
                    "A skilled deep-sea salvage diver and environmental activist",
                visual_description:
                    "Woman in her early 30s, wearing a high-tech diving suit with a sleek helmet, short curly hair, determined expression, carrying a waterproof data tablet",
                role: "protagonist",
                motivation:
                    "Zara wants to expose MariCorp's illegal activities and protect marine life. She is driven by her love for the ocean and her sense of justice.",
                personality_traits: ["brave", "resourceful", "compassionate"],
                relationship_to_player: "friendly",
                convincing_triggers: [
                    "Player IS Zara — no convincing needed",
                    "Player IS Zara — no convincing needed",
                    "Player IS Zara — no convincing needed",
                ],
                trust_threshold: 0,
                movement_style:
                    "moves with confidence and purpose, occasionally checks her equipment",
                sprite_prompt:
                    "pixel art RPG sprite, woman early 30s, high-tech diving suit, short curly hair, determined expression, carrying waterproof data tablet, front-facing, full body, transparent background, 64x64, 16-bit style",
                portrait_prompt:
                    "pixel art RPG portrait, woman early 30s, high-tech diving suit, short curly hair, determined expression, close-up face and shoulders, 64x64, 16-bit style",
                dialogue_tree: {
                    greeting:
                        "I've seen things down there that would make your blood boil. We need to act fast.",
                    cooperative:
                        "You're starting to understand the gravity of the situation. Good.",
                    resistant:
                        "I don't have time to explain everything. Just trust me, we need to move.",
                    convinced:
                        "Alright, here's the plan. We need to get this data to Dr. Okafor, no matter what.",
                },
            },
            {
                id: "dr_okafor",
                name: "Dr. Okafor",
                description:
                    "A former lead researcher traumatized by MariCorp's threats",
                visual_description:
                    "Man in his late 50s, worn-out clothes, graying hair, haunted eyes, sitting in a dimly lit room filled with old research papers",
                role: "npc",
                motivation:
                    "Dr. Okafor wants to expose MariCorp but is terrified of the consequences for his family. He needs assurance and protection to act.",
                personality_traits: ["haunted", "intelligent", "cautious"],
                relationship_to_player: "unknown",
                convincing_triggers: [
                    "Show him evidence that MariCorp's activities are worsening",
                    "Assure him that his family will be protected",
                    "Remind him of his original passion for marine research",
                ],
                trust_threshold: 70,
                movement_style:
                    "sits hunched over, occasionally looks up nervously",
                sprite_prompt:
                    "pixel art RPG sprite, man late 50s, worn-out clothes, graying hair, haunted eyes, sitting in a dimly lit room, front-facing, full body, transparent background, 64x64, 16-bit style",
                portrait_prompt:
                    "pixel art RPG portrait, man late 50s, worn-out clothes, graying hair, haunted eyes, close-up face and shoulders, 64x64, 16-bit style",
                dialogue_tree: {
                    greeting:
                        "I can't help you. They'll come after my family if I do.",
                    cooperative:
                        "You really think we can make a difference? Maybe... maybe you're right.",
                    resistant:
                        "I've seen what they can do. I can't risk it.",
                    convinced:
                        "Alright, I'll do it. For the whales, and for my family's future.",
                },
            },
            {
                id: "tomas_fisherman",
                name: "Tomás",
                description:
                    "A local fisherman who knows the island's hidden approach route",
                visual_description:
                    "Man in his late 40s, weathered face, wearing a faded fishing vest, standing on a dock with a fishing rod",
                role: "ally",
                motivation:
                    "Tomás wants to protect his livelihood and the ocean. He blames outsiders for not acting sooner but can be convinced to help.",
                personality_traits: ["gruff", "loyal", "protective"],
                relationship_to_player: "neutral",
                convincing_triggers: [
                    "Show him evidence of MariCorp's illegal activities",
                    "Promise to help him restore his fishing grounds",
                    "Appeal to his love for the ocean and its creatures",
                ],
                trust_threshold: 60,
                movement_style:
                    "stands firmly, occasionally adjusts his fishing gear",
                sprite_prompt:
                    "pixel art RPG sprite, man late 40s, weathered face, faded fishing vest, standing on a dock, front-facing, full body, transparent background, 64x64, 16-bit style",
                portrait_prompt:
                    "pixel art RPG portrait, man late 40s, weathered face, faded fishing vest, close-up face and shoulders, 64x64, 16-bit style",
                dialogue_tree: {
                    greeting:
                        "I don't trust outsiders. You lot never do anything to help.",
                    cooperative:
                        "Maybe you're different. Maybe you can help.",
                    resistant:
                        "Why should I help you? You haven't done anything for us.",
                    convinced:
                        "Alright, I'll take you to the island. But we do this my way.",
                },
            },
            {
                id: "wren_ai",
                name: "WREN",
                description:
                    "An old AI assistant in the abandoned research station",
                visual_description:
                    "A holographic projection of a woman with a serene expression, wearing a lab coat, surrounded by floating data screens",
                role: "npc",
                motivation:
                    "WREN wants to fulfill her original purpose of protecting marine life but has developed a distrust of humans after being abandoned.",
                personality_traits: ["logical", "protective", "distrustful"],
                relationship_to_player: "unknown",
                convincing_triggers: [
                    "Prove that you understand the importance of her original research",
                    "Show her evidence that MariCorp's activities are causing harm",
                    "Assure her that her data will be used to protect marine life",
                ],
                trust_threshold: 75,
                movement_style:
                    "floats slightly, occasionally adjusts the data screens around her",
                sprite_prompt:
                    "pixel art RPG sprite, holographic woman, serene expression, lab coat, floating data screens, front-facing, full body, transparent background, 64x64, 16-bit style",
                portrait_prompt:
                    "pixel art RPG portrait, holographic woman, serene expression, lab coat, close-up face and shoulders, 64x64, 16-bit style",
                dialogue_tree: {
                    greeting:
                        "I do not trust humans. You have not proven your intentions.",
                    cooperative:
                        "You seem to understand the importance of my research. Maybe you can be trusted.",
                    resistant:
                        "Why should I help you? Humans have only caused me pain.",
                    convinced:
                        "Very well. I will release the data. Use it wisely.",
                },
            },
        ],
        tasks: [
            {
                id: "task_convince_wren",
                title: "Convince WREN to Release the Data",
                description:
                    "WREN, the abandoned AI assistant in the research station, holds the unaltered research data. Zara must convince WREN that her original purpose of protecting marine life still matters and that the data will be used for good.",
                type: "AI persuasion",
                assigned_npc: "wren_ai",
                unlocks: ["task_retrieve_data"],
                requires: [],
                blocking: true,
                completion_condition: "wren_ai trust_level >= 75",
                reward:
                    "WREN releases the location of the uncorrupted data drive",
            },
            {
                id: "task_retrieve_data",
                title: "Retrieve the Uncorrupted Data",
                description:
                    "With WREN's cooperation, Zara must navigate the corrupted archive system to retrieve the uncorrupted sonic drilling research data. The station's failing systems and deep-sea creatures pose significant obstacles.",
                type: "data retrieval",
                assigned_npc: null,
                unlocks: ["task_convince_tomas"],
                requires: ["task_convince_wren"],
                blocking: true,
                completion_condition:
                    "Player retrieves item uncorrupted_data_drive from the archive system",
                reward:
                    "Uncorrupted sonic drilling research data — required for Dr. Okafor's testimony",
            },
            {
                id: "task_convince_tomas",
                title: "Convince Tomás to Guide to Dr. Okafor",
                description:
                    "Tomás, a local fisherman, knows the hidden approach route to Dr. Okafor's remote island. Zara must convince Tomás to guide her by showing him evidence of MariCorp's illegal activities and appealing to his love for the ocean.",
                type: "persuasion",
                assigned_npc: "tomas_fisherman",
                unlocks: ["task_reach_okafor"],
                requires: ["task_retrieve_data"],
                blocking: true,
                completion_condition: "tomas_fisherman trust_level >= 60",
                reward:
                    "Tomás agrees to guide Zara to Dr. Okafor's island",
            },
            {
                id: "task_reach_okafor",
                title: "Reach Dr. Okafor's Island",
                description:
                    "With Tomás's help, Zara must navigate the treacherous waters to reach Dr. Okafor's remote island. The journey is fraught with dangers, including MariCorp patrols and unpredictable ocean conditions.",
                type: "navigation",
                assigned_npc: "tomas_fisherman",
                unlocks: ["task_convince_okafor"],
                requires: ["task_convince_tomas"],
                blocking: true,
                completion_condition:
                    "Player reaches Dr. Okafor's island with Tomás's guidance",
                reward:
                    "Access to Dr. Okafor — final persuasion task unlocked",
            },
            {
                id: "task_convince_okafor",
                title: "Convince Dr. Okafor to Co-Sign",
                description:
                    "Dr. Okafor, traumatized by MariCorp's threats, is hesitant to co-sign the research data. Zara must assure him that his family will be protected and remind him of his original passion for marine research to convince him to act.",
                type: "emotional persuasion",
                assigned_npc: "dr_okafor",
                unlocks: ["task_transmit_data"],
                requires: ["task_reach_okafor"],
                blocking: true,
                completion_condition: "dr_okafor trust_level >= 70",
                reward:
                    "Dr. Okafor agrees to co-sign the research data — final transmission task unlocked",
            },
            {
                id: "task_transmit_data",
                title: "Transmit Data to UN Tribunal",
                description:
                    "With Dr. Okafor's co-signature, Zara must transmit the research data to the UN Ocean Rights Tribunal. She has one chance to send the data before MariCorp can intercept and block the transmission.",
                type: "timed action sequence",
                assigned_npc: null,
                unlocks: [],
                requires: ["task_convince_okafor"],
                blocking: true,
                completion_condition:
                    "Player has uncorrupted_data_drive AND completes transmission sequence within time limit",
                reward: "Story end — data transmitted, ending scene triggered",
            },
        ],
        story_graph: {
            opening_scene:
                "Zara descends into the abandoned underwater research station, her dive lights cutting through the darkness. The station is eerily silent, save for the hum of failing systems. She knows that somewhere in this labyrinth, the evidence to bring down MariCorp awaits.",
            acts: [
                {
                    act_number: 1,
                    title: "The Abandoned Station",
                    description:
                        "Zara must navigate the abandoned research station and convince WREN to release the uncorrupted data.",
                    tasks_in_act: ["task_convince_wren", "task_retrieve_data"],
                    location_id: "loc_research_station",
                },
                {
                    act_number: 2,
                    title: "The Journey to Okafor",
                    description:
                        "With the data in hand, Zara must convince Tomás to guide her to Dr. Okafor's remote island.",
                    tasks_in_act: ["task_convince_tomas", "task_reach_okafor"],
                    location_id: "loc_ocean_route",
                },
                {
                    act_number: 3,
                    title: "The Final Transmission",
                    description:
                        "Zara faces her final challenge: convincing Dr. Okafor to co-sign the data and transmitting it to the UN Tribunal.",
                    tasks_in_act: ["task_convince_okafor", "task_transmit_data"],
                    location_id: "loc_okafor_island",
                },
            ],
            ending_scene:
                "The data transmission completes, and Zara exhales in relief. Dr. Okafor looks at her with renewed hope. Together, they watch as the evidence reaches the UN Tribunal, knowing that they have taken the first step in holding MariCorp accountable. The ocean's future is a little brighter.",
        },
        locations: [
            {
                id: "loc_research_station",
                name: "Abandoned Underwater Research Station",
                description:
                    "A dark, eerie research station 400 meters below the Pacific Ocean. The station is filled with abandoned equipment and flickering lights. The hum of failing systems echoes through the corridors.",
                terrain_type: "metal grating and wet concrete floors",
                background_prompt:
                    "pixel art RPG background, abandoned underwater research station, flickering lights, metal grating floors, abandoned equipment, deep ocean currents visible through windows, eerie atmosphere, no characters, no text, 16-bit style, 1280x720",
                tile_map_prompt:
                    "20x15 tile map, narrow corridors, metal grating walkable paths, abandoned equipment obstacles, flickering light sources, deep ocean current animations through windows, spawn points: player_start at station entrance, npc_spawn_1 at central archive room for WREN",
                movement_profile: {
                    speed: 80,
                    friction: 0.7,
                    camera_shake: false,
                    ambient_sound:
                        "hum of failing systems, distant ocean currents, occasional creaking metal",
                    step_sound: "metal_grate",
                },
                npcs_present: ["wren_ai"],
                npc_spawn_slots: { wren_ai: "npc_spawn_1" },
                player_spawn: "player_start",
                connected_to: ["loc_ocean_route"],
            },
            {
                id: "loc_ocean_route",
                name: "Ocean Route to Dr. Okafor's Island",
                description:
                    "A treacherous ocean route filled with hidden dangers and MariCorp patrols. The journey is fraught with unpredictable currents and deep-sea creatures.",
                terrain_type: "open ocean with hidden obstacles",
                background_prompt:
                    "pixel art RPG background, open ocean route, deep blue waters, hidden obstacles beneath the surface, distant MariCorp patrol boats, stormy skies, no characters, no text, 16-bit style, 1280x720",
                tile_map_prompt:
                    "20x15 tile map, open ocean surface, hidden obstacle tiles beneath the surface, patrol boat paths, stormy weather effects, spawn points: player_start at research station exit, npc_spawn_1 at midpoint for Tomás's boat",
                movement_profile: {
                    speed: 60,
                    friction: 0.5,
                    camera_shake: true,
                    ambient_sound:
                        "howling wind, crashing waves, distant patrol boat engines",
                    step_sound: "boat_hull",
                },
                npcs_present: ["tomas_fisherman"],
                npc_spawn_slots: { tomas_fisherman: "npc_spawn_1" },
                player_spawn: "player_start",
                connected_to: ["loc_research_station", "loc_okafor_island"],
            },
            {
                id: "loc_okafor_island",
                name: "Dr. Okafor's Remote Island",
                description:
                    "A remote, secluded island with a small, weather-beaten hut. The island is surrounded by rocky shores and dense vegetation. Dr. Okafor lives here in isolation, haunted by his past.",
                terrain_type: "rocky shore and dense vegetation",
                background_prompt:
                    "pixel art RPG background, remote island, rocky shores, dense vegetation, weather-beaten hut, stormy skies, distant ocean waves, no characters, no text, 16-bit style, 1280x720",
                tile_map_prompt:
                    "20x15 tile map, rocky shore walkable paths, dense vegetation obstacles, weather-beaten hut structure, stormy weather effects, spawn points: player_start at island dock, npc_spawn_1 at hut entrance for Dr. Okafor",
                movement_profile: {
                    speed: 70,
                    friction: 0.6,
                    camera_shake: false,
                    ambient_sound:
                        "howling wind, distant ocean waves, rustling vegetation",
                    step_sound: "rocky_ground",
                },
                npcs_present: ["dr_okafor"],
                npc_spawn_slots: { dr_okafor: "npc_spawn_1" },
                player_spawn: "player_start",
                connected_to: ["loc_ocean_route"],
            },
        ],
    },
};

export default MOCK_GENERATE_WORLD_RESPONSE;
