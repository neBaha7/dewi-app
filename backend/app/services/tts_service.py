"""
ElevenLabs Text-to-Speech Service
Free tier: 10,000 credits/month (~20,000 characters)
"""

import os
import httpx
from typing import Optional
from app.core.config import settings


class TTSService:
    """Text-to-Speech service using ElevenLabs API"""
    
    BASE_URL = "https://api.elevenlabs.io/v1"
    
    # Voice IDs for Dewi Duo characters
    VOICES = {
        "seal": "EXAVITQu4vr4xnSDxMaL",      # Sarah - warm, friendly
        "penguin": "pNInz6obpgDQGcFmaJgB",   # Adam - clear, educational
    }
    
    def __init__(self):
        self.api_key = settings.ELEVENLABS_API_KEY
        self._client: Optional[httpx.AsyncClient] = None
    
    @property
    def is_available(self) -> bool:
        """Check if TTS is configured"""
        return bool(self.api_key)
    
    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create HTTP client"""
        if self._client is None:
            self._client = httpx.AsyncClient(
                base_url=self.BASE_URL,
                headers={"xi-api-key": self.api_key},
                timeout=30.0
            )
        return self._client
    
    async def text_to_speech(
        self,
        text: str,
        voice: str = "seal",
        output_path: str = None
    ) -> Optional[bytes]:
        """
        Convert text to speech using ElevenLabs.
        
        Args:
            text: Text to convert (max 5000 chars for free tier)
            voice: "seal" (warm) or "penguin" (educational)
            output_path: Optional path to save audio file
            
        Returns:
            Audio bytes (MP3 format) or None if failed
        """
        if not self.is_available:
            print("⚠️ ElevenLabs not configured. Add ELEVENLABS_API_KEY to .env")
            return None
        
        # Truncate for free tier limits
        if len(text) > 5000:
            text = text[:5000]
        
        voice_id = self.VOICES.get(voice, self.VOICES["seal"])
        
        try:
            client = await self._get_client()
            
            response = await client.post(
                f"/text-to-speech/{voice_id}",
                json={
                    "text": text,
                    "model_id": "eleven_turbo_v2_5",  # Faster, uses fewer credits
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.75,
                        "style": 0.3,
                        "use_speaker_boost": True
                    }
                }
            )
            
            if response.status_code == 200:
                audio_bytes = response.content
                
                if output_path:
                    os.makedirs(os.path.dirname(output_path), exist_ok=True)
                    with open(output_path, "wb") as f:
                        f.write(audio_bytes)
                    print(f"✅ Audio saved to {output_path}")
                
                return audio_bytes
            else:
                error = response.json() if response.text else {}
                print(f"❌ ElevenLabs error: {response.status_code} - {error}")
                return None
                
        except Exception as e:
            print(f"❌ TTS error: {e}")
            return None
    
    async def get_available_voices(self) -> list:
        """Get list of available voices"""
        if not self.is_available:
            return []
        
        try:
            client = await self._get_client()
            response = await client.get("/voices")
            
            if response.status_code == 200:
                data = response.json()
                return [
                    {"id": v["voice_id"], "name": v["name"]}
                    for v in data.get("voices", [])
                ]
            return []
        except:
            return []
    
    async def get_remaining_credits(self) -> Optional[int]:
        """Get remaining character credits"""
        if not self.is_available:
            return None
        
        try:
            client = await self._get_client()
            response = await client.get("/user/subscription")
            
            if response.status_code == 200:
                data = response.json()
                limit = data.get("character_limit", 0)
                used = data.get("character_count", 0)
                return limit - used
            return None
        except:
            return None
    
    async def close(self):
        """Close HTTP client"""
        if self._client:
            await self._client.aclose()
            self._client = None


# Singleton instance
tts_service = TTSService()
