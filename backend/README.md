# Open Gaia — Backend

AI-powered RPG story engine. Generates complete game worlds, runs live NPC conversations with voice, and dynamically branches narratives — all via REST API.

**Stack:** FastAPI · Mistral AI (Large / Small / Magistral) · FLUX · ElevenLabs · MongoDB · Redis

---

## Quick Start

```bash
cd backend
cp .env.example .env          # fill in API keys
pip install -r requirements.txt
python -m app.main             # → http://localhost:8000
```

Swagger docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## API Endpoints

| Method | Path | Model | Purpose |
|--------|------|-------|---------|
| `GET` | `/` | — | Health check |
| `POST` | `/api/generate-world` | Mistral Large + FLUX | Generate full Game Bible + NPC portraits |
| `POST` | `/api/npc-dialogue` | Mistral Small + ElevenLabs | Live NPC conversation with optional voice |
| `POST` | `/api/branch-story` | Magistral Medium | Dynamic story branching for unexpected choices |
| `POST` | `/api/generate-portrait` | FLUX | Single NPC portrait generation |

### Generate World

```bash
curl -X POST http://localhost:8000/api/generate-world \
  -H "Content-Type: application/json" \
  -d '{"story": "A detective in 1920s Cairo...", "end_goal": "Find the lost tomb"}'
```

Returns a complete Game Bible: world metadata, characters with portraits, locations, tasks, and acts.

### NPC Dialogue

```bash
curl -X POST http://localhost:8000/api/npc-dialogue \
  -H "Content-Type: application/json" \
  -d '{
    "bible_id": "...",
    "npc_id": "...",
    "player_choice": "Tell me about the artifact",
    "history": []
  }'
```

Returns NPC response text, emotion, trust delta, and optional base64 audio.

---

## AI Model Pipeline

```
User Input (story + end goal)
        │
        ▼
┌──────────────────┐    ┌──────────────────┐
│  Mistral Large   │───►│  FLUX (Pixtral)  │
│  World Building  │    │  Portrait Gen    │
└──────────────────┘    └──────────────────┘
        │                        │
        ▼                        ▼
  Game Bible JSON         NPC Portrait PNGs
  (world, NPCs,          (base64 encoded)
   locations, tasks)
        │
        ├──── Gameplay Phase ────┐
        ▼                        ▼
┌──────────────────┐    ┌──────────────────┐
│  Mistral Small   │    │  ElevenLabs TTS  │
│  NPC Dialogue    │───►│  Voice Synthesis  │
└──────────────────┘    └──────────────────┘
        │
        ▼ (unexpected choice)
┌──────────────────┐
│  Magistral Med   │
│  Story Branching │
└──────────────────┘
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MISTRAL_API_KEY` | ✅ | — | Mistral AI API key |
| `ELEVENLABS_API_KEY` | ✅ | — | ElevenLabs TTS API key |
| `MONGODB_URL` | ✅ | `mongodb://localhost:27017` | MongoDB connection string |
| `MONGODB_DB_NAME` | — | `open_gaia` | MongoDB database name |
| `REDIS_URL` | — | `redis://localhost:6379/0` | Redis URL (optional) |
| `PORT` | — | `8000` | Server port |
| `FRONTEND_ORIGIN` | — | `http://localhost:5173` | CORS allowed origin |

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `fastapi` | 0.115.0 | Web framework |
| `uvicorn` | 0.30.6 | ASGI server |
| `pydantic` | 2.9.2 | Data validation |
| `pydantic-settings` | 2.5.2 | Environment config |
| `mistralai` | 1.5.0 | Mistral AI SDK |
| `redis` | 5.2.1 | Redis client with hiredis |
| `httpx` | 0.28.1 | Async HTTP client |
| `motor` | 3.6.0 | Async MongoDB driver |
| `python-dotenv` | 1.0.1 | .env file loading |

---

## Verification

| Check | Result |
|-------|--------|
| `pip install -r requirements.txt` | ✅ All deps installed |
| Server boot (`python -m app.main`) | ✅ Uvicorn running on `0.0.0.0:8000` |
| Health check (`GET /`) | ✅ `{"status":"ok","service":"open-gaia-backend"}` |
| OpenAPI schema | ✅ All endpoints listed |
| Redis unavailable | ✅ Graceful fallback, server continues |
| MongoDB unavailable | ✅ Falls back to `fallback_bible.py` |
| CORS | ✅ Configured for `http://localhost:5173` |
