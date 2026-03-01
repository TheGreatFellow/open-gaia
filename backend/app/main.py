"""
FastAPI application — entry point.

Run with:
    uvicorn app.main:app --reload
    # or
    python -m app.main
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routes import world, dialogue, story, portrait, voice
from app.services.redis_cache import redis_manager
from app.services.mongo_client import mongo_manager


# ── Lifespan: connect / disconnect Redis ────────────
@asynccontextmanager
async def lifespan(application: FastAPI):
    """Startup / shutdown hook."""
    await redis_manager.connect()
    await mongo_manager.connect()
    yield
    await mongo_manager.disconnect()
    await redis_manager.disconnect()


# ── App factory ─────────────────────────────────────
settings = get_settings()

app = FastAPI(
    title="Open Gaia — RPG World Engine",
    description="AI-powered RPG story game backend for the Mistral AI Hackathon",
    version="0.1.0",
    lifespan=lifespan,
)

# ── CORS — allow the Vite dev server ────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ─────────────────────────────────────────
app.include_router(world.router)
app.include_router(dialogue.router)
app.include_router(story.router)
app.include_router(portrait.router)
app.include_router(voice.router)


# ── Health check ────────────────────────────────────
@app.get("/")
async def health_check():
    return {"status": "ok", "service": "open-gaia-backend"}


# ── Dev entry-point ─────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=True,
    )
