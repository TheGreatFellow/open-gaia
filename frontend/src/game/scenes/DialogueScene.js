import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

// Sample NPC response data (will be replaced with API call later)
const SAMPLE_NPC_RESPONSE = {
    npc_response: "Go away. I have nothing left to say to anyone. I can't help you.",
    trust_delta: 0,
    new_trust_level: 0,
    is_convinced: false,
    emotion: "hostile",
    player_choices: [
        {
            index: 0,
            text: "I have data from WREN that proves MariCorp's crimes are even worse than you feared.",
            trust_hint: 18
        },
        {
            index: 1,
            text: "I heard you were a marine biologist. I could use your expertise on the changing migration patterns.",
            trust_hint: 5
        },
        {
            index: 2,
            text: "You're Dr. Okafor, right? The UN Tribunal wants you to testify immediately.",
            trust_hint: -7
        }
    ]
};

export class DialogueScene extends Scene {
    constructor() {
        super('DialogueScene');
    }

    create() {
        // Pause WorldScene while dialogue is active
        this.scene.pause('WorldScene');

        // Semi-transparent dark overlay
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.4);
        overlay.setScrollFactor(0);
        overlay.setDepth(0);

        // Use sample data for now
        const data = SAMPLE_NPC_RESPONSE;

        // === NPC Speech Bubble ===
        this._drawNpcBubble(data.npc_response, data.emotion);

        // === Player Choice Bubbles ===
        this._drawPlayerChoices(data.player_choices);

        // ESC key to close dialogue (fallback)
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.escKey.on('down', () => {
            this._closeDialogue();
        });
    }

    _drawNpcBubble(message, emotion) {
        const bubbleX = 400;
        const bubbleY = 100;
        const bubbleW = 680;
        const padX = 24;
        const padY = 16;

        // Measure text height first
        const tempText = this.add.text(0, 0, message, {
            fontSize: '16px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#ffffff',
            wordWrap: { width: bubbleW - padX * 2 },
            lineSpacing: 6
        });
        const textH = tempText.height;
        tempText.destroy();

        const bubbleH = textH + padY * 2 + 30; // extra for label

        // Bubble background — semi-transparent with border
        const gfx = this.add.graphics();
        gfx.setScrollFactor(0);
        gfx.setDepth(10);

        // Bubble fill
        gfx.fillStyle(0x1a1a2e, 0.85);
        gfx.fillRoundedRect(bubbleX - bubbleW / 2, bubbleY - bubbleH / 2, bubbleW, bubbleH, 12);

        // Bubble border
        gfx.lineStyle(2, this._emotionColor(emotion), 1);
        gfx.strokeRoundedRect(bubbleX - bubbleW / 2, bubbleY - bubbleH / 2, bubbleW, bubbleH, 12);

        // Speech tail (triangle pointing down-left)
        const tailX = bubbleX - 80;
        const tailY = bubbleY + bubbleH / 2;
        gfx.fillStyle(0x1a1a2e, 0.85);
        gfx.fillTriangle(tailX, tailY, tailX + 20, tailY, tailX + 5, tailY + 18);

        // Emotion label
        const emotionLabel = this.add.text(
            bubbleX - bubbleW / 2 + padX,
            bubbleY - bubbleH / 2 + 8,
            `☠ ${emotion.toUpperCase()}`,
            {
                fontSize: '10px',
                fontFamily: '"Press Start 2P", monospace',
                color: this._emotionHex(emotion)
            }
        );
        emotionLabel.setScrollFactor(0);
        emotionLabel.setDepth(11);

        // NPC message text
        const msgText = this.add.text(
            bubbleX - bubbleW / 2 + padX,
            bubbleY - bubbleH / 2 + 28,
            message,
            {
                fontSize: '14px',
                fontFamily: '"Press Start 2P", monospace',
                color: '#e0e0e0',
                wordWrap: { width: bubbleW - padX * 2 },
                lineSpacing: 6
            }
        );
        msgText.setScrollFactor(0);
        msgText.setDepth(11);
    }

    _drawPlayerChoices(choices) {
        const startY = 230;
        const choiceW = 680;
        const choiceH = 56;
        const gap = 12;
        const padX = 20;

        choices.forEach((choice, i) => {
            const cy = startY + i * (choiceH + gap);

            // Choice bubble background
            const gfx = this.add.graphics();
            gfx.setScrollFactor(0);
            gfx.setDepth(10);

            gfx.fillStyle(0x2a3a4a, 0.8);
            gfx.fillRoundedRect(400 - choiceW / 2, cy, choiceW, choiceH, 8);
            gfx.lineStyle(1.5, 0x4a8ab5, 0.6);
            gfx.strokeRoundedRect(400 - choiceW / 2, cy, choiceW, choiceH, 8);

            // Choice number badge
            const badge = this.add.text(
                400 - choiceW / 2 + 12,
                cy + choiceH / 2,
                `${i + 1}`,
                {
                    fontSize: '14px',
                    fontFamily: '"Press Start 2P", monospace',
                    color: '#4a8ab5',
                    fontStyle: 'bold'
                }
            );
            badge.setOrigin(0, 0.5);
            badge.setScrollFactor(0);
            badge.setDepth(11);

            // Choice text
            const text = this.add.text(
                400 - choiceW / 2 + padX + 24,
                cy + choiceH / 2,
                choice.text,
                {
                    fontSize: '11px',
                    fontFamily: '"Press Start 2P", monospace',
                    color: '#c8d8e8',
                    wordWrap: { width: choiceW - padX * 2 - 30 },
                    lineSpacing: 4
                }
            );
            text.setOrigin(0, 0.5);
            text.setScrollFactor(0);
            text.setDepth(11);

            // Interactive hover zone covering the choice area
            const hitZone = this.add.rectangle(
                400, cy + choiceH / 2,
                choiceW, choiceH
            );
            hitZone.setScrollFactor(0);
            hitZone.setDepth(12);
            hitZone.setInteractive({ useHandCursor: true });
            hitZone.setFillStyle(0xffffff, 0); // invisible

            // Hover effects
            hitZone.on('pointerover', () => {
                gfx.clear();
                gfx.fillStyle(0x3a5a7a, 0.9);
                gfx.fillRoundedRect(400 - choiceW / 2, cy, choiceW, choiceH, 8);
                gfx.lineStyle(2, 0x6ab8e5, 1);
                gfx.strokeRoundedRect(400 - choiceW / 2, cy, choiceW, choiceH, 8);
                text.setColor('#ffffff');
            });

            hitZone.on('pointerout', () => {
                gfx.clear();
                gfx.fillStyle(0x2a3a4a, 0.8);
                gfx.fillRoundedRect(400 - choiceW / 2, cy, choiceW, choiceH, 8);
                gfx.lineStyle(1.5, 0x4a8ab5, 0.6);
                gfx.strokeRoundedRect(400 - choiceW / 2, cy, choiceW, choiceH, 8);
                text.setColor('#c8d8e8');
            });

            // Click to select this choice
            hitZone.on('pointerdown', () => {
                EventBus.emit('player-choice', choice);
                this._closeDialogue();
            });
        });

        // Keyboard shortcuts: 1, 2, 3
        const keys = [
            Phaser.Input.Keyboard.KeyCodes.ONE,
            Phaser.Input.Keyboard.KeyCodes.TWO,
            Phaser.Input.Keyboard.KeyCodes.THREE
        ];
        keys.forEach((keyCode, i) => {
            if (i < choices.length) {
                const key = this.input.keyboard.addKey(keyCode);
                key.on('down', () => {
                    EventBus.emit('player-choice', choices[i]);
                    this._closeDialogue();
                });
            }
        });
    }

    _emotionColor(emotion) {
        const colors = {
            hostile: 0xff4444,
            suspicious: 0xff8844,
            neutral: 0x888888,
            cautious: 0xaaaa44,
            cooperative: 0x44aa44,
            friendly: 0x4488ff
        };
        return colors[emotion] || 0x888888;
    }

    _emotionHex(emotion) {
        const colors = {
            hostile: '#ff4444',
            suspicious: '#ff8844',
            neutral: '#888888',
            cautious: '#aaaa44',
            cooperative: '#44aa44',
            friendly: '#4488ff'
        };
        return colors[emotion] || '#888888';
    }

    _closeDialogue() {
        this.scene.resume('WorldScene');
        EventBus.emit('dialogue-closed');
        this.scene.stop('DialogueScene');
    }

    shutdown() {
        if (this.escKey) {
            this.escKey.removeAllListeners();
        }
    }
}
