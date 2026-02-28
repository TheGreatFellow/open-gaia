import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class WorldScene extends Scene {
    constructor() {
        super('WorldScene');
    }

    create() {
        EventBus.emit('current-scene-ready', this);

        // draw a 32x32 blue rectangle as the "player" at center of canvas
        this.player = this.add.rectangle(400, 300, 32, 32, 0x3b82f6);

        // Add arcade physics to player
        this.physics.add.existing(this.player);

        // Arrow key input via this.input.keyboard.createCursorKeys()
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (!this.cursors || !this.player || !this.player.body) return;

        // move player 160px/s in arrow key direction
        const speed = 160;
        this.player.body.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(speed);
        }

        if (this.cursors.up.isDown) {
            this.player.body.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.body.setVelocityY(speed);
        }
    }
}
