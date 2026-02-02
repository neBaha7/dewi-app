"""Application configuration and settings"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Google Gemini (FREE!)
    GOOGLE_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    
    # Anthropic (paid, optional fallback)
    ANTHROPIC_API_KEY: str = ""
    CLAUDE_MODEL: str = "claude-3-5-sonnet-20241022"
    
    # ElevenLabs TTS (optional)
    ELEVENLABS_API_KEY: str = ""
    
    # Vector Database (optional)
    WEAVIATE_URL: str = "http://localhost:8080"
    WEAVIATE_API_KEY: str = ""
    
    # Configuration
    MAX_UPLOAD_SIZE_MB: int = 50
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# No caching - reload every time
settings = Settings()
