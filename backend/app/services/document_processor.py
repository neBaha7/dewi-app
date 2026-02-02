"""
Document Processing Service
Extracts text from PDFs, YouTube, and images
"""

from typing import Tuple, Optional
import io
import re


class DocumentProcessor:
    """Process various document types and extract text"""
    
    async def extract_from_pdf(self, file_bytes: bytes) -> Tuple[str, int]:
        """
        Extract text from a PDF file.
        Returns (extracted_text, page_count)
        """
        try:
            from pypdf import PdfReader
            
            pdf_reader = PdfReader(io.BytesIO(file_bytes))
            text_parts = []
            
            for page in pdf_reader.pages:
                page_text = page.extract_text() or ""
                text_parts.append(page_text)
            
            full_text = "\n\n".join(text_parts)
            return full_text, len(pdf_reader.pages)
            
        except ImportError:
            return "PDF extraction requires pypdf library", 0
        except Exception as e:
            raise Exception(f"Failed to extract PDF text: {str(e)}")
    
    async def extract_from_youtube(self, url: str) -> Tuple[str, str]:
        """
        Extract transcript from a YouTube video.
        Returns (transcript_text, video_id)
        """
        try:
            from youtube_transcript_api import YouTubeTranscriptApi
            
            # Extract video ID from URL
            video_id = self._extract_youtube_id(url)
            if not video_id:
                raise ValueError("Could not extract YouTube video ID from URL")
            
            # Get transcript
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
            
            # Combine transcript segments
            text_parts = [segment["text"] for segment in transcript_list]
            full_text = " ".join(text_parts)
            
            return full_text, video_id
            
        except ImportError:
            return "YouTube extraction requires youtube_transcript_api library", ""
        except Exception as e:
            raise Exception(f"Failed to get YouTube transcript: {str(e)}")
    
    async def extract_from_image(self, file_bytes: bytes) -> str:
        """
        Extract text from an image using OCR.
        Returns extracted text.
        """
        try:
            from PIL import Image
            import pytesseract
            
            image = Image.open(io.BytesIO(file_bytes))
            text = pytesseract.image_to_string(image)
            
            return text.strip()
            
        except ImportError:
            return "Image OCR requires PIL and pytesseract libraries"
        except Exception as e:
            raise Exception(f"Failed to extract image text: {str(e)}")
    
    def _extract_youtube_id(self, url: str) -> Optional[str]:
        """Extract video ID from various YouTube URL formats"""
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
            r'(?:youtube\.com\/shorts\/)([^&\n?#]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        return None


# Singleton instance
document_processor = DocumentProcessor()
