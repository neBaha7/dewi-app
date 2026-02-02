"""
Video Assembly Service using FFmpeg
Creates brainrot-style videos from scripts
"""

import os
import subprocess
import json
import tempfile
from typing import Optional, Dict, Any, List
from pathlib import Path


class VideoService:
    """Service for assembling educational videos"""
    
    # Video settings
    WIDTH = 1080
    HEIGHT = 1920  # 9:16 portrait for TikTok
    FPS = 30
    
    # Background videos directory
    BG_VIDEOS = {
        "subway_surfers": "subway_surfers.mp4",
        "minecraft": "minecraft_parkour.mp4",
        "satisfying": "satisfying.mp4",
        "soap_cutting": "soap_cutting.mp4",
    }
    
    # FFmpeg path - use ffmpeg-full if available (has drawtext filter)
    FFMPEG_PATH = "/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg"
    
    def __init__(self):
        self.output_dir = Path("data/videos")
        self.assets_dir = Path("data/assets")
        self._ffmpeg_available: Optional[bool] = None
        
        # Check if ffmpeg-full is available, fall back to system ffmpeg
        if not Path(self.FFMPEG_PATH).exists():
            self.FFMPEG_PATH = "ffmpeg"
    
    @property
    def is_available(self) -> bool:
        """Check if FFmpeg is installed"""
        if self._ffmpeg_available is None:
            try:
                result = subprocess.run(
                    [self.FFMPEG_PATH, "-version"],
                    capture_output=True,
                    text=True
                )
                self._ffmpeg_available = result.returncode == 0
            except FileNotFoundError:
                self._ffmpeg_available = False
        return self._ffmpeg_available
    
    async def create_video(
        self,
        script: Dict[str, Any],
        audio_path: Optional[str] = None,
        output_name: str = "video"
    ) -> Optional[str]:
        """
        Create a brainrot-style video from a script.
        
        Args:
            script: Video script with hook, body, mascot_cues, etc.
            audio_path: Path to narration audio (optional)
            output_name: Base name for output file
            
        Returns:
            Path to generated video or None if failed
        """
        if not self.is_available:
            print("⚠️ FFmpeg not installed. Install with: brew install ffmpeg")
            return await self._create_placeholder_video(script, output_name)
        
        # Ensure output directory exists
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        output_path = self.output_dir / f"{output_name}.mp4"
        
        try:
            # Build the video using FFmpeg
            await self._assemble_video(script, audio_path, str(output_path))
            return str(output_path)
        except Exception as e:
            print(f"❌ Video creation error: {e}")
            return await self._create_placeholder_video(script, output_name)
    
    async def _assemble_video(
        self,
        script: Dict[str, Any],
        audio_path: Optional[str],
        output_path: str
    ):
        """Assemble video with FFmpeg using background video"""
        
        # Extract script components
        hook = script.get("hook", "Did you know?")
        body = script.get("body", ["Learning content here"])
        repeat_phrase = script.get("repeat_phrase", body[0] if body else "")
        bg_type = script.get("bg_suggestion", "subway_surfers")
        duration = 15  # Standard TikTok length
        
        # Create text overlays
        text_lines = [hook] + body + [f"🔁 {repeat_phrase}"]
        text_filter = self._build_text_filter(text_lines, duration)
        
        # Check for background video
        bg_video = self.BG_VIDEOS.get(bg_type, "subway_surfers.mp4")
        bg_path = self.assets_dir / "backgrounds" / bg_video
        
        # Build FFmpeg command
        cmd = [self.FFMPEG_PATH, "-y"]
        
        # Use background video if available, otherwise solid color
        if bg_path.exists():
            cmd.extend([
                "-stream_loop", "-1",  # Loop the background
                "-i", str(bg_path),
                "-t", str(duration),
            ])
        else:
            cmd.extend([
                "-f", "lavfi",
                "-i", f"color=c=0x667eea:s={self.WIDTH}x{self.HEIGHT}:d={duration}",
            ])
        
        # Add audio if available
        if audio_path and os.path.exists(audio_path):
            cmd.extend(["-i", audio_path])
            # Map video from input 0, audio from input 1
            cmd.extend([
                "-vf", text_filter,
                "-map", "0:v",
                "-map", "1:a",
                "-shortest",
                "-c:v", "libx264",
                "-preset", "fast",
                "-crf", "23",
                "-c:a", "aac",
                "-b:a", "128k",
                output_path
            ])
        else:
            # No audio - just video with text
            cmd.extend([
                "-vf", text_filter,
                "-c:v", "libx264",
                "-preset", "fast",
                "-crf", "23",
                output_path
            ])
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            raise Exception(f"FFmpeg error: {result.stderr}")
    
    def _build_text_filter(self, text_lines: List[str], duration: float) -> str:
        """Build FFmpeg drawtext filter for kinetic typography"""
        filters = []
        
        # Calculate timing for each line
        line_duration = duration / len(text_lines)
        
        for i, line in enumerate(text_lines):
            start_time = i * line_duration
            end_time = (i + 1) * line_duration
            
            # Escape special characters for FFmpeg
            escaped_line = line.replace("'", "'\\''").replace(":", "\\:")
            
            # Determine font size based on line length
            font_size = 72 if len(line) < 30 else 56 if len(line) < 50 else 48
            
            # Add drawtext filter
            filters.append(
                f"drawtext=text='{escaped_line}':"
                f"fontsize={font_size}:"
                f"fontcolor=white:"
                f"fontfile=/System/Library/Fonts/Helvetica.ttc:"
                f"x=(w-text_w)/2:"
                f"y=(h-text_h)/2:"
                f"enable='between(t,{start_time},{end_time})':"
                f"shadowcolor=black@0.5:"
                f"shadowx=2:shadowy=2"
            )
        
        return ",".join(filters)
    
    async def _create_placeholder_video(
        self,
        script: Dict[str, Any],
        output_name: str
    ) -> str:
        """Create a placeholder JSON when FFmpeg unavailable"""
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        placeholder = {
            "status": "pending",
            "message": "Video generation requires FFmpeg. Install with: brew install ffmpeg",
            "script": script,
            "output_name": output_name,
        }
        
        output_path = self.output_dir / f"{output_name}_pending.json"
        with open(output_path, "w") as f:
            json.dump(placeholder, f, indent=2)
        
        print(f"📝 Placeholder saved to {output_path}")
        return str(output_path)
    
    async def add_mascot_overlay(
        self,
        video_path: str,
        mascot: str,
        action: str,
        timestamp: float
    ) -> str:
        """Add mascot animation overlay to video"""
        if not self.is_available:
            return video_path
        
        # This would overlay mascot images at specific timestamps
        # For now, return original video
        return video_path
    
    async def add_background_gameplay(
        self,
        video_path: str,
        bg_type: str = "subway_surfers"
    ) -> str:
        """Add background gameplay video (split screen style)"""
        if not self.is_available:
            return video_path
        
        bg_video = self.BG_VIDEOS.get(bg_type)
        if not bg_video:
            return video_path
        
        bg_path = self.assets_dir / "backgrounds" / bg_video
        if not bg_path.exists():
            return video_path
        
        # Would create split-screen effect
        return video_path


# Singleton instance
video_service = VideoService()
