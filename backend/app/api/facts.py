"""Atomic Facts API Endpoints"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

# Import shared storage from ingestion
from app.api.ingestion import extracted_facts, ingested_content


class GestureRequest(BaseModel):
    gesture: str  # swipe, like, loop, save
    loop_count: Optional[int] = None


@router.get("/")
async def list_all_facts(
    skip: int = 0, 
    limit: int = 50,
    srs_status: Optional[str] = None
):
    """List all extracted atomic facts."""
    facts = list(extracted_facts.values())
    
    if srs_status:
        facts = [f for f in facts if f.get("srs_status") == srs_status]
    
    # Sort by priority: hard > new > learning > mastered
    priority = {"hard": 0, "new": 1, "learning": 2, "mastered": 3}
    facts.sort(key=lambda f: priority.get(f.get("srs_status", "new"), 4))
    
    return {
        "facts": facts[skip:skip + limit],
        "total": len(facts)
    }


@router.get("/feed/next")
async def get_feed_facts(count: int = 10):
    """Get the next batch of facts for the video feed using SRS algorithm."""
    all_facts = list(extracted_facts.values())
    
    if not all_facts:
        return {"facts": [], "total": 0}
    
    # Separate by status
    hard = [f for f in all_facts if f.get("srs_status") == "hard"]
    new = [f for f in all_facts if f.get("srs_status") == "new"]
    learning = [f for f in all_facts if f.get("srs_status") == "learning"]
    mastered = [f for f in all_facts if f.get("srs_status") == "mastered"]
    
    # Build feed: 40% hard, 30% new, 20% learning, 10% mastered
    feed = []
    feed.extend(hard[:max(1, int(count * 0.4))])
    feed.extend(new[:max(1, int(count * 0.3))])
    feed.extend(learning[:int(count * 0.2)])
    feed.extend(mastered[:int(count * 0.1)])
    
    # Fill remaining
    remaining = count - len(feed)
    if remaining > 0:
        unused = [f for f in all_facts if f not in feed]
        feed.extend(unused[:remaining])
    
    return {
        "facts": feed[:count],
        "total": len(all_facts)
    }


@router.get("/source/{source_id}")
async def get_facts_by_source(source_id: str):
    """Get all facts from a specific source."""
    if source_id not in ingested_content:
        raise HTTPException(status_code=404, detail="Source not found")
    
    content = ingested_content[source_id]
    fact_ids = content.get("fact_ids", [])
    facts = [extracted_facts[fid] for fid in fact_ids if fid in extracted_facts]
    
    return {
        "source_id": source_id,
        "title": content.get("title"),
        "facts": facts,
        "total": len(facts)
    }


@router.get("/{fact_id}")
async def get_fact(fact_id: str):
    """Get a specific fact by ID."""
    if fact_id not in extracted_facts:
        raise HTTPException(status_code=404, detail="Fact not found")
    
    return extracted_facts[fact_id]


@router.post("/{fact_id}/gesture")
async def record_gesture(fact_id: str, request: GestureRequest):
    """
    Record a user gesture for SRS tracking.
    
    Gestures:
    - swipe: Quick swipe away → Mark as HARD
    - like: Tap heart → Mark as LEARNING  
    - loop: Watched 3+ times → Mark as LEARNING
    - save: Long press → Mark as MASTERED
    """
    if fact_id not in extracted_facts:
        raise HTTPException(status_code=404, detail="Fact not found")
    
    fact = extracted_facts[fact_id]
    
    # Update SRS status based on gesture
    gesture_status_map = {
        "swipe": "hard",
        "like": "learning",
        "loop": "learning",
        "save": "mastered"
    }
    
    if request.gesture in gesture_status_map:
        # For loop, only upgrade if 3+ loops
        if request.gesture == "loop" and (request.loop_count or 0) < 3:
            pass  # Don't change status
        else:
            fact["srs_status"] = gesture_status_map[request.gesture]
        
        fact["review_count"] = fact.get("review_count", 0) + 1
    
    # Get mascot reaction
    reactions = {
        "swipe": {"character": "penguin", "emotion": "disappointed", "message": "Aww, we'll come back to this one~"},
        "like": {"character": "seal", "emotion": "clapping", "message": "Yay! You're getting it! 🎉"},
        "loop": {"character": "seal", "emotion": "happy", "message": "This one's sticking! Nice~"},
        "save": {"character": "penguin", "emotion": "dancing", "message": "MASTERED! You're on fire! 🔥"}
    }
    
    return {
        "fact_id": fact_id,
        "gesture": request.gesture,
        "new_status": fact["srs_status"],
        "review_count": fact["review_count"],
        "mascot_reaction": reactions.get(request.gesture, {"character": "seal", "emotion": "happy", "message": ""})
    }
