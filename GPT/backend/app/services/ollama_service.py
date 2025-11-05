"""
Ollama local model integration service with Vision support.
Ollama runs models locally on your server (100% free, no API limits!).
"""

import httpx
from typing import List, Dict, AsyncGenerator
from ..core.config import settings
from constants import DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE

class OllamaService:
    """
    Service for interacting with Ollama local models including vision models.
    """
    
    def __init__(self):
        """Initialize Ollama service."""
        self.base_url = settings.OLLAMA_BASE_URL
        self.available_models = [
            "llama3.2",
            "llama3.2:1b",
            "llama3.2:3b",
            "mistral",
            "qwen2.5",
            "qwen3-vl:8b",
            "deepseek-v2:16b",
            "phi3"
        ]
        self.timeout = 180.0  # 3 minutes for local models
    
    def _extract_images_from_content(self, content):
        """
        Extract images from content array for Ollama vision models.
        
        Args:
            content: Can be string or array with text and images
            
        Returns:
            tuple: (text_content, images_list)
        """
        images = []
        text = ""
        
        if isinstance(content, str):
            text = content
        elif isinstance(content, list):
            # Extract text and images from content array
            for item in content:
                if isinstance(item, dict):
                    if item.get('type') == 'text':
                        text += item.get('text', '')
                    elif item.get('type') == 'image':
                        source = item.get('source', {})
                        if source.get('type') == 'base64':
                            images.append({
                                'media_type': source.get('media_type', 'image/jpeg'),
                                'data': source.get('data', '')
                            })
        
        return text, images
    
    def _format_messages_for_ollama(self, messages: List[Dict]) -> tuple:
        """
        Format messages for Ollama API.
        
        For vision models like Qwen3, extract images and send them separately.
        
        Args:
            messages: List of message dictionaries
        
        Returns:
            tuple: (formatted_messages, images_dict with message index as key)
        """
        formatted = []
        images_by_message = {}
        
        for idx, msg in enumerate(messages):
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            
            # Extract text and images
            text, images = self._extract_images_from_content(content)
            
            # Add formatted message
            formatted.append({
                "role": role,
                "content": text
            })
            
            # Store images if any
            if images:
                images_by_message[idx] = images
        
        return formatted, images_by_message
    
    async def generate_response(
        self, 
        messages: List[Dict], 
        model_name: str = "qwen3-vl:8b",
        temperature: float = DEFAULT_TEMPERATURE,
        max_tokens: int = DEFAULT_MAX_TOKENS
    ) -> str:
        """
        Generate response from Ollama model (non-streaming).
        
        Args:
            messages: Conversation history
            model_name: Ollama model name
            temperature: Creativity level (0.0-1.0)
            max_tokens: Max response length
        
        Returns:
            Generated response text
        """
        try:
            formatted_messages, images_by_message = self._format_messages_for_ollama(messages)
            
            # Prepare request payload
            payload = {
                "model": model_name,
                "messages": formatted_messages,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens
                }
            }
            
            # Add images to last user message if present
            if images_by_message:
                last_msg_idx = len(formatted_messages) - 1
                if last_msg_idx in images_by_message:
                    # For Ollama vision models, add images field
                    payload["messages"][last_msg_idx]["images"] = [
                        img["data"] for img in images_by_message[last_msg_idx]
                    ]
            
            # Make API request to Ollama
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/chat",
                    json=payload
                )
                response.raise_for_status()
                
                result = response.json()
                return result["message"]["content"]
        
        except httpx.TimeoutException:
            raise Exception(f"Ollama request timed out for model {model_name}")
        except httpx.HTTPStatusError as e:
            raise Exception(f"Ollama API error: {e.response.status_code}")
        except KeyError:
            raise Exception(f"Model {model_name} not found. Make sure it's installed in Ollama.")
        except Exception as e:
            raise Exception(f"Ollama error: {str(e)}")
    
    async def generate_response_stream(
        self, 
        messages: List[Dict], 
        model_name: str = "llama3.2",
        temperature: float = DEFAULT_TEMPERATURE,
        max_tokens: int = DEFAULT_MAX_TOKENS
    ) -> AsyncGenerator[str, None]:
        """
        Generate streaming response from Ollama (token-by-token).
        
        Supports vision models with images.
        
        Args:
            messages: Conversation history
            model_name: Ollama model name
            temperature: Creativity level
            max_tokens: Max response length
        
        Yields:
            Text chunks as they're generated
        """
        try:
            formatted_messages, images_by_message = self._format_messages_for_ollama(messages)
            
            # Prepare request payload
            payload = {
                "model": model_name,
                "messages": formatted_messages,
                "stream": True,  # Enable streaming
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens
                }
            }
            
            # Add images to last user message if present
            if images_by_message:
                last_msg_idx = len(formatted_messages) - 1
                if last_msg_idx in images_by_message:
                    # For Ollama vision models, add images field
                    payload["messages"][last_msg_idx]["images"] = [
                        img["data"] for img in images_by_message[last_msg_idx]
                    ]
            
            # Make streaming API request
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/api/chat",
                    json=payload
                ) as response:
                    response.raise_for_status()
                    
                    # Process streaming response
                    async for line in response.aiter_lines():
                        if line.strip():
                            try:
                                import json
                                chunk = json.loads(line)
                                
                                # Check if response is done
                                if chunk.get("done"):
                                    break
                                
                                # Extract content from chunk
                                content = chunk.get("message", {}).get("content", "")
                                if content:
                                    yield content
                            
                            except json.JSONDecodeError:
                                continue
        
        except httpx.TimeoutException:
            raise Exception(f"Ollama streaming timed out for model {model_name}")
        except httpx.HTTPStatusError as e:
            raise Exception(f"Ollama streaming error: {e.response.status_code}")
        except Exception as e:
            raise Exception(f"Ollama streaming error: {str(e)}")
    
    async def list_installed_models(self) -> List[str]:
        """
        Get list of models actually installed in Ollama.
        
        Returns:
            List of installed model names
        """
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                response.raise_for_status()
                
                result = response.json()
                models = [model["name"] for model in result.get("models", [])]
                return models
        
        except Exception as e:
            # If can't fetch, return default list
            return self.available_models
    
    def get_available_models(self) -> List[str]:
        """Return list of common Ollama models."""
        return self.available_models

# Create singleton instance
ollama_service = OllamaService()

















# """
# Ollama local model integration service.
# Ollama runs models locally on your server (100% free, no API limits!).
# """

# import httpx
# from typing import List, Dict, AsyncGenerator
# from ..core.config import settings
# from constants import DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE


# class OllamaService:
#     """
#     Service for interacting with Ollama local models.
#     """
    
#     def __init__(self):
#         """Initialize Ollama service."""
#         self.base_url = settings.OLLAMA_BASE_URL
#         self.available_models = [
#             "llama3.2",
#             "llama3.2:1b",
#             "llama3.2:3b",
#             "mistral",
#             "qwen2.5",
#             "phi3"
#         ]
#         self.timeout = 180.0  # 3 minutes for local models
    
#     def _format_messages_for_ollama(self, messages: List[Dict]) -> List[Dict]:
#         """
#         Format messages for Ollama API.
        
#         Ollama uses simple format:
#         [{"role": "user", "content": "text"}, {"role": "assistant", "content": "text"}]
        
#         Args:
#             messages: List of message dictionaries
        
#         Returns:
#             Formatted messages
#         """
#         return messages  # Already in correct format
    
#     async def generate_response(
#         self, 
#         messages: List[Dict], 
#         model_name: str = "qwen3-vl:8b",
#         temperature: float = DEFAULT_TEMPERATURE,
#         max_tokens: int = DEFAULT_MAX_TOKENS
#     ) -> str:
#         """
#         Generate response from Ollama model (non-streaming).
        
#         Args:
#             messages: Conversation history
#             model_name: Ollama model name
#             temperature: Creativity level (0.0-1.0)
#             max_tokens: Max response length
        
#         Returns:
#             Generated response text
#         """
#         try:
#             # Prepare request payload
#             payload = {
#                 "model": model_name,
#                 "messages": self._format_messages_for_ollama(messages),
#                 "stream": False,
#                 "options": {
#                     "temperature": temperature,
#                     "num_predict": max_tokens
#                 }
#             }
            
#             # Make API request to Ollama
#             async with httpx.AsyncClient(timeout=self.timeout) as client:
#                 response = await client.post(
#                     f"{self.base_url}/api/chat",
#                     json=payload
#                 )
#                 response.raise_for_status()
                
#                 result = response.json()
#                 return result["message"]["content"]
        
#         except httpx.TimeoutException:
#             raise Exception(f"Ollama request timed out for model {model_name}")
#         except httpx.HTTPStatusError as e:
#             raise Exception(f"Ollama API error: {e.response.status_code} - {e.response.text}")
#         except KeyError:
#             raise Exception(f"Model {model_name} not found. Make sure it's installed in Ollama.")
#         except Exception as e:
#             raise Exception(f"Ollama error: {str(e)}")
    
#     async def generate_response_stream(
#         self, 
#         messages: List[Dict], 
#         model_name: str = "llama3.2",
#         temperature: float = DEFAULT_TEMPERATURE,
#         max_tokens: int = DEFAULT_MAX_TOKENS
#     ) -> AsyncGenerator[str, None]:
#         """
#         Generate streaming response from Ollama (token-by-token).
        
#         Args:
#             messages: Conversation history
#             model_name: Ollama model name
#             temperature: Creativity level
#             max_tokens: Max response length
        
#         Yields:
#             Text chunks as they're generated
#         """
#         try:
#             # Prepare request payload
#             payload = {
#                 "model": model_name,
#                 "messages": self._format_messages_for_ollama(messages),
#                 "stream": True,  # Enable streaming
#                 "options": {
#                     "temperature": temperature,
#                     "num_predict": max_tokens
#                 }
#             }
            
#             # Make streaming API request
#             async with httpx.AsyncClient(timeout=self.timeout) as client:
#                 async with client.stream(
#                     "POST",
#                     f"{self.base_url}/api/chat",
#                     json=payload
#                 ) as response:
#                     response.raise_for_status()
                    
#                     # Process streaming response
#                     async for line in response.aiter_lines():
#                         if line.strip():
#                             try:
#                                 import json
#                                 chunk = json.loads(line)
                                
#                                 # Check if response is done
#                                 if chunk.get("done"):
#                                     break
                                
#                                 # Extract content from chunk
#                                 content = chunk.get("message", {}).get("content", "")
#                                 if content:
#                                     yield content
                            
#                             except json.JSONDecodeError:
#                                 continue
        
#         except httpx.TimeoutException:
#             raise Exception(f"Ollama streaming timed out for model {model_name}")
#         except httpx.HTTPStatusError as e:
#             raise Exception(f"Ollama streaming error: {e.response.status_code}")
#         except Exception as e:
#             raise Exception(f"Ollama streaming error: {str(e)}")
    
#     async def list_installed_models(self) -> List[str]:
#         """
#         Get list of models actually installed in Ollama.
#         Useful for showing only available models to user.
        
#         Returns:
#             List of installed model names
#         """
#         try:
#             async with httpx.AsyncClient(timeout=10.0) as client:
#                 response = await client.get(f"{self.base_url}/api/tags")
#                 response.raise_for_status()
                
#                 result = response.json()
#                 models = [model["name"] for model in result.get("models", [])]
#                 return models
        
#         except Exception as e:
#             # If can't fetch, return default list
#             return self.available_models
    
#     def get_available_models(self) -> List[str]:
#         """
#         Return list of common Ollama models.
#         """
#         return self.available_models


# # Create singleton instance
# ollama_service = OllamaService()
