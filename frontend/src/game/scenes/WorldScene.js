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

// ─── LOCATION 1: Research Station (outdoor + building) ───
const LOC_RESEARCH_STATION = {
    locationId: "loc_research_station",
    locationName: "Research Station",
    moveSpeed: 120,
    cameraShake: false,
    connectedLocations: ["loc_docks"],
    tileMap: {
        width: 25,
        height: 19,
        tilewidth: 32,
        tileheight: 32,
        layers: [
            {
                name: "ground",
                type: "tilelayer",
                width: 25,
                height: 19,
                // 0=grass, 1=wall, 3=door floor, 4=interior floor
                // 5=dirt path, 6=water, 7=water edge
                data: [
                    // Row 0 — top border grass + scattered trees
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    // Row 1
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    // Row 2 — lake starts
                    0, 0, 0, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    // Row 3
                    0, 0, 6, 6, 6, 6, 6, 0, 0, 0, 0, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    // Row 4 — lake + dirt path to room
                    0, 0, 6, 6, 6, 6, 0, 0, 0, 0, 0, 5, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
                    // Row 5
                    0, 0, 0, 6, 6, 0, 0, 0, 0, 0, 0, 5, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0,
                    // Row 6
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0,
                    // Row 7
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0,
                    // Row 8 — open lawn
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0,
                    // Row 9 — path leads to door
                    0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 3, 3, 3, 4, 4, 4, 4, 4, 4, 1, 0,
                    // Row 10
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 3, 3, 3, 4, 4, 4, 4, 4, 4, 1, 0,
                    // Row 11
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0,
                    // Row 12
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0,
                    // Row 13
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0,
                    // Row 14
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0,
                    // Row 15
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0,
                    // Row 16 — room bottom wall
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
                    // Row 17
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    // Row 18
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                ]
            },
            {
                name: "collision",
                type: "tilelayer",
                width: 25,
                height: 19,
                data: [
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                ]
            },
            {
                name: "objects",
                type: "objectgroup",
                objects: [
                    { name: "player_start", x: 160, y: 288, width: 32, height: 32 },
                    { name: "npc_spawn_1", x: 576, y: 320, width: 32, height: 32 }
                ]
            }
        ]
    },
    characters: [
        {
            characterId: "wren", characterName: "WREN",
            spawnX: 576, spawnY: 320, spriteKey: "zombie",
            patrol: { axis: 'y', distance: 5 * 32, speed: 40 }
        }
    ],
    tileFrames: {
        0: 73,    // grass — row 9, lush green grass
        1: 344,   // wall — row 43, gray stone bricks
        2: 113,   // obstacle — row 14, wooden fence
        3: 73,    // door floor — grass (no collision)
        4: 456,   // interior floor — row 57, wood planks
        5: 82,    // dirt path — row 10, sandy path
        6: 59,    // water — row 7, actual blue water
        7: 58     // water edge — row 7, water border
    }
};

// ─── LOCATION 2: Docks ───
const LOC_DOCKS = {
    locationId: "loc_docks",
    locationName: "Harbor Docks",
    moveSpeed: 100,
    cameraShake: false,
    connectedLocations: ["loc_research_station"],
    tileMap: {
        width: 25,
        height: 19,
        tilewidth: 32,
        tileheight: 32,
        layers: [
            {
                name: "ground",
                type: "tilelayer",
                width: 25,
                height: 19,
                // 0=grass, 5=wooden dock planks, 6=water, 1=wall
                data: [
                    6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
                    6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
                    6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
                    6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
                    6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
                    6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
                    6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6,
                    6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6,
                    0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
                    6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
                    6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
                    6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
                    6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
                    6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6
                ]
            },
            {
                name: "collision",
                type: "tilelayer",
                width: 25,
                height: 19,
                data: new Array(475).fill(0)
            },
            {
                name: "objects",
                type: "objectgroup",
                objects: [
                    { name: "player_start", x: 384, y: 320, width: 32, height: 32 }
                ]
            }
        ]
    },
    characters: [],
    tileFrames: {
        0: 73,    // grass
        1: 344,   // wall
        5: 137,   // dock planks — row 17, colored floor tile
        6: 55     // water
    }
};

// Location registry
const LOCATIONS = {
    "loc_research_station": LOC_RESEARCH_STATION,
    "loc_docks": LOC_DOCKS
};

// ═══════════════════════════════════════════
//  WORLD SCENE — fully data-driven
// ═══════════════════════════════════════════
export class WorldScene extends Scene {
    constructor() {
        super('WorldScene');
        this.lastDirection = 'down';
        this.canInteract = true;
        this._transitioning = false;
    }

    create(data) {
        // Use passed data, or fall back to test data
        const locData = (data && data.locationId) ? data : LOC_RESEARCH_STATION;
        this.locationData = locData;
        this._transitioning = false;
        this.canInteract = true;

        const map = locData.tileMap;
        const cols = map.width;
        const rows = map.height;
        const tw = map.tilewidth;   // 32
        const th = map.tileheight;  // 32
        const worldW = cols * tw;
        const worldH = rows * th;

        // ─── World & camera bounds ───
        this.physics.world.setBounds(0, 0, worldW, worldH);
        this.cameras.main.setBounds(0, 0, worldW, worldH);

        // ─── Find layers ───
        const groundLayer = map.layers.find(l => l.name === 'ground');
        const collisionLayer = map.layers.find(l => l.name === 'collision');
        const objectsLayer = map.layers.find(l => l.name === 'objects');

        // ─── Render ground layer with tileset frames ───
        this.wallBodies = [];
        this.waterBodies = [];
        if (groundLayer) {
            for (let i = 0; i < groundLayer.data.length; i++) {
                const tileVal = groundLayer.data[i];
                const x = (i % cols) * tw + tw / 2;
                const y = Math.floor(i / cols) * th + th / 2;

                // Render tile image from basechip spritesheet
                const frame = locData.tileFrames[tileVal] ?? locData.tileFrames[0];
                this.add.image(x, y, 'basechip', frame);

                // Wall tiles (value 1) get collision
                if (tileVal === 1) {
                    const wallRect = this.add.rectangle(x, y, tw, th);
                    wallRect.setVisible(false);
                    this.physics.add.existing(wallRect, true);
                    this.wallBodies.push(wallRect);
                }

                // Water tiles (value 6) block player
                if (tileVal === 6) {
                    const waterRect = this.add.rectangle(x, y, tw, th);
                    waterRect.setVisible(false);
                    this.physics.add.existing(waterRect, true);
                    this.waterBodies.push(waterRect);
                }
            }
        }

        // ─── Render collision layer (obstacles) ───
        this.collisionBodies = [];
        if (collisionLayer) {
            for (let i = 0; i < collisionLayer.data.length; i++) {
                const tileVal = collisionLayer.data[i];
                if (tileVal === 2) {
                    const x = (i % cols) * tw + tw / 2;
                    const y = Math.floor(i / cols) * th + th / 2;

                    const frame = locData.tileFrames[2] ?? 113;
                    this.add.image(x, y, 'basechip', frame);

                    const body = this.add.rectangle(x, y, tw, th);
                    body.setVisible(false);
                    this.physics.add.existing(body, true);
                    this.collisionBodies.push(body);
                }
            }
        }

        // ─── Find player spawn from objects layer ───
        let playerX = worldW / 2;
        let playerY = worldH / 2;
        if (objectsLayer) {
            const playerObj = objectsLayer.objects.find(o => o.name === 'player_start');
            if (playerObj) {
                playerX = playerObj.x + (playerObj.width || tw) / 2;
                playerY = playerObj.y + (playerObj.height || th) / 2;
            }
        }

        // ─── Place player sprite ───
        this.player = this.physics.add.sprite(playerX, playerY, 'man', 18);
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(24, 24);      // Smaller hitbox so player fits through doors
        this.player.body.setOffset(20, 36);     // Center the hitbox at feet

        // Player collides with walls
        for (const wall of this.wallBodies) {
            this.physics.add.collider(this.player, wall);
        }
        // Player collides with water
        for (const water of this.waterBodies) {
            this.physics.add.collider(this.player, water);
        }
        // Player collides with obstacles
        for (const body of this.collisionBodies) {
            this.physics.add.collider(this.player, body);
        }

        // ─── Place NPC characters from data ───
        this.npcs = [];
        for (const charData of locData.characters) {
            const npc = this.physics.add.sprite(charData.spawnX, charData.spawnY, charData.spriteKey, 18);
            npc.body.setImmovable(true);
            npc.body.setSize(24, 24);
            npc.body.setOffset(20, 36);
            npc.setData('characterId', charData.characterId);
            npc.setData('characterName', charData.characterName);

            // Play idle animation
            const animKey = `${charData.spriteKey}-walk-down`;
            if (this.anims.exists(animKey)) {
                npc.anims.play(animKey);
            }

            // Patrol setup — NPC walks up and down ~5 tiles
            if (charData.patrol) {
                npc.setData('patrolOriginY', charData.spawnY);
                npc.setData('patrolDistance', charData.patrol.distance);
                npc.setData('patrolSpeed', charData.patrol.speed);
                npc.setData('patrolDir', 1); // 1 = moving down, -1 = moving up
                npc.setData('isPatrolling', true);
                npc.setData('playerNearby', false);
            }

            // Collide player with NPC body
            this.physics.add.collider(this.player, npc);

            // Interaction zone — LARGER than sprite so player can trigger it
            // 120×120 zone around NPC center
            const zone = this.add.zone(charData.spawnX, charData.spawnY, 120, 120);
            this.physics.add.existing(zone, true);
            npc.interactZone = zone;

            this.npcs.push(npc);
        }

        // ─── Exit zones from connected locations ───
        this.exitZones = [];
        const exitPositions = [
            // First connection → right edge
            { x: worldW - 8, y: worldH / 2, w: 32, h: 300, arrow: '→', edge: 'right' },
            // Second connection → left edge
            { x: 8, y: worldH / 2, w: 32, h: 300, arrow: '←', edge: 'left' },
            // Third connection → top edge
            { x: worldW / 2, y: 8, w: 300, h: 32, arrow: '↑', edge: 'top' }
        ];

        if (locData.connectedLocations) {
            locData.connectedLocations.forEach((connId, i) => {
                if (i >= exitPositions.length) return;
                const pos = exitPositions[i];

                // Exit zone
                const exitZone = this.add.zone(pos.x, pos.y, pos.w, pos.h);
                this.physics.add.existing(exitZone, true);

                // Yellow arrow indicator
                const arrow = this.add.text(pos.x, pos.y, pos.arrow, {
                    fontSize: '24px',
                    fontFamily: 'monospace',
                    color: '#ffdd57',
                    fontStyle: 'bold',
                    stroke: '#000000',
                    strokeThickness: 3
                });
                arrow.setOrigin(0.5, 0.5);
                arrow.setDepth(5);

                // Pulsing animation on arrow
                this.tweens.add({
                    targets: arrow,
                    alpha: { from: 1, to: 0.3 },
                    duration: 800,
                    yoyo: true,
                    repeat: -1
                });

                // Overlap detection → transition
                this.physics.add.overlap(this.player, exitZone, () => {
                    if (this._transitioning) return;
                    this._transitioning = true;

                    // Look up destination data
                    const destData = LOCATIONS[connId];
                    if (destData) {
                        // Brief fade out
                        this.cameras.main.fadeOut(300, 0, 0, 0);
                        this.cameras.main.once('camerafadeoutcomplete', () => {
                            this.scene.restart(destData);
                        });
                    } else {
                        console.warn(`Location ${connId} not found in registry`);
                        this._transitioning = false;
                    }
                });

                this.exitZones.push(exitZone);
            });
        }

        // ─── Camera follows player ───
        this.cameras.main.startFollow(this.player);
        this.cameras.main.fadeIn(300, 0, 0, 0);

        // ─── Location name toast ───
        const nameText = this.add.text(400, 30, locData.locationName.toUpperCase(), {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            fontStyle: 'bold'
        });
        nameText.setOrigin(0.5, 0.5);
        nameText.setScrollFactor(0);
        nameText.setDepth(10);
        nameText.setAlpha(0);

        // Fade in location name, then fade out
        this.tweens.add({
            targets: nameText,
            alpha: { from: 0, to: 1 },
            duration: 500,
            hold: 1500,
            yoyo: true,
            onComplete: () => nameText.destroy()
        });

        // ─── Input ───
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // ─── EventBus listeners ───
        this._onDialogueClosed = () => {
            this.canInteract = true;
        };
        EventBus.on('dialogue-closed', this._onDialogueClosed);

        this._onLoadLocation = (newData) => {
            this.scene.restart(newData);
        };
        EventBus.on('load-location', this._onLoadLocation);

        console.log(`WorldScene loaded: ${locData.locationName} (${cols}×${rows}, ${tw}px tiles)`);
    }

    update() {
        if (!this.cursors || !this.player || this._transitioning) return;

        const speed = this.locationData?.moveSpeed || 120;
        let vx = 0;
        let vy = 0;

        if (this.cursors.left.isDown) {
            vx = -speed;
            this.lastDirection = 'left';
        } else if (this.cursors.right.isDown) {
            vx = speed;
            this.lastDirection = 'right';
        }

        if (this.cursors.up.isDown) {
            vy = -speed;
            this.lastDirection = 'up';
        } else if (this.cursors.down.isDown) {
            vy = speed;
            this.lastDirection = 'down';
        }

        if (vx !== 0 && vy !== 0) {
            vx /= 1.414;
            vy /= 1.414;
        }

        this.player.body.setVelocity(vx, vy);

        if (vx !== 0 || vy !== 0) {
            this.player.anims.play(`walk-${this.lastDirection}`, true);
        } else {
            this.player.anims.stop();
        }

        // ─── NPC Patrol logic ───
        for (const npc of this.npcs) {
            if (!npc.getData('isPatrolling')) continue;

            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y, npc.x, npc.y
            );

            if (dist < 150) {
                // Player is nearby — stop patrolling, face player
                npc.body.setVelocity(0, 0);
                npc.setData('playerNearby', true);

                // Face toward the player
                const dx = this.player.x - npc.x;
                const dy = this.player.y - npc.y;
                if (Math.abs(dx) > Math.abs(dy)) {
                    npc.anims.play(dx > 0 ? `${npc.texture.key}-walk-right` : `${npc.texture.key}-walk-left`, true);
                } else {
                    npc.anims.play(dy > 0 ? `${npc.texture.key}-walk-down` : `${npc.texture.key}-walk-up`, true);
                }
            } else {
                npc.setData('playerNearby', false);

                // Patrol up/down
                const originY = npc.getData('patrolOriginY');
                const patrolDist = npc.getData('patrolDistance');
                const patrolSpeed = npc.getData('patrolSpeed');
                let dir = npc.getData('patrolDir');

                // Reverse at patrol limits
                if (npc.y >= originY + patrolDist / 2) {
                    dir = -1;
                    npc.setData('patrolDir', -1);
                } else if (npc.y <= originY - patrolDist / 2) {
                    dir = 1;
                    npc.setData('patrolDir', 1);
                }

                npc.body.setVelocityY(dir * patrolSpeed);
                npc.anims.play(
                    dir > 0 ? `${npc.texture.key}-walk-down` : `${npc.texture.key}-walk-up`,
                    true
                );
            }

            // Move the interaction zone to follow the NPC
            if (npc.interactZone) {
                npc.interactZone.setPosition(npc.x, npc.y);
                npc.interactZone.body.reset(npc.x, npc.y);
            }
        }

        // ─── Check NPC interaction ───
        const interactZones = this.npcs.map(n => n.interactZone).filter(Boolean);
        this.physics.overlap(this.player, interactZones, (player, zone) => {
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.canInteract) {
                this.canInteract = false;
                this.player.body.setVelocity(0, 0);
                this.player.anims.stop();

                const npc = this.npcs.find(n => n.interactZone === zone);
                const charId = npc ? npc.getData('characterId') : 'unknown';
                const charName = npc ? npc.getData('characterName') : 'NPC';

                this.scene.launch('DialogueScene');
                EventBus.emit('npc-interact', {
                    characterId: charId,
                    characterName: charName
                });
            }
        });
    }

    shutdown() {
        if (this._onDialogueClosed) {
            EventBus.off('dialogue-closed', this._onDialogueClosed);
        }
        if (this._onLoadLocation) {
            EventBus.off('load-location', this._onLoadLocation);
        }
    }
}
