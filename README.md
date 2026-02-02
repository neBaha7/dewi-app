# Dewi - Dopamine-Driven Learning Platform 🦭🐧

> "Learning that hits different." — Merging TikTok's addictive scroll with Quizlet's study power.

## Project Structure

```
dewi-app/
├── frontend/           # React Native (Expo) mobile app
├── backend/            # FastAPI Python backend
│   ├── app/
│   │   ├── api/        # API endpoints
│   │   ├── core/       # Config, settings
│   │   ├── models/     # Pydantic models
│   │   └── services/   # Business logic
│   └── data/           # Vector DB data
└── assets/
    └── mascots/        # Dewi Duo character sprites
```

## Quick Start

### Backend (FastAPI)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend (React Native)

```bash
cd frontend
npm install
npx expo start
```

## The Dewi Duo 🦭🐧

Meet your study companions:
- **Baby Seal** 🦭 — Represents *Comfort* (mint scarf)
- **Tiny Penguin** 🐧 — Represents *Focus* (lavender scarf)

## Features

- 📄 Universal content ingestion (PDF, YouTube, images, text)
- ⚛️ AI-powered atomic fact extraction
- 🎬 "Brainrot" video generation with kinetic typography
- 📱 TikTok-style infinite scroll feed
- 🧠 Invisible spaced repetition via gestures
- 💬 Context-aware AI companion chat

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React Native (Expo) |
| Backend | Python FastAPI |
| AI/LLM | Claude 3.5 Sonnet |
| TTS | ElevenLabs |
| Vector DB | Weaviate / Pinecone |

## License

MIT
