# Open Gaia — Frontend

The frontend for Open Gaia, an AI-powered RPG story game built for the Mistral AI Hackathon.

## Tech Stack
- **Framework:** React 19 + Vite
- **Game Engine:** Phaser 3
- **Styling:** Tailwind CSS v4 + Radix UI + shadcn/ui
- **State Management:** Zustand
- **Routing:** React Router DOM

## Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

## Installation

```bash
cd frontend
npm install
```

## Running the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Building for Production

```bash
npm run build
```

The compiled assets will be in the `dist` directory.

## Project Structure
- `src/components/`: React UI components (HUD, Dialogue, GameShell).
- `src/game/`: Phaser engine integration (Scenes, EventBus).
- `src/stores/`: Zustand state management.
- `src/lib/`: API services and utility functions.
