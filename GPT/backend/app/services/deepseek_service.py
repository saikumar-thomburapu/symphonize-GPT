"""
DeepSeek model integration service.
Since you have deepseek-v2:16b on your GPU server, 
this connects to it via API.
"""

import httpx
from typing import List, Dict, AsyncGenerator
from ..core.config import settings
from constants import DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE


class DeepSeekService:
    """
    Service for interacting with DeepSeek models on your GPU server.
    """
    
    def __init__(self):
        """Initialize DeepSeek service with your server URL."""
        self.base_url = settings.DEEPSEEK_BASE_URL
        self.api_key = settings.DEEPSEEK_API_KEY  # Optional if your server needs auth
        self.available_models = ["deepseek-v2:16b"]
        self.timeout = 120.0  # 2 minutes timeout for large responses
    
    def _format_messages_for_deepseek(self, messages: List[Dict]) -> List[Dict]:
        """
        Format messages for DeepSeek API.
        
        DeepSeek uses OpenAI-compatible format:
        [{"role": "user", "content": "text"}, {"role": "assistant", "content": "text"}]
        
        Args:
            messages: List of message dictionaries
        
        Returns:
            Formatted messages (already in correct format!)
        """
        return messages  # Already in correct format
    
    async def generate_response(
        self, 
        messages: List[Dict], 
        model_name: str = "deepseek-v2:16b",
        temperature: float = DEFAULT_TEMPERATURE,
        max_tokens: int = DEFAULT_MAX_TOKENS
    ) -> str:
        """
        Generate response from DeepSeek (non-streaming).
        
        Args:
            messages: Conversation history
            model_name: DeepSeek model name
            temperature: Creativity level (0.0-1.0)
            max_tokens: Max response length
        
        Returns:
            Generated response text
        """
        try:
            # Prepare request payload
            payload = {
                "model": model_name,
                "messages": self._format_messages_for_deepseek(messages),
                "temperature": temperature,
                "max_tokens": max_tokens,
                "stream": False
            }
            
            # Add API key header if configured
            headers = {}
            if self.api_key:
                headers["Authorization"] = f"Bearer {self.api_key}"
            
            # Make API request to your GPU server
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/v1/chat/completions",
                    json=payload,
                    headers=headers
                )
                response.raise_for_status()
                
                result = response.json()
                return result["choices"][0]["message"]["content"]
        
        except httpx.TimeoutException:
            raise Exception("DeepSeek request timed out. Model might be slow or overloaded.")
        except httpx.HTTPStatusError as e:
            raise Exception(f"DeepSeek API error: {e.response.status_code} - {e.response.text}")
        except Exception as e:
            raise Exception(f"DeepSeek error: {str(e)}")
    
    async def generate_response_stream(
        self, 
        messages: List[Dict], 
        model_name: str = "deepseek-v2:16b",
        temperature: float = DEFAULT_TEMPERATURE,
        max_tokens: int = DEFAULT_MAX_TOKENS
    ) -> AsyncGenerator[str, None]:
        """
        Generate streaming response from DeepSeek (token-by-token).
        
        Args:
            messages: Conversation history
            model_name: DeepSeek model name
            temperature: Creativity level
            max_tokens: Max response length
        
        Yields:
            Text chunks as they're generated
        """
        try:
            # Prepare request payload
            payload = {
                "model": model_name,
                "messages": self._format_messages_for_deepseek(messages),
                "temperature": temperature,
                "max_tokens": max_tokens,
                "stream": True  # Enable streaming
            }
            
            # Add API key header if configured
            headers = {}
            if self.api_key:
                headers["Authorization"] = f"Bearer {self.api_key}"
            
            # Make streaming API request
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/v1/chat/completions",
                    json=payload,
                    headers=headers
                ) as response:
                    response.raise_for_status()
                    
                    # Process streaming response
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data = line[6:]  # Remove "data: " prefix
                            
                            if data == "[DONE]":
                                break
                            
                            try:
                                import json
                                chunk = json.loads(data)
                                content = chunk["choices"][0]["delta"].get("content", "")
                                if content:
                                    yield content
                            except json.JSONDecodeError:
                                continue
        
        except httpx.TimeoutException:
            raise Exception("DeepSeek streaming timed out.")
        except httpx.HTTPStatusError as e:
            raise Exception(f"DeepSeek streaming error: {e.response.status_code}")
        except Exception as e:
            raise Exception(f"DeepSeek streaming error: {str(e)}")
    
    def get_available_models(self) -> List[str]:
        """
        Return list of available DeepSeek models.
        """
        return self.available_models


# Create singleton instance
deepseek_service = DeepSeekService()
