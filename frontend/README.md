# Open Gaia — Frontend

The browser client for Open Gaia: a retro-arcade-themed, AI-powered RPG story game.

**Stack:** React 19 · Vite · Phaser 3 · Zustand · Tailwind CSS v4

---

## Quick Start

```bash
npm install
npm run dev        # → http://localhost:5173
```

> Requires the backend running on `http://localhost:8000`. See [`../README.md`](../README.md) for full setup.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Architecture

The frontend has two layers that communicate via an **EventBus**:

```
┌─────────────────────────────────────────────┐
│  React Layer                                │
│  ┌─────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ Sidebar │ │ Pages    │ │ GameShell    │ │
│  │         │ │ (Router) │ │ (Phaser HUD) │ │
│  └─────────┘ └──────────┘ └──────┬───────┘ │
│                                  │EventBus │
│  ┌───────────────────────────────▼───────┐  │
│  │  Phaser 3 Game Engine                 │  │
│  │  BootScene → WorldScene → DialogScene │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌────────────────────────────────────────┐  │
│  │  Zustand Store (shared state)         │  │
│  └────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### React Layer
- **Sidebar** — Persistent navigation (Home, My Worlds, Generate)
- **Pages** — Dashboard views for creating, browsing, and inspecting worlds
- **GameShell** — Bridge between React and Phaser; renders the game canvas and overlays (loading states, dialogue HUD)

### Phaser Layer
- **BootScene** — Loads assets (spritesheets, tilesets, audio), shows retro loading bar
- **WorldScene** — Main gameplay: procedurally generated tile map, player/NPC movement, collision, interaction zones
- **DialogueScene** — Full-screen NPC dialogue with typewriter animation, player choices, trust meter

### Communication
- **EventBus** (`game/EventBus.js`) — Pub/sub bridge between React components and Phaser scenes
- **Zustand** (`stores/useGameStore.js`) — Shared state (game bible, phase, current scene)

---

## Project Structure

```
src/
├── App.jsx                    # Router + sidebar layout
├── main.jsx                   # React entry point
├── index.css                  # Global styles (retro arcade theme)
│
├── components/
│   ├── Sidebar.jsx            # Navigation sidebar with retro styling
│   ├── GameShell.jsx          # React ↔ Phaser bridge + loading overlay
│   ├── Navigation.jsx         # Legacy nav (unused)
│   └── ui/                    # shadcn/ui primitives
│       ├── button.jsx
│       ├── card.jsx
│       ├── input.jsx
│       ├── label.jsx
│       └── textarea.jsx
│
├── pages/
│   ├── HomePage.jsx           # Landing: hero, how-it-works, featured games
│   ├── CreateWorld.jsx        # World generation form (story + end goal)
│   ├── BibleList.jsx          # Grid of all saved worlds
│   └── BibleDetail.jsx        # Full world bible: overview, characters, locations, tasks
│
├── game/
│   ├── main.js                # Phaser game config (scenes, physics, scale)
│   ├── PhaserGame.jsx         # React component wrapping Phaser canvas
│   ├── EventBus.js            # Custom event emitter (React ↔ Phaser)
│   ├── proceduralMapGenerator.js  # Procedural tile-map generation
│   ├── tilesetDefs.js         # Terrain tile definitions
│   └── scenes/
│       ├── BootScene.js       # Asset preload + retro loading bar
│       ├── WorldScene.js      # Gameplay: map, movement, NPC AI, interaction
│       └── DialogueScene.js   # NPC dialogue: typewriter, choices, trust meter
│
├── stores/
│   └── useGameStore.js        # Zustand: gameBible, gamePhase, etc.
│
├── lib/
│   ├── api.js                 # Axios instance (base URL config)
│   ├── services.js            # API wrappers (generateWorld, getBibles, npcDialogue, etc.)
│   └── utils.js               # Utility helpers (cn)
│
├── assets/
│   ├── retro-gaming.ttf       # RetroGaming pixel font
│   ├── Chiptronical.ogg       # Background chiptune music
│   ├── typewriter.wav         # Typewriter blip SFX
│   ├── hero_world.png         # Pixel-art hero image
│   ├── step_describe.png      # Step 1 icon (quill)
│   ├── step_generate.png      # Step 2 icon (planet)
│   ├── step_play.png          # Step 3 icon (controller)
│   ├── sprites/               # Character spritesheets
│   └── tilesets/              # Terrain tileset PNGs
│
└── data/
    └── fallback_bible.json    # Offline demo data
```

---

## Styling

The UI uses a **retro arcade** theme defined in `index.css`:

| CSS Class | Purpose |
|-----------|---------|
| `.retro-card` | Dark panel with pixel border + drop shadow |
| `.neon-btn` | Green neon glow button |
| `.neon-btn-magenta` | Magenta neon glow button |
| `.sidebar-link` / `.active` | Sidebar navigation with glow states |
| `.retro-header` | Uppercase section header with bottom border |
| `.neon-tag` | Small pill badge with neon border |
| `.pixel-sep` | Dashed pixel-art horizontal rule |
| `.scanlines` | CRT scanline overlay effect |
| `.fade-in` / `.slide-up` | Entry animations |

### Color Palette

| Variable | Hex | Usage |
|----------|-----|-------|
| `--neon-green` | `#39ff14` | Primary accent, buttons, active states |
| `--neon-magenta` | `#ff00ff` | Secondary accent, tags, highlights |
| `--neon-yellow` | `#ffe600` | Section headers, labels |
| `--neon-cyan` | `#00ffff` | Tertiary accent, location headers |
| `--neon-orange` | `#ff6600` | Task markers, terrain labels |
| `--arcade-bg` | `#0a0a0a` | Page background |
| `--arcade-panel` | `#111111` | Card backgrounds |

---

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 19.2 | UI framework |
| `phaser` | 3.90 | 2D game engine |
| `zustand` | 5.0 | State management |
| `axios` | 1.13 | HTTP client |
| `react-router-dom` | 7.13 | Client-side routing |
| `tailwindcss` | 4.2 | Utility CSS |
| `react-confetti` | 6.4 | Victory celebration effect |
