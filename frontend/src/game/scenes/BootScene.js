import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class BootScene extends Scene {
    constructor() {
        super('BootScene');
    }

    create() {
        console.log("BootScene ready");
        EventBus.emit('current-scene-ready', this);
        this.scene.start('WorldScene');
    }
}
