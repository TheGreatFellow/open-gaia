import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

// ═══════════════════════════════════════════════════════════
//  TILE FRAME REFERENCE (basechip.png — 8 cols × 133 rows)
//  Row  0-4:  Trees, bushes (0-39)
//  Row  5-8:  Grass, ground (40-71)
//  Row  9-12: Paths, dirt (72-103)
//  Row 13-16: Fences, signs (104-135)
//  Row 17-20: Floor tiles (136-167)
//  Row 21-40: Building walls, roofs (168-327)
//  Row 40-55: Stone, brick walls (320-447)
//  Row 55-70: Interior floors (440-567)
//  Row  70+:  Furniture (560+)
// ═══════════════════════════════════════════════════════════

// ─── Map templates for different terrain types ───
// Each returns { groundData, tileFrames, playerStart, npcSpawn }
function generateResearchStationMap() {
    const W = 25, H = 19;
    // 0=metal floor, 1=wall, 3=door, 4=interior, 5=corridor, 6=dark
    const ground = [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 5, 5, 5, 5, 5, 5, 5, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1,
        1, 5, 5, 5, 5, 5, 5, 5, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1,
        1, 5, 5, 5, 5, 5, 5, 5, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1,
        1, 5, 5, 5, 5, 5, 5, 5, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1,
        1, 5, 5, 5, 5, 5, 5, 5, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1,
        1, 5, 5, 5, 5, 5, 5, 5, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1,
        1, 5, 5, 5, 5, 5, 5, 5, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1,
        1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5,
        1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
        1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
        1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5,
        1, 5, 5, 5, 5, 5, 5, 6, 6, 6, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1,
        1, 5, 5, 5, 5, 5, 5, 6, 6, 6, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1,
        1, 5, 5, 5, 5, 5, 5, 6, 6, 6, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1,
        1, 5, 5, 5, 5, 5, 5, 6, 6, 6, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1,
        1, 5, 5, 5, 5, 5, 5, 6, 6, 6, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1,
        1, 5, 5, 5, 5, 5, 5, 6, 6, 6, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
    ];
    return {
        width: W, height: H,
        ground,
        tileFrames: {
            0: 456,   // metal floor
            1: 344,   // stone wall
            3: 456,   // door (same as floor, no collision)
            4: 448,   // interior archive room
            5: 456,   // corridor
            6: 440    // dark storage
        },
        playerStart: { x: 96, y: 320 },
        npcSpawn: { x: 560, y: 112 }
    };
}

function generateOceanRouteMap() {
    const W = 25, H = 19;
    // 0=water, 5=dock planks, 8=sand
    const ground = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        8, 8, 8, 8, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 8, 8, 8, 8,
        8, 8, 8, 8, 8, 8, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 8, 8, 8, 8, 8, 8,
        8, 8, 8, 8, 8, 8, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 8, 8, 8, 8, 8, 8,
        5, 5, 8, 8, 8, 8, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 8, 8, 8, 8, 5, 5,
        5, 5, 8, 8, 8, 8, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 8, 8, 8, 8, 5, 5,
        5, 5, 8, 8, 8, 8, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 8, 8, 8, 8, 5, 5,
        5, 5, 8, 8, 8, 8, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 8, 8, 8, 8, 5, 5,
        5, 5, 8, 8, 8, 8, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 8, 8, 8, 8, 5, 5,
        8, 8, 8, 8, 8, 8, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 8, 8, 8, 8, 8, 8,
        8, 8, 8, 8, 8, 8, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 8, 8, 8, 8, 8, 8,
        8, 8, 8, 8, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 8, 8, 8, 8,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ];
    return {
        width: W, height: H,
        ground,
        tileFrames: {
            0: 59,    // water
            5: 137,   // dock planks
            8: 82     // sand/beach
        },
        playerStart: { x: 96, y: 288 },
        npcSpawn: { x: 400, y: 288 }
    };
}

function generateIslandMap() {
    const W = 25, H = 19;
    // 0=grass, 1=wall(hut), 2=tree, 3=door, 4=interior, 8=sand, 9=water, 10=rock
    const ground = [
        9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9,
        9, 9, 9, 9, 9, 9, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9,
        9, 9, 9, 8, 8, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 8, 9, 9, 9, 9,
        9, 9, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 9, 9, 9,
        9, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 9, 9,
        9, 8, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 8, 9, 9,
        9, 8, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0, 8, 9, 9,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0, 8, 9, 9,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0, 8, 9, 9,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0, 8, 9, 9,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0, 0, 8, 9, 9,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 8, 9, 9,
        9, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 9, 9,
        9, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 9, 9,
        9, 9, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 9, 9, 9,
        9, 9, 9, 8, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 8, 9, 9, 9, 9,
        9, 9, 9, 9, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9,
        9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9,
        9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9
    ];
    return {
        width: W, height: H,
        ground,
        tileFrames: {
            0: 73,    // grass
            1: 344,   // hut walls
            3: 73,    // door (grass, no collision)
            4: 456,   // interior floor
            8: 82,    // sand
            9: 59,    // ocean water
            10: 344   // rocky
        },
        playerStart: { x: 160, y: 448 },
        npcSpawn: { x: 416, y: 256 }
    };
}

// ─── Map generators by location ID (fallback/defaults) ───
const MAP_GENERATORS = {
    'loc_research_station': generateResearchStationMap,
    'loc_ocean_route': generateOceanRouteMap,
    'loc_okafor_island': generateIslandMap
};

// ═══════════════════════════════════════════
//  WORLD SCENE — driven by game bible from Registry
// ═══════════════════════════════════════════
export class WorldScene extends Scene {
    constructor() {
        super('WorldScene');
        this.lastDirection = 'down';
        this.canInteract = true;
        this._transitioning = false;
        this.visitedLocations = new Set();
    }

    buildLocationsFromBible(bible) {
        const locations = {};
        for (const loc of bible.locations) {
            // Default to research station map if ID not exactly matched
            const gen = MAP_GENERATORS[loc.id] || generateResearchStationMap;
            const mapData = gen();

            // Find NPCs for this location
            const chars = (loc.npcs_present || []).map(npcId => {
                const charDef = bible.characters.find(c => c.id === npcId);
                if (!charDef) return null;
                return {
                    characterId: charDef.id,
                    characterName: charDef.name,
                    spawnX: mapData.npcSpawn.x,
                    spawnY: mapData.npcSpawn.y,
                    spriteKey: 'zombie',
                    role: charDef.role,
                    patrol: { axis: 'y', distance: 4 * 32, speed: 35 }
                };
            }).filter(Boolean);

            // Find the story act for this location
            const act = bible.story_graph.acts.find(a => a.location_id === loc.id);

            locations[loc.id] = {
                locationId: loc.id,
                locationName: loc.name,
                locationDescription: loc.description,
                moveSpeed: loc.movement_profile?.speed || 100,
                cameraShake: loc.movement_profile?.camera_shake || false,
                connectedLocations: loc.connected_to || [],
                storyAct: act ? { title: act.title, description: act.description, actNumber: act.act_number } : null,
                tileMap: {
                    width: mapData.width,
                    height: mapData.height,
                    tilewidth: 32,
                    tileheight: 32,
                    layers: [
                        {
                            name: 'ground',
                            type: 'tilelayer',
                            width: mapData.width,
                            height: mapData.height,
                            data: mapData.ground
                        },
                        {
                            name: 'collision',
                            type: 'tilelayer',
                            width: mapData.width,
                            height: mapData.height,
                            data: new Array(mapData.width * mapData.height).fill(0)
                        },
                        {
                            name: 'objects',
                            type: 'objectgroup',
                            objects: [
                                { name: 'player_start', x: mapData.playerStart.x, y: mapData.playerStart.y, width: 32, height: 32 },
                                { name: 'npc_spawn_1', x: mapData.npcSpawn.x, y: mapData.npcSpawn.y, width: 32, height: 32 }
                            ]
                        }
                    ]
                },
                characters: chars,
                tileFrames: mapData.tileFrames
            };
        }
        return locations;
    }

    const LOCATIONS = buildLocationsFromBible();
    const PROTAGONIST = BIBLE.characters.find(c => c.role === 'protagonist');

// Track completed tasks (synced from React via EventBus)
let _completedTasks = [];
EventBus.on('sync-completed-tasks', (tasks) => {
    const oldTasks = _completedTasks;
    _completedTasks = tasks || [];

    // If new tasks were completed, re-allow story intro for newly-unlocked locations
    if (_completedTasks.length > oldTasks.length) {
        const acts = BIBLE.story_graph.acts;
        for (const act of acts) {
            const prevAct = acts.find(a => a.act_number === act.act_number - 1);
            if (!prevAct) continue;
            // If previous act's tasks are now ALL completed, clear visited for this act's location
            const allDone = (prevAct.tasks_in_act || []).every(tid => _completedTasks.includes(tid));
            if (allDone) {
                visitedLocations.delete(act.location_id);
            }
        }
    }
});
const START_LOCATION_ID = BIBLE.story_graph.acts[0]?.location_id || Object.keys(LOCATIONS)[0];

// Track which locations the player has visited (for story intro)
const visitedLocations = new Set();

// ═══════════════════════════════════════════
//  WORLD SCENE — driven by game bible
// ═══════════════════════════════════════════
export class WorldScene extends Scene {
    constructor() {
        super('WorldScene');
        this.lastDirection = 'down';
        this.canInteract = true;
        this._transitioning = false;
    }

    create(data) {
        const bible = this.registry.get('gameBible');
        if (!bible) {
            console.warn('WorldScene waiting for gameBible in registry...');
            this._onBibleReady = () => {
                this.scene.restart(data);
            };
            EventBus.on('bible-updated', this._onBibleReady);
            return;
        }

        this.locations = this.buildLocationsFromBible(bible);
        this.protagonist = bible.characters.find(c => c.role === 'protagonist');
        this.startLocationId = bible.story_graph.acts[0]?.location_id || Object.keys(this.locations)[0];

        const locId = (data && data.locationId) ? data.locationId : this.startLocationId;
        const locData = this.locations[locId];
        if (!locData) {
            console.error(`Location ${locId} not found in dynamic locations!`);
            return;
        }
        this.locationData = locData;
        this._transitioning = false;
        this.canInteract = true;
        this._introActive = false;

        const map = locData.tileMap;
        const cols = map.width;
        const rows = map.height;
        const tw = map.tilewidth;
        const th = map.tileheight;
        const worldW = cols * tw;
        const worldH = rows * th;

        // ─── World & camera bounds ───
        this.physics.world.setBounds(0, 0, worldW, worldH);
        this.cameras.main.setBounds(0, 0, worldW, worldH);

        // ─── Find layers ───
        const groundLayer = map.layers.find(l => l.name === 'ground');
        const objectsLayer = map.layers.find(l => l.name === 'objects');

        // ─── Render ground layer ───
        this.wallBodies = [];
        this.waterBodies = [];
        if (groundLayer) {
            for (let i = 0; i < groundLayer.data.length; i++) {
                const tileVal = groundLayer.data[i];
                const x = (i % cols) * tw + tw / 2;
                const y = Math.floor(i / cols) * th + th / 2;

                const frame = locData.tileFrames[tileVal] ?? locData.tileFrames[0] ?? 73;
                this.add.image(x, y, 'basechip', frame);

                // Walls (1) get collision
                if (tileVal === 1) {
                    const rect = this.add.rectangle(x, y, tw, th).setVisible(false);
                    this.physics.add.existing(rect, true);
                    this.wallBodies.push(rect);
                }
                // Water (0 in ocean/island contexts or 9) blocks player
                if (tileVal === 9 || (locId === 'loc_ocean_route' && tileVal === 0)) {
                    const rect = this.add.rectangle(x, y, tw, th).setVisible(false);
                    this.physics.add.existing(rect, true);
                    this.waterBodies.push(rect);
                }
            }
        }

        // ─── Player spawn ───
        let playerX = worldW / 2, playerY = worldH / 2;

        // If arriving from another map, spawn near the edge the player entered from
        if (data && data._arrivalEdge === 'left') {
            // Arrived from the left edge → spawn on the left side
            playerX = 48;
            playerY = worldH / 2;
        } else if (data && data._arrivalEdge === 'right') {
            // Arrived from the right edge → spawn on the right side
            playerX = worldW - 48;
            playerY = worldH / 2;
        } else if (objectsLayer) {
            // Default: use the map's player_start position
            const ps = objectsLayer.objects.find(o => o.name === 'player_start');
            if (ps) { playerX = ps.x + 16; playerY = ps.y + 16; }
        }

        // ─── Place player sprite ───
        this.player = this.physics.add.sprite(playerX, playerY, 'man', 18);
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(24, 24);
        this.player.body.setOffset(20, 36);

        // ─── Player name label (GOLD) ───
        const protagonistName = this.protagonist ? this.protagonist.name : 'Hero';
        this.playerLabel = this.add.text(playerX, playerY - 40, protagonistName, {
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5, 1).setDepth(15);

        // Collisions
        for (const wall of this.wallBodies) { this.physics.add.collider(this.player, wall); }
        for (const water of this.waterBodies) { this.physics.add.collider(this.player, water); }

        // ─── Place NPC characters ───
        this.npcs = [];
        this.npcLabels = [];
        for (const charData of locData.characters) {
            const npc = this.physics.add.sprite(charData.spawnX, charData.spawnY, charData.spriteKey, 18);
            npc.body.setImmovable(true);
            npc.body.setSize(24, 24);
            npc.body.setOffset(20, 36);
            npc.setData('characterId', charData.characterId);
            npc.setData('characterName', charData.characterName);

            // NPC name label (RED)
            const label = this.add.text(charData.spawnX, charData.spawnY - 40, charData.characterName, {
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#ff4444',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5, 1).setDepth(15);
            this.npcLabels.push({ npc, label });

            // Idle animation
            const animKey = `${charData.spriteKey}-walk-down`;
            if (this.anims.exists(animKey)) { npc.anims.play(animKey); }

            // Patrol setup
            if (charData.patrol) {
                npc.setData('patrolOriginY', charData.spawnY);
                npc.setData('patrolDistance', charData.patrol.distance);
                npc.setData('patrolSpeed', charData.patrol.speed);
                npc.setData('patrolDir', 1);
                npc.setData('isPatrolling', true);
            }

            this.physics.add.collider(this.player, npc);

            // Interaction zone
            const zone = this.add.zone(charData.spawnX, charData.spawnY, 120, 120);
            this.physics.add.existing(zone, true);
            npc.interactZone = zone;

            this.npcs.push(npc);
        }

        // ─── Exit zones ───
        // Determine direction based on location order in the game bible
        const locOrder = bible.locations.map(l => l.id);
        const currentIdx = locOrder.indexOf(locData.locationId);

        this.exitZones = [];
        const rightExit = { x: worldW - 8, y: worldH / 2, w: 32, h: 300, arrow: '→' };
        const leftExit = { x: 8, y: worldH / 2, w: 32, h: 300, arrow: '←' };

        if (locData.connectedLocations) {
            locData.connectedLocations.forEach((connId) => {
                const destIdx = locOrder.indexOf(connId);
                // If destination is later in the story → right edge (forward)
                // If destination is earlier → left edge (back)
                const pos = (destIdx > currentIdx) ? rightExit : leftExit;

                const exitZone = this.add.zone(pos.x, pos.y, pos.w, pos.h);
                this.physics.add.existing(exitZone, true);

                // Find destination name
                const destLoc = this.locations[connId];
                const destName = destLoc ? destLoc.locationName : connId;

                // Arrow + destination label
                const arrow = this.add.text(pos.x, pos.y - 12, pos.arrow, {
                    fontSize: '22px', fontFamily: 'monospace', color: '#ffdd57',
                    fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
                }).setOrigin(0.5, 0.5).setDepth(5).setScrollFactor(0);

                const destLabel = this.add.text(pos.x, pos.y + 10, destName, {
                    fontSize: '9px', fontFamily: 'monospace', color: '#ffdd57',
                    stroke: '#000000', strokeThickness: 2
                }).setOrigin(0.5, 0.5).setDepth(5).setScrollFactor(0);

                this.tweens.add({
                    targets: [arrow, destLabel],
                    alpha: { from: 1, to: 0.3 },
                    duration: 800, yoyo: true, repeat: -1
                });

                this.physics.add.overlap(this.player, exitZone, () => {
                    if (this._transitioning) return;
                    this._transitioning = true;
                    const dest = this.locations[connId];
                    if (dest) {
                        // Determine which edge the player will ARRIVE at in the new map
                        // If exiting right (→), player arrives on the LEFT of the new map
                        // If exiting left (←), player arrives on the RIGHT of the new map
                        const arrivalEdge = (pos.arrow === '→') ? 'left' : 'right';
                        this.cameras.main.fadeOut(300, 0, 0, 0);
                        this.cameras.main.once('camerafadeoutcomplete', () => {
                            this.scene.restart({ ...dest, _arrivalEdge: arrivalEdge });
                        });
                    } else {
                        this._transitioning = false;
                    }
                });

                this.exitZones.push(exitZone);
            });
        }

        // ─── Camera ───
        this.cameras.main.startFollow(this.player);
        this.cameras.main.fadeIn(300, 0, 0, 0);

        // ─── Input ───
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // ─── EventBus ───
        this._onDialogueClosed = () => { this.canInteract = true; };
        EventBus.on('dialogue-closed', this._onDialogueClosed);

        this._onDialogueReady = (data) => {
            // data contains the API response + characterId
            this.scene.launch('DialogueScene', data);
        };
        EventBus.on('dialogue-ready', this._onDialogueReady);

        this._onLoadLocation = (newData) => { this.scene.restart(newData); };
        EventBus.on('load-location', this._onLoadLocation);

        // ─── Story intro (first visit only) ───
        if (!this.visitedLocations.has(locId)) {
            this.visitedLocations.add(locId);
            this.showStoryIntro(locData);
        }

        console.log(`WorldScene: ${locData.locationName} (${cols}×${rows})`);
    }

    // ─── STORY INTRO TYPEWRITER ───
    showStoryIntro(locData) {
        // Check if act is locked or already completed BEFORE drawing anything
        if (locData.storyAct) {
            const actNum = locData.storyAct.actNumber;
            const acts = BIBLE.story_graph.acts;
            const currentAct = acts.find(a => a.act_number === actNum);
            const prevAct = acts.find(a => a.act_number === actNum - 1);

            // Skip if previous act's tasks aren't done (locked)
            if (prevAct) {
                const prevTaskIds = prevAct.tasks_in_act || [];
                const actLocked = prevTaskIds.some(tid => !_completedTasks.includes(tid));
                if (actLocked) {
                    return;
                }
            }

            // Skip if current act's tasks are ALL already completed
            if (currentAct) {
                const currentTaskIds = currentAct.tasks_in_act || [];
                const allDone = currentTaskIds.length > 0 && currentTaskIds.every(tid => _completedTasks.includes(tid));
                if (allDone) {
                    return;
                }
            }
        }

        this._introActive = true;
        this.player.body.setVelocity(0, 0);

        const cam = this.cameras.main;
        const cx = cam.width / 2;
        const cy = cam.height / 2;

        // Dark overlay box
        const box = this.add.rectangle(cx, cy, 700, 260, 0x0a0a1a, 0.92)
            .setScrollFactor(0).setDepth(50);
        const border = this.add.rectangle(cx, cy, 700, 260)
            .setScrollFactor(0).setDepth(50)
            .setStrokeStyle(2, 0x44aaff);

        // Location name
        const locName = this.add.text(cx, cy - 100, locData.locationName.toUpperCase(), {
            fontSize: '14px', fontFamily: 'monospace', color: '#44aaff',
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(51);

        // Act title
        let actTitle = null;
        let fullText = locData.locationDescription || '';

        if (locData.storyAct) {
            actTitle = this.add.text(cx, cy - 75, `ACT ${locData.storyAct.actNumber}: ${locData.storyAct.title}`, {
                fontSize: '16px', fontFamily: 'monospace', color: '#ffd700',
                fontStyle: 'bold', stroke: '#000000', strokeThickness: 2
            }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(51);
            fullText = locData.storyAct.description;
        }

        // Typewriter text
        const textObj = this.add.text(cx - 320, cy - 45, '', {
            fontSize: '12px', fontFamily: 'monospace', color: '#ccddee',
            wordWrap: { width: 640 }, lineSpacing: 6
        }).setScrollFactor(0).setDepth(51);

        // Hint
        const hint = this.add.text(cx, cy + 110, '[ SPACE to skip ]', {
            fontSize: '10px', fontFamily: 'monospace', color: '#667788'
        }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(51);

        const allParts = [box, border, locName, textObj, hint];
        if (actTitle) allParts.push(actTitle);

        // Typewriter effect
        let charIndex = 0;
        const typeSpeed = 30; // ms per char
        const typeTimer = this.time.addEvent({
            delay: typeSpeed,
            repeat: fullText.length - 1,
            callback: () => {
                charIndex++;
                textObj.setText(fullText.substring(0, charIndex));
            }
        });

        // Skip with space
        const skipHandler = () => {
            if (this._introActive) {
                typeTimer.remove(false);
                textObj.setText(fullText);
                dismissIntro();
            }
        };

        const dismissIntro = () => {
            if (!this._introActive) return;
            this._introActive = false;
            this.spaceKey.off('down', skipHandler);

            this.tweens.add({
                targets: allParts,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    allParts.forEach(p => p.destroy());
                }
            });
        };

        this.spaceKey.on('down', skipHandler);

        // Auto-dismiss after text completes + 3 seconds
        this.time.delayedCall(fullText.length * typeSpeed + 3000, () => {
            dismissIntro();
        });
    }

    update() {
        if (!this.cursors || !this.player || this._transitioning) return;

        // Block movement during intro
        if (this._introActive) {
            this.player.body.setVelocity(0, 0);
            // Update label positions even while frozen
            this.playerLabel.setPosition(this.player.x, this.player.y - 40);
            return;
        }

        const speed = this.locationData?.moveSpeed || 100;
        let vx = 0, vy = 0;

        if (this.cursors.left.isDown) { vx = -speed; this.lastDirection = 'left'; }
        else if (this.cursors.right.isDown) { vx = speed; this.lastDirection = 'right'; }
        if (this.cursors.up.isDown) { vy = -speed; this.lastDirection = 'up'; }
        else if (this.cursors.down.isDown) { vy = speed; this.lastDirection = 'down'; }

        if (vx !== 0 && vy !== 0) { vx /= 1.414; vy /= 1.414; }
        this.player.body.setVelocity(vx, vy);

        if (vx !== 0 || vy !== 0) {
            this.player.anims.play(`walk-${this.lastDirection}`, true);
        } else {
            this.player.anims.stop();
        }

        // ─── Update player label position ───
        this.playerLabel.setPosition(this.player.x, this.player.y - 40);

        // ─── NPC Patrol + label updates ───
        for (const npc of this.npcs) {
            // Update NPC label
            const labelEntry = this.npcLabels.find(e => e.npc === npc);
            if (labelEntry) {
                labelEntry.label.setPosition(npc.x, npc.y - 40);
            }

            if (!npc.getData('isPatrolling')) continue;

            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);

            if (dist < 150) {
                npc.body.setVelocity(0, 0);
                const dx = this.player.x - npc.x;
                const dy = this.player.y - npc.y;
                if (Math.abs(dx) > Math.abs(dy)) {
                    npc.anims.play(dx > 0 ? `${npc.texture.key}-walk-right` : `${npc.texture.key}-walk-left`, true);
                } else {
                    npc.anims.play(dy > 0 ? `${npc.texture.key}-walk-down` : `${npc.texture.key}-walk-up`, true);
                }
            } else {
                const originY = npc.getData('patrolOriginY');
                const patrolDist = npc.getData('patrolDistance');
                const patrolSpeed = npc.getData('patrolSpeed');
                let dir = npc.getData('patrolDir');

                if (npc.y >= originY + patrolDist / 2) { dir = -1; npc.setData('patrolDir', -1); }
                else if (npc.y <= originY - patrolDist / 2) { dir = 1; npc.setData('patrolDir', 1); }

                npc.body.setVelocityY(dir * patrolSpeed);
                npc.anims.play(
                    dir > 0 ? `${npc.texture.key}-walk-down` : `${npc.texture.key}-walk-up`, true
                );
            }

            // Move interaction zone to follow NPC
            if (npc.interactZone) {
                npc.interactZone.setPosition(npc.x, npc.y);
                npc.interactZone.body.reset(npc.x, npc.y);
            }
        }

        // ─── NPC interaction ───
        const interactZones = this.npcs.map(n => n.interactZone).filter(Boolean);
        this.physics.overlap(this.player, interactZones, (player, zone) => {
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.canInteract) {
                this.canInteract = false;
                this.player.body.setVelocity(0, 0);
                this.player.anims.stop();

                const npc = this.npcs.find(n => n.interactZone === zone);
                const charId = npc ? npc.getData('characterId') : 'unknown';
                const charName = npc ? npc.getData('characterName') : 'NPC';

                // We only emit the interact event. GameShell handles the API call
                // and will emit 'dialogue-ready' when data arrives.
                EventBus.emit('npc-interact', {
                    characterId: charId,
                    characterName: charName
                });
            }
        });
    }

    shutdown() {
        if (this._onDialogueClosed) EventBus.off('dialogue-closed', this._onDialogueClosed);
        if (this._onDialogueReady) EventBus.off('dialogue-ready', this._onDialogueReady);
        if (this._onLoadLocation) EventBus.off('load-location', this._onLoadLocation);
        if (this._onBibleReady) EventBus.off('bible-updated', this._onBibleReady);
    }
}
