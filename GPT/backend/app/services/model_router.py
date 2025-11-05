"""
Model router service - directs requests to the correct AI service.
This is the "traffic controller" that decides which AI service to use.
"""

from typing import List, Dict, AsyncGenerator
from .gemini_service import gemini_service
from .deepseek_service import deepseek_service
from .ollama_service import ollama_service
from constants import ModelTypes


class ModelRouter:
    """
    Routes chat requests to appropriate AI service based on model name.
    """
    
    def __init__(self):
        """Initialize router with all AI services."""
        self.gemini = gemini_service
        self.deepseek = deepseek_service
        self.ollama = ollama_service
    
    def _get_service_for_model(self, model_name: str):
        """
        Determine which service handles this model.
        
        Args:
            model_name: Model identifier (e.g., "gemini-1.5-flash", "llama3.2")
        
        Returns:
            Appropriate service instance
        """
        # Check if it's a Gemini model
        if model_name.startswith("gemini"):
            return self.gemini
        
        # Check if it's DeepSeek
        elif model_name.startswith("deepseek"):
            return self.deepseek
        
        # Otherwise, assume it's Ollama (llama, mistral, qwen, etc.)
        else:
            return self.ollama
    
    async def generate_response(
        self, 
        messages: List[Dict], 
        model_name: str,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> str:
        """
        Generate response using specified model.
        Automatically routes to correct service.
        
        Args:
            messages: Conversation history
            model_name: Which model to use
            temperature: Creativity level
            max_tokens: Max response length
        
        Returns:
            Generated response text
        """
        try:
            service = self._get_service_for_model(model_name)
            response = await service.generate_response(
                messages=messages,
                model_name=model_name,
                temperature=temperature,
                max_tokens=max_tokens
            )
            return response
        
        except Exception as e:
            raise Exception(f"Error generating response with {model_name}: {str(e)}")
    
    async def generate_response_stream(
        self, 
        messages: List[Dict], 
        model_name: str,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> AsyncGenerator[str, None]:
        """
        Generate streaming response using specified model.
        Automatically routes to correct service.
        
        Args:
            messages: Conversation history
            model_name: Which model to use
            temperature: Creativity level
            max_tokens: Max response length
        
        Yields:
            Text chunks as they're generated
        """
        try:
            service = self._get_service_for_model(model_name)
            
            async for chunk in service.generate_response_stream(
                messages=messages,
                model_name=model_name,
                temperature=temperature,
                max_tokens=max_tokens
            ):
                yield chunk
        
        except Exception as e:
            raise Exception(f"Error streaming response with {model_name}: {str(e)}")
    
    async def get_all_available_models(self) -> Dict[str, List[str]]:
        """
        Get all available models from all services.
        
        Returns:
            Dictionary with model lists by service:
            {
                "gemini": ["gemini-1.5-flash", "gemini-1.5-pro"],
                "deepseek": ["deepseek-v2:16b"],
                "ollama": ["llama3.2", "mistral", ...]
            }
        """
        try:
            # Get Ollama models (might be different based on what's installed)
            ollama_models = await self.ollama.list_installed_models()
            
            return {
                "gemini": self.gemini.get_available_models(),
                "deepseek": self.deepseek.get_available_models(),
                "ollama": ollama_models
            }
        
        except Exception as e:
            # If error, return defaults
            return {
                "gemini": self.gemini.get_available_models(),
                "deepseek": self.deepseek.get_available_models(),
                "ollama": self.ollama.get_available_models()
            }


# Create singleton instance
model_router = ModelRouter()
