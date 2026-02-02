"""
AI Service for Dewi
Uses Google Gemini (FREE!) for atomic fact extraction and video script generation
"""

from typing import List, Dict, Any
import json
import re
from app.core.config import settings


class AIService:
    """Service for AI-powered features using Google Gemini (free)"""
    
    def __init__(self):
        self._client = None
    
    @property
    def client(self):
        """Get or create the Gemini client"""
        if self._client is None and settings.GOOGLE_API_KEY:
            try:
                from google import genai
                self._client = genai.Client(api_key=settings.GOOGLE_API_KEY)
                print(f"Gemini initialized with model: {settings.GEMINI_MODEL}")
            except Exception as e:
                print(f"Failed to initialize Gemini: {e}")
        return self._client
    
    @property
    def is_available(self) -> bool:
        """Check if AI is configured and available"""
        return bool(settings.GOOGLE_API_KEY)
    
    async def extract_atomic_facts(
        self, 
        text: str, 
        title: str = "Document"
    ) -> List[Dict[str, Any]]:
        """Extract atomic facts from text content using Gemini."""
        if not self.client:
            return self._mock_extract_facts(text, title)
        
        prompt = f"""Extract ATOMIC FACTS from this educational content titled "{title}".

RULES:
1. Each fact = ONE self-contained piece of knowledge
2. 10-20 words maximum per fact
3. Include 2-4 keywords for each
4. Rate complexity 1-5 (1=simple, 5=complex)

CONTENT:
{text[:6000]}

Return ONLY a JSON array (no markdown, no code blocks):
[{{"fact": "...", "keywords": ["...", "..."], "category": "...", "complexity": 2}}]"""

        try:
            response = self.client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt
            )
            content = response.text
            
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                facts = json.loads(json_match.group())
                return facts[:15]
            else:
                return self._mock_extract_facts(text, title)
                
        except Exception as e:
            print(f"Gemini API error: {e}")
            return self._mock_extract_facts(text, title)
    
    async def generate_video_script(
        self, 
        fact: str,
        vibe: str = "hype"
    ) -> Dict[str, Any]:
        """Generate a brainrot-style video script for an atomic fact."""
        if not self.client:
            return self._mock_generate_script(fact, vibe)
        
        vibe_styles = {
            "hype": "energetic, excited, 'OKAY BUT LIKE', 'NO BECAUSE'",
            "cozy": "calm, reassuring, 'hey bestie', 'we got this'",
            "chaotic": "unhinged, 'SCREAMING', 'HELP', 'NOT ME'",
            "unhinged": "maximum chaos, 'why is no one talking about this??'"
        }
        
        prompt = f"""Create a 15-second TikTok video script for this fact:
"{fact}"

STYLE: {vibe_styles.get(vibe, vibe_styles['hype'])}

Return ONLY JSON (no markdown, no code blocks):
{{
  "hook": "2-3 word attention grabber",
  "body": ["Line 1", "Line 2 EMPHASIZE keywords", "Line 3"],
  "repeat_phrase": "5-7 word memorable summary",
  "mascot_cues": [
    {{"timestamp": "0:03", "character": "seal", "action": "clapping"}},
    {{"timestamp": "0:10", "character": "penguin", "action": "dancing"}}
  ],
  "bg_suggestion": "subway_surfers",
  "audio_vibe": "phonk"
}}"""

        try:
            response = self.client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt
            )
            content = response.text
            
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return self._mock_generate_script(fact, vibe)
                
        except Exception as e:
            print(f"Gemini API error: {e}")
            return self._mock_generate_script(fact, vibe)
    
    async def chat_with_duo(
        self,
        message: str,
        video_context: str = "",
        history: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Chat with the Dewi Duo (Seal and Penguin)."""
        if not self.client:
            return self._mock_chat_response(message)
        
        is_study = any(w in message.lower() for w in ['quiz', 'test', 'explain', 'how', 'why', 'what'])
        mascot = "penguin" if is_study else "seal"
        
        context = f"\nTopic: {video_context}" if video_context else ""
        
        prompt = f"""You're {mascot.upper()} from the Dewi Duo mascots.
{'Penguin: focused, educational, uses precise terms' if mascot == 'penguin' else 'Seal: warm, encouraging, supportive'}
{context}

User message: "{message}"

Respond in 2-3 SHORT sentences. Use casual Gen Z language and 1-2 emojis.

Return ONLY JSON (no markdown):
{{"message": "...", "mascot": "{mascot}", "emotion": "happy", "suggested_questions": ["question 1?", "question 2?"]}}"""

        try:
            response = self.client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt
            )
            content = response.text
            
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return self._mock_chat_response(message)
                
        except Exception as e:
            print(f"Gemini API error: {e}")
            return self._mock_chat_response(message)
    
    def _mock_extract_facts(self, text: str, title: str) -> List[Dict[str, Any]]:
        words = text.split()
        facts = []
        chunk_size = min(30, len(words) // 3) or 15
        for i in range(0, min(len(words), chunk_size * 5), chunk_size):
            chunk = ' '.join(words[i:i+12])
            if len(chunk) > 15:
                facts.append({"fact": chunk, "keywords": words[i:i+3] if i+3 <= len(words) else ["topic"], "category": title, "complexity": 3})
        return facts[:10] if facts else [{"fact": f"Key concept from {title}", "keywords": ["learning"], "category": title, "complexity": 2}]
    
    def _mock_generate_script(self, fact: str, vibe: str) -> Dict[str, Any]:
        return {
            "hook": "Okay but like...",
            "body": [fact[:40] + "...", "This is actually SO important", "Remember this fr fr"],
            "repeat_phrase": fact[:35],
            "mascot_cues": [{"timestamp": "0:05", "character": "penguin", "action": "directing"}, {"timestamp": "0:10", "character": "seal", "action": "clapping"}],
            "bg_suggestion": "subway_surfers",
            "audio_vibe": "phonk"
        }
    
    def _mock_chat_response(self, message: str) -> Dict[str, Any]:
        return {
            "message": f"Great question! 🦭 Let me think about '{message[:25]}...'",
            "mascot": "seal",
            "emotion": "happy",
            "suggested_questions": ["Can you explain more?", "Why is this important?", "Give me a memory trick!"]
        }


# Create a fresh instance each time the module is reloaded
ai_service = AIService()
claude_service = ai_service
