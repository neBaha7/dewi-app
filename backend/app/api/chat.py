"""Dewi Duo Chat API Endpoints"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from app.services.claude_service import claude_service
from app.api.ingestion import extracted_facts
from app.api.videos import generated_videos

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    video_id: Optional[str] = None
    history: List[ChatMessage] = []


@router.post("/")
async def chat_with_dewi_duo(request: ChatRequest):
    """Chat with the Dewi Duo (Seal and Penguin)."""
    
    # Get context from current video
    video_context = ""
    if request.video_id and request.video_id in generated_videos:
        video = generated_videos[request.video_id]
        fact_id = video.get("fact_id")
        if fact_id and fact_id in extracted_facts:
            video_context = extracted_facts[fact_id].get("fact", "")
    
    # Convert history
    history = [{"role": m.role, "content": m.content} for m in request.history]
    
    # Get response from Claude
    response = await claude_service.chat_with_duo(
        message=request.message,
        video_context=video_context,
        history=history
    )
    
    return {
        "message": response.get("message", "Let me think about that~"),
        "mascot": response.get("mascot", "seal"),
        "mascot_emotion": response.get("emotion", "happy"),
        "suggested_questions": response.get("suggested_questions", []),
        "claude_available": claude_service.is_available
    }


@router.post("/explain")
async def explain_topic(video_id: str):
    """Get a deeper explanation of the current video's topic."""
    
    if video_id not in generated_videos:
        raise HTTPException(status_code=404, detail="Video not found")
    
    video = generated_videos[video_id]
    fact_id = video.get("fact_id")
    
    if not fact_id or fact_id not in extracted_facts:
        raise HTTPException(status_code=404, detail="Fact not found")
    
    fact = extracted_facts[fact_id]
    
    response = await claude_service.chat_with_duo(
        message=f"Can you explain this in more detail? I want to really understand: {fact['fact']}",
        video_context=fact["fact"],
        history=[]
    )
    
    return {
        "fact": fact["fact"],
        "explanation": response.get("message", ""),
        "mascot": response.get("mascot", "penguin"),
        "emotion": response.get("emotion", "studying"),
        "related_questions": response.get("suggested_questions", [])
    }


@router.post("/quiz")
async def generate_quiz(video_id: str):
    """Generate a quick quiz question about the current topic."""
    
    if video_id not in generated_videos:
        raise HTTPException(status_code=404, detail="Video not found")
    
    video = generated_videos[video_id]
    fact_id = video.get("fact_id")
    
    if not fact_id or fact_id not in extracted_facts:
        raise HTTPException(status_code=404, detail="Fact not found")
    
    fact = extracted_facts[fact_id]
    
    response = await claude_service.chat_with_duo(
        message=f"Create a quick quiz question to test my knowledge of: {fact['fact']}. Give 4 multiple choice options A, B, C, D.",
        video_context=fact["fact"],
        history=[]
    )
    
    return {
        "fact_id": fact_id,
        "fact": fact["fact"],
        "quiz_question": response.get("message", ""),
        "mascot": "penguin",
        "emotion": "determined"
    }


@router.get("/suggested-questions/{video_id}")
async def get_suggested_questions(video_id: str):
    """Get suggested follow-up questions for a video."""
    
    if video_id not in generated_videos:
        raise HTTPException(status_code=404, detail="Video not found")
    
    video = generated_videos[video_id]
    fact_id = video.get("fact_id")
    
    fact_text = ""
    keywords = []
    if fact_id and fact_id in extracted_facts:
        fact = extracted_facts[fact_id]
        fact_text = fact.get("fact", "")
        keywords = fact.get("keywords", [])
    
    keyword = keywords[0] if keywords else "this"
    
    return {
        "fact": fact_text,
        "suggestions": [
            "Why is this important to remember?",
            f"Can you explain '{keyword}' in simpler terms?",
            "How would I use this in real life?",
            "What's an easy way to remember this?",
            "Tell me a fun fact about this topic!"
        ]
    }
