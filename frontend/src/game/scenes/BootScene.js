import { Scene } from 'phaser';
import manPng from '../../assets/sprites/man.png';
import zombiePng from '../../assets/sprites/zombie.png';

export class BootScene extends Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.spritesheet('man', manPng, {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet('zombie', zombiePng, {
            frameWidth: 64,
            frameHeight: 64
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
        this.scene.start('WorldScene');
    }
}
