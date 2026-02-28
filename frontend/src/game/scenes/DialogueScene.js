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
        this.selectedIndex = 0;
        this.choiceElements = [];
    }

    create() {
        this.scene.pause('WorldScene');

        // Dim overlay — game world stays visible
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.25);
        overlay.setScrollFactor(0);
        overlay.setDepth(0);

        const data = SAMPLE_NPC_RESPONSE;
        this.selectedIndex = 0;
        this.choiceElements = [];

        // ─── NPC SPEECH (top area) ───
        this._drawNpcSpeech(data.npc_response, data.emotion, data.new_trust_level);

        // ─── PLAYER CHOICES (bottom area) ───
        this._drawPlayerChoices(data.player_choices);

        // Highlight initial selection
        this._updateSelection();

        // ─── KEYBOARD HANDLING ───
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.escKey.on('down', () => this._closeDialogue());

        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.upKey.on('down', () => {
            this.selectedIndex = Math.max(0, this.selectedIndex - 1);
            this._updateSelection();
        });
        this.downKey.on('down', () => {
            this.selectedIndex = Math.min(this.choiceElements.length - 1, this.selectedIndex + 1);
            this._updateSelection();
        });

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        const confirmChoice = () => {
            const choice = data.player_choices[this.selectedIndex];
            if (choice) {
                EventBus.emit('player-choice', choice);
                this._closeDialogue();
            }
        };
        this.spaceKey.on('down', confirmChoice);
        this.enterKey.on('down', confirmChoice);

        const numKeys = [
            Phaser.Input.Keyboard.KeyCodes.ONE,
            Phaser.Input.Keyboard.KeyCodes.TWO,
            Phaser.Input.Keyboard.KeyCodes.THREE
        ];
        numKeys.forEach((keyCode, i) => {
            if (i < data.player_choices.length) {
                const key = this.input.keyboard.addKey(keyCode);
                key.on('down', () => {
                    EventBus.emit('player-choice', data.player_choices[i]);
                    this._closeDialogue();
                });
            }
        });
    }

    // ══════════════════════════════════════════════
    //  NPC SPEECH — top section with zombie portrait
    // ══════════════════════════════════════════════
    _drawNpcSpeech(message, emotion, trustLevel) {
        const gfx = this.add.graphics();
        gfx.setScrollFactor(0);
        gfx.setDepth(10);

        // ── Full-width NPC bar background ──
        const barX = 0;
        const barY = 0;
        const barW = 800;
        const barH = 130;

        gfx.fillStyle(0x0d0d1a, 0.90);
        gfx.fillRect(barX, barY, barW, barH);

        // Accent line at bottom (emotion colored)
        gfx.fillStyle(this._emotionColor(emotion), 1);
        gfx.fillRect(barX, barH - 3, barW, 3);

        // ── NPC portrait (zombie sprite centered in border) ──
        const portSize = 72;
        const portX = 16;
        const portY = 28;
        const portrait = this.add.sprite(portX + portSize / 2, portY + portSize / 2, 'zombie', 18);
        portrait.setScrollFactor(0);
        portrait.setDepth(11);
        portrait.setDisplaySize(portSize - 8, portSize - 8);

        // Portrait frame border
        gfx.lineStyle(2, this._emotionColor(emotion), 1);
        gfx.strokeRect(portX, portY, portSize, portSize);

        // ── NPC name label ──
        const nameLabel = this.add.text(100, 12, 'WREN', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: this._emotionHex(emotion),
            fontStyle: 'bold'
        });
        nameLabel.setScrollFactor(0);
        nameLabel.setDepth(11);

        // ── Emotion tag next to name ──
        const emotionTag = this.add.text(180, 14, `[${emotion.toUpperCase()}]`, {
            fontSize: '11px',
            fontFamily: 'monospace',
            color: this._emotionHex(emotion),
            alpha: 0.7
        });
        emotionTag.setScrollFactor(0);
        emotionTag.setDepth(11);

        // ── Trust meter (right side of NPC bar) ──
        this._drawTrustMeter(gfx, 600, 14, trustLevel);

        // ── NPC dialogue text ──
        const msgText = this.add.text(100, 42, `"${message}"`, {
            fontSize: '14px',
            fontFamily: '"Courier New", monospace',
            color: '#e8e8e8',
            wordWrap: { width: 670 },
            lineSpacing: 5,
            fontStyle: 'italic'
        });
        msgText.setScrollFactor(0);
        msgText.setDepth(11);

        // ── Separator label ──
        const sepLabel = this.add.text(400, barH + 8, '— choose your response —', {
            fontSize: '10px',
            fontFamily: 'monospace',
            color: '#555555'
        });
        sepLabel.setOrigin(0.5, 0);
        sepLabel.setScrollFactor(0);
        sepLabel.setDepth(11);
    }

    // ══════════════════════════════════════════
    //  TRUST METER (inside NPC bar, top-right)
    // ══════════════════════════════════════════
    _drawTrustMeter(gfx, x, y, trustLevel) {
        const barW = 120;
        const barH = 6;
        const pct = Math.max(0, Math.min(100, trustLevel)) / 100;

        const label = this.add.text(x - 60, y, `TRUST: ${trustLevel}`, {
            fontSize: '10px',
            fontFamily: 'monospace',
            color: '#777777'
        });
        label.setScrollFactor(0);
        label.setDepth(11);

        gfx.fillStyle(0x333333, 1);
        gfx.fillRect(x, y + 2, barW, barH);

        let barColor = 0xff3333;
        if (trustLevel >= 60) barColor = 0x44cc44;
        else if (trustLevel >= 30) barColor = 0xcccc44;

        if (pct > 0) {
            gfx.fillStyle(barColor, 1);
            gfx.fillRect(x, y + 2, barW * pct, barH);
        }

        gfx.lineStyle(1, 0x555555, 1);
        gfx.strokeRect(x, y + 2, barW, barH);
    }

    // ═══════════════════════════════════════════════════
    //  PLAYER CHOICES — bottom section with man portrait
    // ═══════════════════════════════════════════════════
    _drawPlayerChoices(choices) {
        const choiceW = 680;
        const choiceH = 44;
        const gap = 6;
        const startX = 100;
        const startY = 420;
        const bgGfx = this.add.graphics();
        bgGfx.setScrollFactor(0);
        bgGfx.setDepth(10);

        // ── Player response section background ──
        const sectionH = choices.length * (choiceH + gap) + 50;
        bgGfx.fillStyle(0x0d1a0d, 0.85);
        bgGfx.fillRect(0, startY - 35, 800, sectionH);

        // Accent line at top (player color — blue)
        bgGfx.fillStyle(0x4488cc, 1);
        bgGfx.fillRect(0, startY - 35, 800, 3);

        // ── Player portrait (man sprite centered in border) ──
        const pPortSize = 72;
        const pPortX = 14;
        const pPortY = startY - 10;
        const portrait = this.add.sprite(pPortX + pPortSize / 2, pPortY + pPortSize / 2, 'man', 18);
        portrait.setScrollFactor(0);
        portrait.setDepth(11);
        portrait.setDisplaySize(pPortSize - 8, pPortSize - 8);

        // Portrait frame border  
        bgGfx.lineStyle(2, 0x4488cc, 1);
        bgGfx.strokeRect(pPortX, pPortY, pPortSize, pPortSize);

        // ── "YOU" label next to portrait ──
        const youLabel = this.add.text(startX, startY - 28, 'YOU', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#4488cc',
            fontStyle: 'bold'
        });
        youLabel.setScrollFactor(0);
        youLabel.setDepth(11);

        const pickLabel = this.add.text(startX + 40, startY - 26, '— pick a response', {
            fontSize: '10px',
            fontFamily: 'monospace',
            color: '#446688'
        });
        pickLabel.setScrollFactor(0);
        pickLabel.setDepth(11);

        // ── Choice bars ──
        choices.forEach((choice, i) => {
            const cy = startY + i * (choiceH + gap);

            const gfx = this.add.graphics();
            gfx.setScrollFactor(0);
            gfx.setDepth(10);

            gfx.fillStyle(0x1a2a3a, 0.85);
            gfx.fillRoundedRect(startX, cy, choiceW, choiceH, 4);
            gfx.lineStyle(1, 0x3a5a7a, 1);
            gfx.strokeRoundedRect(startX, cy, choiceW, choiceH, 4);

            // Number badge
            const badge = this.add.text(startX + 12, cy + choiceH / 2, `${i + 1}`, {
                fontSize: '13px',
                fontFamily: 'monospace',
                color: '#4488cc',
                fontStyle: 'bold'
            });
            badge.setOrigin(0, 0.5);
            badge.setScrollFactor(0);
            badge.setDepth(11);

            // Choice text
            const text = this.add.text(startX + 34, cy + choiceH / 2, choice.text, {
                fontSize: '12px',
                fontFamily: '"Courier New", monospace',
                color: '#cccccc',
                wordWrap: { width: choiceW - 50 },
                lineSpacing: 2
            });
            text.setOrigin(0, 0.5);
            text.setScrollFactor(0);
            text.setDepth(11);

            // Hit zone
            const hitZone = this.add.rectangle(
                startX + choiceW / 2, cy + choiceH / 2,
                choiceW, choiceH
            );
            hitZone.setScrollFactor(0);
            hitZone.setDepth(12);
            hitZone.setInteractive({ useHandCursor: true });
            hitZone.setFillStyle(0xffffff, 0);

            hitZone.on('pointerover', () => {
                this.selectedIndex = i;
                this._updateSelection();
            });

            hitZone.on('pointerdown', () => {
                EventBus.emit('player-choice', choice);
                this._closeDialogue();
            });

            this.choiceElements.push({ gfx, badge, text, hitZone, cy });
        });

        // ── Prompt below choices ──
        const lastY = startY + choices.length * (choiceH + gap);
        const prompt = this.add.text(startX + choiceW / 2, lastY + 8, '↑↓ Navigate  •  ENTER Select  •  ESC Close', {
            fontSize: '10px',
            fontFamily: 'monospace',
            color: '#444444'
        });
        prompt.setOrigin(0.5, 0);
        prompt.setScrollFactor(0);
        prompt.setDepth(11);
    }

    // ══════════════════════
    //  UPDATE SELECTION
    // ══════════════════════
    _updateSelection() {
        const startX = 100;
        const choiceW = 680;
        const choiceH = 44;

        this.choiceElements.forEach((el, i) => {
            el.gfx.clear();
            if (i === this.selectedIndex) {
                el.gfx.fillStyle(0x2a4a6a, 0.95);
                el.gfx.fillRoundedRect(startX, el.cy, choiceW, choiceH, 4);
                el.gfx.lineStyle(2, 0x66aaee, 1);
                el.gfx.strokeRoundedRect(startX, el.cy, choiceW, choiceH, 4);
                el.badge.setColor('#ffdd57');
                el.text.setColor('#ffffff');
            } else {
                el.gfx.fillStyle(0x1a2a3a, 0.85);
                el.gfx.fillRoundedRect(startX, el.cy, choiceW, choiceH, 4);
                el.gfx.lineStyle(1, 0x3a5a7a, 1);
                el.gfx.strokeRoundedRect(startX, el.cy, choiceW, choiceH, 4);
                el.badge.setColor('#4488cc');
                el.text.setColor('#cccccc');
            }
        });
    }

    // ══════════════════
    //  HELPERS
    // ══════════════════
    _emotionColor(emotion) {
        const c = { hostile: 0xff3333, suspicious: 0xff8844, wary: 0xff8844, neutral: 0xaaaaaa, cautious: 0xaaaa44, cooperative: 0x44aa44, friendly: 0x44cc44 };
        return c[emotion] || 0xaaaaaa;
    }

    _emotionHex(emotion) {
        const c = { hostile: '#ff3333', suspicious: '#ff8844', wary: '#ff8844', neutral: '#aaaaaa', cautious: '#aaaa44', cooperative: '#44aa44', friendly: '#44cc44' };
        return c[emotion] || '#aaaaaa';
    }

    _closeDialogue() {
        this.scene.resume('WorldScene');
        EventBus.emit('dialogue-closed');
        this.scene.stop('DialogueScene');
    }

    shutdown() {
        if (this.escKey) this.escKey.removeAllListeners();
        if (this.upKey) this.upKey.removeAllListeners();
        if (this.downKey) this.downKey.removeAllListeners();
        if (this.spaceKey) this.spaceKey.removeAllListeners();
        if (this.enterKey) this.enterKey.removeAllListeners();
    }
}
