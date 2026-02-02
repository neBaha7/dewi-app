"""Content Ingestion API Endpoints"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from pydantic import BaseModel
from typing import Optional
import uuid

from app.services.claude_service import claude_service
from app.services.document_processor import document_processor

router = APIRouter()

# In-memory storage
ingested_content = {}
extracted_facts = {}


class TextIngestionRequest(BaseModel):
    text: str
    title: Optional[str] = None


class YouTubeIngestionRequest(BaseModel):
    url: str
    title: Optional[str] = None


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None)
):
    """Upload and process a PDF or image file."""
    filename = file.filename or ""
    extension = filename.split(".")[-1].lower() if "." in filename else ""
    
    if extension not in ["pdf", "png", "jpg", "jpeg"]:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {extension}")
    
    # Read file
    file_bytes = await file.read()
    
    # Extract text
    try:
        if extension == "pdf":
            text, page_count = await document_processor.extract_from_pdf(file_bytes)
            auto_title = f"PDF Document ({page_count} pages)"
        else:
            text = await document_processor.extract_from_image(file_bytes)
            auto_title = "Image Upload (OCR)"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")
    
    if not text or len(text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Could not extract enough text from file")
    
    content_id = str(uuid.uuid4())
    final_title = title or auto_title
    
    # Extract atomic facts using Claude
    facts_data = await claude_service.extract_atomic_facts(text, final_title)
    
    # Store facts
    fact_ids = []
    for fact_data in facts_data:
        fact_id = str(uuid.uuid4())
        extracted_facts[fact_id] = {
            "id": fact_id,
            "fact": fact_data.get("fact", ""),
            "keywords": fact_data.get("keywords", []),
            "category": fact_data.get("category", final_title),
            "complexity": fact_data.get("complexity", 3),
            "source_id": content_id,
            "srs_status": "new",
            "review_count": 0
        }
        fact_ids.append(fact_id)
    
    # Store content
    ingested_content[content_id] = {
        "id": content_id,
        "title": final_title,
        "content_type": extension,
        "fact_ids": fact_ids,
        "raw_text": text[:500]
    }
    
    return {
        "id": content_id,
        "title": final_title,
        "content_type": extension,
        "facts_count": len(fact_ids),
        "facts": [extracted_facts[fid] for fid in fact_ids],
        "estimated_duration_minutes": round(len(fact_ids) * 15 / 60, 1),
        "status": "complete",
        "claude_available": claude_service.is_available
    }


@router.post("/youtube")
async def ingest_youtube(request: YouTubeIngestionRequest):
    """Ingest content from a YouTube video URL."""
    try:
        text, video_id = await document_processor.extract_from_youtube(request.url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get YouTube transcript: {str(e)}")
    
    if not text or len(text.strip()) < 10:
        raise HTTPException(status_code=400, detail="No transcript available for this video")
    
    content_id = str(uuid.uuid4())
    final_title = request.title or f"YouTube: {video_id}"
    
    # Extract atomic facts
    facts_data = await claude_service.extract_atomic_facts(text, final_title)
    
    # Store facts
    fact_ids = []
    for fact_data in facts_data:
        fact_id = str(uuid.uuid4())
        extracted_facts[fact_id] = {
            "id": fact_id,
            "fact": fact_data.get("fact", ""),
            "keywords": fact_data.get("keywords", []),
            "category": fact_data.get("category", final_title),
            "complexity": fact_data.get("complexity", 3),
            "source_id": content_id,
            "srs_status": "new",
            "review_count": 0
        }
        fact_ids.append(fact_id)
    
    ingested_content[content_id] = {
        "id": content_id,
        "title": final_title,
        "content_type": "youtube",
        "url": request.url,
        "video_id": video_id,
        "fact_ids": fact_ids
    }
    
    return {
        "id": content_id,
        "title": final_title,
        "content_type": "youtube",
        "facts_count": len(fact_ids),
        "facts": [extracted_facts[fid] for fid in fact_ids],
        "estimated_duration_minutes": round(len(fact_ids) * 15 / 60, 1),
        "status": "complete",
        "claude_available": claude_service.is_available
    }


@router.post("/text")
async def ingest_text(request: TextIngestionRequest):
    """Ingest raw text content."""
    if not request.text or len(request.text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Text is too short")
    
    content_id = str(uuid.uuid4())
    final_title = request.title or "Text Input"
    
    # Extract atomic facts
    facts_data = await claude_service.extract_atomic_facts(request.text, final_title)
    
    # Store facts
    fact_ids = []
    for fact_data in facts_data:
        fact_id = str(uuid.uuid4())
        extracted_facts[fact_id] = {
            "id": fact_id,
            "fact": fact_data.get("fact", ""),
            "keywords": fact_data.get("keywords", []),
            "category": fact_data.get("category", final_title),
            "complexity": fact_data.get("complexity", 3),
            "source_id": content_id,
            "srs_status": "new",
            "review_count": 0
        }
        fact_ids.append(fact_id)
    
    ingested_content[content_id] = {
        "id": content_id,
        "title": final_title,
        "content_type": "text",
        "fact_ids": fact_ids,
        "raw_text": request.text[:500]
    }
    
    return {
        "id": content_id,
        "title": final_title,
        "content_type": "text",
        "facts_count": len(fact_ids),
        "facts": [extracted_facts[fid] for fid in fact_ids],
        "estimated_duration_minutes": round(len(fact_ids) * 15 / 60, 1),
        "status": "complete",
        "claude_available": claude_service.is_available
    }


@router.get("/{content_id}")
async def get_content(content_id: str):
    """Get details of ingested content"""
    if content_id not in ingested_content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    content = ingested_content[content_id]
    facts = [extracted_facts[fid] for fid in content.get("fact_ids", []) if fid in extracted_facts]
    
    return {**content, "facts": facts}
