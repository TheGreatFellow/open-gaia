import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

// Hardcoded test map data (will be replaced with API data later)
const testMapData = {
    tile_map: {
        width: 20,
        height: 15,
        tilewidth: 64,
        tileheight: 64,
        layers: [
            {
                name: "ground",
                type: "tilelayer",
                width: 20,
                height: 15,
                data: [
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                ]
            },
            {
                name: "collision",
                type: "tilelayer",
                width: 20,
                height: 15,
                data: [
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                ]
            },
            {
                name: "objects",
                type: "objectgroup",
                objects: [
                    { name: "player_start", x: 192, y: 448, width: 64, height: 64 },
                    { name: "npc_spawn_1", x: 832, y: 384, width: 64, height: 64 }
                ]
            }
        ]
    }
};

// Door opening: row 6 col 8 (index 128) and row 7 col 8 (index 148) — skip wall collision
const DOOR_INDICES = new Set([6 * 20 + 8, 7 * 20 + 8]); // 128, 148

// Tile color map
const TILE_COLORS = {
    0: 0x4a7c59,   // grass
    1: 0x5c3a1e    // wall/structure
};
const COLLISION_COLOR = 0x8b0000; // red-brown for blocking obstacles

export class WorldScene extends Scene {
    constructor() {
        super('WorldScene');
        this.lastDirection = 'down';
        this.canInteract = true;
    }

    create() {
        const map = testMapData.tile_map;
        const cols = map.width;
        const rows = map.height;
        const tw = map.tilewidth;   // 64
        const th = map.tileheight;  // 64
        const mapW = cols * tw;     // 1280
        const mapH = rows * th;    // 960

        // Set world and camera bounds
        this.physics.world.setBounds(0, 0, mapW, mapH);
        this.cameras.main.setBounds(0, 0, mapW, mapH);

        // Find layers
        const groundLayer = map.layers.find(l => l.name === 'ground');
        const collisionLayer = map.layers.find(l => l.name === 'collision');
        const objectsLayer = map.layers.find(l => l.name === 'objects');

        // --- Render ground layer ---
        // Wall tiles (value 1) also block the player, EXCEPT the door opening
        this.wallBodies = [];
        if (groundLayer) {
            for (let i = 0; i < groundLayer.data.length; i++) {
                const tileVal = groundLayer.data[i];
                const cx = (i % cols) * tw + tw / 2;
                const cy = Math.floor(i / cols) * th + th / 2;
                const color = TILE_COLORS[tileVal] ?? TILE_COLORS[0];
                this.add.rectangle(cx, cy, tw, th, color);

                // Wall tiles block, but skip the door opening at index 148
                if (tileVal === 1 && !DOOR_INDICES.has(i)) {
                    const wallRect = this.add.rectangle(cx, cy, tw, th);
                    wallRect.setVisible(false);
                    this.physics.add.existing(wallRect, true);
                    this.wallBodies.push(wallRect);
                }
            }
        }

        // --- Render collision layer & build collision bodies ---
        this.collisionBodies = [];
        if (collisionLayer) {
            for (let i = 0; i < collisionLayer.data.length; i++) {
                const tileVal = collisionLayer.data[i];
                if (tileVal === 2) {
                    const cx = (i % cols) * tw + tw / 2;
                    const cy = Math.floor(i / cols) * th + th / 2;
                    const rect = this.add.rectangle(cx, cy, tw, th, COLLISION_COLOR);
                    this.physics.add.existing(rect, true);
                    this.collisionBodies.push(rect);
                }
            }
        }

        // --- Spawn player and NPCs from objects layer ---
        let playerX = mapW / 2;
        let playerY = mapH / 2;
        const npcSpawns = [];

        if (objectsLayer) {
            for (const obj of objectsLayer.objects) {
                if (obj.name === 'player_start') {
                    playerX = obj.x + (obj.width || tw) / 2;
                    playerY = obj.y + (obj.height || th) / 2;
                } else if (obj.name.startsWith('npc_spawn')) {
                    npcSpawns.push({
                        x: obj.x + (obj.width || tw) / 2,
                        y: obj.y + (obj.height || th) / 2
                    });
                }
            }
        }

        // --- Place the man sprite ---
        this.player = this.physics.add.sprite(playerX, playerY, 'man', 0);
        this.player.setCollideWorldBounds(true);

        // Collide player with wall tiles
        for (const wall of this.wallBodies) {
            this.physics.add.collider(this.player, wall);
        }

        // Collide player with collision obstacle tiles
        for (const body of this.collisionBodies) {
            this.physics.add.collider(this.player, body);
        }

        // --- Place zombie NPC(s) with interaction zones ---
        this.zombies = [];
        for (const spawn of npcSpawns) {
            const zombie = this.physics.add.sprite(spawn.x, spawn.y, 'zombie', 0);
            zombie.body.setImmovable(true);
            zombie.anims.play('zombie-walk-down');
            this.zombies.push(zombie);

            // Collide player with zombie
            this.physics.add.collider(this.player, zombie);

            // Interaction zone — 96×96 invisible zone around NPC
            const interactZone = this.add.zone(spawn.x, spawn.y, 96, 96);
            this.physics.add.existing(interactZone, true); // static
            this.physics.add.overlap(this.player, interactZone, () => {
                this._nearNpc = zombie;
            });

            // Store reference for clearing
            zombie.interactZone = interactZone;
        }

        // Camera follows the player
        this.cameras.main.startFollow(this.player);

        // Arrow key input + space key
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Listen for dialogue-closed to re-enable interaction
        this._onDialogueClosed = () => {
            this.canInteract = true;
        };
        EventBus.on('dialogue-closed', this._onDialogueClosed);
    }

    update() {
        if (!this.cursors || !this.player) return;

        // Reset NPC proximity each frame
        this._nearNpc = null;

        const speed = 160;
        let vx = 0;
        let vy = 0;

        // Handle horizontal and vertical independently for diagonal movement
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

        // Normalize diagonal speed
        if (vx !== 0 && vy !== 0) {
            vx /= 1.414;
            vy /= 1.414;
        }

        this.player.body.setVelocity(vx, vy);

        // Play animation based on last pressed direction
        if (vx !== 0 || vy !== 0) {
            this.player.anims.play(`walk-${this.lastDirection}`, true);
        } else {
            this.player.anims.stop();
        }

        // Check for NPC interaction (space key + near NPC + can interact)
        // The overlap callback sets _nearNpc during physics step
        // We check it after physics runs via a deferred check
        this.physics.overlap(this.player, this.zombies.map(z => z.interactZone), (player, zone) => {
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.canInteract) {
                this.canInteract = false;
                this.player.body.setVelocity(0, 0);
                this.player.anims.stop();

                // Launch dialogue overlay
                this.scene.launch('DialogueScene');

                // Emit NPC interaction data via EventBus
                EventBus.emit('npc-interact', {
                    characterId: 'wren',
                    characterName: 'WREN',
                    dialogueTree: {
                        greeting: "Access denied. Human interaction protocols suspended. State your purpose.",
                        cooperative: "Analyzing your intent.",
                        resistant: "Your request is illogical.",
                        convinced: "Data transfer authorized."
                    }
                });
            }
        });
    }

    shutdown() {
        // Clean up EventBus listeners
        if (this._onDialogueClosed) {
            EventBus.off('dialogue-closed', this._onDialogueClosed);
        }
    }
}
