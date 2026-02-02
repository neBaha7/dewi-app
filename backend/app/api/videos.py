"""Video Generation API Endpoints"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import uuid
import os

from app.services.claude_service import claude_service
from app.services.tts_service import tts_service
from app.services.video_service import video_service
from app.api.ingestion import extracted_facts

router = APIRouter()

# Video storage
generated_videos = {}
rendered_videos = {}


class VideoGenerateRequest(BaseModel):
    fact_id: str
    vibe: Optional[str] = "hype"  # hype, cozy, chaotic, unhinged


class VideoRenderRequest(BaseModel):
    video_id: str
    include_audio: Optional[bool] = True
    mascot_voice: Optional[str] = "seal"  # seal (warm) or penguin (educational)


@router.post("/generate")
async def generate_video(request: VideoGenerateRequest):
    """Generate a brainrot-style video script from an atomic fact."""
    
    # Get fact
    if request.fact_id not in extracted_facts:
        raise HTTPException(status_code=404, detail="Fact not found")
    
    fact = extracted_facts[request.fact_id]
    
    # Check cache
    cache_key = f"{request.fact_id}_{request.vibe}"
    if cache_key in generated_videos:
        return generated_videos[cache_key]
    
    # Generate script with AI
    script_data = await claude_service.generate_video_script(
        fact["fact"],
        request.vibe
    )
    
    video_id = str(uuid.uuid4())
    
    video = {
        "id": video_id,
        "fact_id": request.fact_id,
        "script": {
            "id": video_id,
            "fact_id": request.fact_id,
            "hook": script_data.get("hook", "Okay but like..."),
            "body": script_data.get("body", [fact["fact"]]),
            "repeat_phrase": script_data.get("repeat_phrase", fact["fact"][:40]),
            "mascot_cues": script_data.get("mascot_cues", []),
            "background": script_data.get("bg_suggestion", "subway_surfers"),
            "audio_vibe": script_data.get("audio_vibe", "phonk"),
            "duration_seconds": 15
        },
        "srs_status": fact.get("srs_status", "new"),
        "loop_count": 0,
        "vibe": request.vibe,
        "render_status": "pending",
        "ai_available": claude_service.is_available
    }
    
    # Cache
    generated_videos[cache_key] = video
    generated_videos[video_id] = video
    
    return video


@router.post("/render")
async def render_video(request: VideoRenderRequest, background_tasks: BackgroundTasks):
    """
    Render a video with audio narration.
    
    This creates an actual video file using FFmpeg and ElevenLabs TTS.
    Requires:
    - FFmpeg installed: brew install ffmpeg
    - ELEVENLABS_API_KEY in .env (optional, for narration)
    """
    if request.video_id not in generated_videos:
        raise HTTPException(status_code=404, detail="Video not found. Generate first.")
    
    video = generated_videos[request.video_id]
    script = video["script"]
    
    # Check service availability
    services_status = {
        "ffmpeg": video_service.is_available,
        "tts": tts_service.is_available,
    }
    
    render_id = str(uuid.uuid4())
    
    # Create narration text
    body_text = " ".join(script.get("body", []))
    narration = f"{script.get('hook', '')}... {body_text}. Remember: {script.get('repeat_phrase', '')}!"
    
    # Start render task
    result = {
        "render_id": render_id,
        "video_id": request.video_id,
        "status": "processing",
        "services": services_status,
        "narration_text": narration[:200] + "..." if len(narration) > 200 else narration,
    }
    
    if video_service.is_available:
        # Generate audio first if available
        audio_path = None
        if request.include_audio and tts_service.is_available:
            audio_path = f"data/audio/{render_id}.mp3"
            audio_bytes = await tts_service.text_to_speech(
                narration,
                voice=request.mascot_voice,
                output_path=audio_path
            )
            if audio_bytes:
                result["audio_generated"] = True
                result["audio_path"] = audio_path
            else:
                result["audio_generated"] = False
        
        # Create video
        video_path = await video_service.create_video(
            script=script,
            audio_path=audio_path,
            output_name=render_id
        )
        
        result["video_path"] = video_path
        result["status"] = "complete" if video_path.endswith(".mp4") else "pending_ffmpeg"
    else:
        result["status"] = "pending_ffmpeg"
        result["message"] = "Install FFmpeg: brew install ffmpeg"
        
        # Still try to generate audio
        if request.include_audio and tts_service.is_available:
            audio_path = f"data/audio/{render_id}.mp3"
            os.makedirs("data/audio", exist_ok=True)
            audio_bytes = await tts_service.text_to_speech(
                narration,
                voice=request.mascot_voice,
                output_path=audio_path
            )
            if audio_bytes:
                result["audio_generated"] = True
                result["audio_path"] = audio_path
    
    rendered_videos[render_id] = result
    return result


@router.get("/render/{render_id}/download")
async def download_rendered_video(render_id: str):
    """Download a rendered video file."""
    if render_id not in rendered_videos:
        raise HTTPException(status_code=404, detail="Render not found")
    
    render = rendered_videos[render_id]
    video_path = render.get("video_path")
    
    if not video_path or not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail="Video file not ready")
    
    return FileResponse(
        video_path,
        media_type="video/mp4",
        filename=f"dewi_video_{render_id[:8]}.mp4"
    )


@router.get("/render/{render_id}/audio")
async def download_audio(render_id: str):
    """Download the audio narration."""
    if render_id not in rendered_videos:
        raise HTTPException(status_code=404, detail="Render not found")
    
    render = rendered_videos[render_id]
    audio_path = render.get("audio_path")
    
    if not audio_path or not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail="Audio not generated")
    
    return FileResponse(
        audio_path,
        media_type="audio/mpeg",
        filename=f"dewi_narration_{render_id[:8]}.mp3"
    )


@router.post("/batch-generate")
async def batch_generate_videos(
    source_id: str,
    vibe: str = "hype",
    limit: int = 10
):
    """Generate videos for all facts from a source."""
    from app.api.ingestion import ingested_content
    
    if source_id not in ingested_content:
        raise HTTPException(status_code=404, detail="Source not found")
    
    content = ingested_content[source_id]
    fact_ids = content.get("fact_ids", [])[:limit]
    
    results = []
    for fact_id in fact_ids:
        try:
            video = await generate_video(VideoGenerateRequest(
                fact_id=fact_id,
                vibe=vibe
            ))
            results.append({
                "fact_id": fact_id,
                "video_id": video["id"],
                "hook": video["script"]["hook"],
                "status": "success"
            })
        except Exception as e:
            results.append({
                "fact_id": fact_id,
                "video_id": None,
                "status": "failed",
                "error": str(e)
            })
    
    return {
        "source_id": source_id,
        "vibe": vibe,
        "generated": len([r for r in results if r["status"] == "success"]),
        "failed": len([r for r in results if r["status"] == "failed"]),
        "results": results
    }


@router.get("/{video_id}")
async def get_video(video_id: str):
    """Get a generated video by ID."""
    if video_id not in generated_videos:
        raise HTTPException(status_code=404, detail="Video not found")
    
    return generated_videos[video_id]


@router.get("/")
async def list_videos(skip: int = 0, limit: int = 20):
    """List all generated videos."""
    unique = {}
    for video in generated_videos.values():
        if video["id"] not in unique:
            unique[video["id"]] = video
    
    videos = list(unique.values())
    
    return {
        "videos": videos[skip:skip + limit],
        "total": len(videos)
    }


@router.get("/status/services")
async def get_services_status():
    """Check status of video generation services."""
    tts_credits = await tts_service.get_remaining_credits()
    
    return {
        "ffmpeg": {
            "available": video_service.is_available,
            "install_cmd": "brew install ffmpeg" if not video_service.is_available else None
        },
        "tts": {
            "available": tts_service.is_available,
            "provider": "ElevenLabs",
            "remaining_credits": tts_credits,
            "setup_url": "https://elevenlabs.io/api" if not tts_service.is_available else None
        },
        "ai": {
            "available": claude_service.is_available,
            "provider": "Google Gemini (free)"
        }
    }
