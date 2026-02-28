# Open Gaia — Backend

AI-powered RPG story game backend for the Mistral AI Hackathon. Built with FastAPI, Mistral AI (Large / Small / Magistral), FLUX image generation, and Redis caching.

## File Tree

```
backend/
├── .env.example              # env var template
├── .gitignore
├── requirements.txt          # pinned deps
├── app/
│   ├── main.py               # FastAPI app, CORS, lifespan, routers
│   ├── config.py             # pydantic-settings, reads .env
│   ├── fallback_bible.py     # hardcoded Game Bible for demo safety
│   ├── models/
│   │   ├── game_bible.py     # full Pydantic v2 schema
│   │   ├── requests.py       # request bodies
│   │   └── responses.py      # response bodies
│   ├── services/
│   │   ├── mistral_client.py     # Large / Small / Magistral wrappers
│   │   ├── portrait_service.py   # FLUX batch portrait gen
│   │   └── redis_cache.py        # async Redis, degrades gracefully
│   ├── routes/
│   │   ├── world.py          # POST /api/generate-world
│   │   ├── dialogue.py       # POST /api/npc-dialogue
│   │   ├── story.py          # POST /api/branch-story
│   │   └── portrait.py       # POST /api/generate-portrait
│   └── prompts/
│       ├── world_builder.py  # Mistral Large system prompt
│       ├── npc_dialogue.py   # Mistral Small system prompt
│       └── story_branch.py   # Magistral Medium system prompt
```

## API Endpoints

| Method | Path | Model | Purpose |
|--------|------|-------|---------|
| `GET` | `/` | — | Health check |
| `POST` | `/api/generate-world` | Mistral Large | Full Game Bible + portraits |
| `POST` | `/api/npc-dialogue` | Mistral Small | Live NPC conversation |
| `POST` | `/api/branch-story` | Magistral Medium | Unexpected choice handling |
| `POST` | `/api/generate-portrait` | FLUX | Single portrait |

## How to Run

```bash
cd backend
cp .env.example .env   # add your MISTRAL_API_KEY
source venv/bin/activate
python -m app.main     # → http://localhost:8000
```

Swagger docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Verification Results

| Check | Result |
|-------|--------|
| `pip install -r requirements.txt` | ✅ All deps installed |
| Server boot (`python -m app.main`) | ✅ Uvicorn running on `0.0.0.0:8000` |
| Health check (`GET /`) | ✅ `{"status":"ok","service":"open-gaia-backend"}` |
| OpenAPI schema | ✅ All 5 endpoints listed |
| Redis unavailable | ✅ Graceful fallback, server continues |
| CORS | ✅ Configured for `http://localhost:5173` |
