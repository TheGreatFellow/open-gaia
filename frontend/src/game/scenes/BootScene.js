import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import manPng from '../../assets/sprites/man.png';
import zombiePng from '../../assets/sprites/zombie.png';
import basechipPng from '../../assets/tilesets/basechip.png';

export class BootScene extends Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // ─── Loading bar UI ───
        const cx = this.cameras.main.width / 2;
        const cy = this.cameras.main.height / 2;

        // Dark background fill
        this.add.rectangle(cx, cy, this.cameras.main.width, this.cameras.main.height, 0x0a0a1a);

        // "LOADING..." text
        this.loadText = this.add.text(cx, cy - 30, 'LOADING...', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#44aaff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0.5);

        // Progress bar outline
        const barW = 300, barH = 12;
        this.add.rectangle(cx, cy + 10, barW + 4, barH + 4)
            .setStrokeStyle(2, 0x44aaff);

        // Progress bar fill
        const barFill = this.add.rectangle(cx - barW / 2, cy + 10, 0, barH, 0x44aaff)
            .setOrigin(0, 0.5);

        // Track loading start time for minimum display
        this._loadStart = Date.now();

        // Update bar as assets load
        this.load.on('progress', (value) => {
            barFill.width = barW * value;
        });

        this.load.on('complete', () => {
            this.loadText.setText('INITIALIZING...');
        });

        // ─── Load assets ───
        this.load.spritesheet('man', manPng, {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet('zombie', zombiePng, {
            frameWidth: 64,
            frameHeight: 64
        });
        // Tileset: 256×4256 = 8 cols × 133 rows = 1064 frames
        this.load.spritesheet('basechip', basechipPng, {
            frameWidth: 32,
            frameHeight: 32
        });
    }

    create() {
        // Create walk animations globally (only need to be created once)
        // Spritesheet layout: Row 0=up(back), Row 1=left, Row 2=down(front), Row 3=right
        this.anims.create({
            key: 'walk-up',
            frames: this.anims.generateFrameNumbers('man', { start: 0, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-left',
            frames: this.anims.generateFrameNumbers('man', { start: 9, end: 17 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-down',
            frames: this.anims.generateFrameNumbers('man', { start: 18, end: 26 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-right',
            frames: this.anims.generateFrameNumbers('man', { start: 27, end: 35 }),
            frameRate: 10,
            repeat: -1
        });

        // Zombie walk animations (same spritesheet layout)
        this.anims.create({
            key: 'zombie-walk-up',
            frames: this.anims.generateFrameNumbers('zombie', { start: 0, end: 8 }),
            frameRate: 3,
            repeat: -1
        });
        this.anims.create({
            key: 'zombie-walk-left',
            frames: this.anims.generateFrameNumbers('zombie', { start: 9, end: 17 }),
            frameRate: 3,
            repeat: -1
        });
        this.anims.create({
            key: 'zombie-walk-down',
            frames: this.anims.generateFrameNumbers('zombie', { start: 18, end: 26 }),
            frameRate: 3,
            repeat: -1
        });
        this.anims.create({
            key: 'zombie-walk-right',
            frames: this.anims.generateFrameNumbers('zombie', { start: 27, end: 35 }),
            frameRate: 3,
            repeat: -1
        });

        console.log('BootScene ready — assets loaded, animations created');

        // Ensure minimum 1.5s loading screen so textures are fully processed
        const elapsed = Date.now() - this._loadStart;
        const minDisplayMs = 1500;
        const remaining = Math.max(0, minDisplayMs - elapsed);

        this.time.delayedCall(remaining, () => {
            this.loadText.setText('READY');

            // Brief pause to show "READY" then smooth fade out
            this.time.delayedCall(300, () => {
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    EventBus.emit('boot-complete');
                    this.scene.start('WorldScene');
                });
            });
        });
    }
}
