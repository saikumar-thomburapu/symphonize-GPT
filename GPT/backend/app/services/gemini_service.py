"""
Google Gemini API integration service.
"""

import google.generativeai as genai
from typing import List, Dict, AsyncGenerator
from ..core.config import settings
from constants import DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE


class GeminiService:
    """
    Service for interacting with Google Gemini models.
    """
    
    def __init__(self):
        """Initialize Gemini API with your API key."""
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.available_models = [
            "gemini-1.5-flash",
            "gemini-1.5-pro"
        ]
    
    def _format_messages_for_gemini(self, messages: List[Dict]) -> List[Dict]:
        """
        Convert message history to Gemini format.
        
        Gemini expects: [{"role": "user", "parts": ["text"]}, {"role": "model", "parts": ["text"]}]
        We store as: [{"role": "user", "content": "text"}, {"role": "assistant", "content": "text"}]
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
        
        Returns:
            Formatted messages for Gemini API
        """
        formatted = []
        for msg in messages:
            role = "model" if msg["role"] == "assistant" else "user"
            formatted.append({
                "role": role,
                "parts": [msg["content"]]
            })
        return formatted
    
    async def generate_response(
        self, 
        messages: List[Dict], 
        model_name: str = "gemini-1.5-flash",
        temperature: float = DEFAULT_TEMPERATURE,
        max_tokens: int = DEFAULT_MAX_TOKENS
    ) -> str:
        """
        Generate response from Gemini (non-streaming).
        
        Args:
            messages: Conversation history
            model_name: Which Gemini model to use
            temperature: Creativity level (0.0-1.0)
            max_tokens: Max response length
        
        Returns:
            Generated response text
        """
        try:
            # Initialize model
            model = genai.GenerativeModel(model_name)
            
            # Format messages for Gemini
            formatted_messages = self._format_messages_for_gemini(messages)
            
            # Generate response
            response = model.generate_content(
                formatted_messages,
                generation_config=genai.types.GenerationConfig(
                    temperature=temperature,
                    max_output_tokens=max_tokens,
                )
            )
            
            return response.text
        
        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")
    
    async def generate_response_stream(
        self, 
        messages: List[Dict], 
        model_name: str = "gemini-2.0-flash",
        temperature: float = DEFAULT_TEMPERATURE,
        max_tokens: int = DEFAULT_MAX_TOKENS
    ) -> AsyncGenerator[str, None]:
        """
        Generate streaming response from Gemini (token-by-token).
        
        This is what makes the chat feel real-time like ChatGPT!
        
        Args:
            messages: Conversation history
            model_name: Which Gemini model to use
            temperature: Creativity level
            max_tokens: Max response length
        
        Yields:
            Text chunks as they're generated
        """
        try:
            # Initialize model
            model = genai.GenerativeModel(model_name)
            
            # Format messages
            formatted_messages = self._format_messages_for_gemini(messages)
            
            # Generate streaming response
            response = model.generate_content(
                formatted_messages,
                generation_config=genai.types.GenerationConfig(
                    temperature=temperature,
                    max_output_tokens=max_tokens,
                ),
                stream=True  # Enable streaming!
            )
            
            # Yield each chunk as it arrives
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        
        except Exception as e:
            raise Exception(f"Gemini streaming error: {str(e)}")
    
    def get_available_models(self) -> List[str]:
        """
        Return list of available Gemini models.
        """
        return self.available_models


# Create singleton instance
gemini_service = GeminiService()

