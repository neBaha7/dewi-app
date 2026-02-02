"""
Dewi Backend - FastAPI Application
Dopamine-driven learning platform API
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import ingestion, facts, videos, chat
from app.core.config import settings

app = FastAPI(
    title="Dewi API",
    description="🦭🐧 Dopamine-driven learning platform backend",
    version="0.1.0",
)

# CORS middleware for React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ingestion.router, prefix="/api/v1/ingest", tags=["Ingestion"])
app.include_router(facts.router, prefix="/api/v1/facts", tags=["Atomic Facts"])
app.include_router(videos.router, prefix="/api/v1/videos", tags=["Videos"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Dewi Duo Chat"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "🦭🐧 Dewi API is running!",
        "version": "0.1.0",
        "mascots": ["seal", "penguin"],
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "api": "ok",
            "gemini": "configured" if settings.GOOGLE_API_KEY else "not configured (FREE at aistudio.google.com/apikey)",
            "elevenlabs": "configured" if settings.ELEVENLABS_API_KEY else "not configured (optional)",
        }
    }
