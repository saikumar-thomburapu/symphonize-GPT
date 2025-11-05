from constants import CONTEXT_WINDOW_SIZE


"""
Context Manager - Conversation History Management
"""

import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

# Constants
CONTEXT_WINDOW_SIZE = 10


class ContextManager:
    """Manages conversation context."""
    
    @staticmethod
    def extract_messages_from_db(db_messages: List[Dict]) -> List[Dict]:
        """
        Extract role and content from database messages.
        """
        cleaned = []
        for msg in db_messages:
            cleaned.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", "")
            })
        logger.debug(f"Extracted {len(cleaned)} messages from DB")
        return cleaned
    
    @staticmethod
    def prepare_context(
        messages: List[Dict],
        max_messages: int = CONTEXT_WINDOW_SIZE,
        system_prompt: Optional[str] = None
    ) -> List[Dict]:
        """
        Prepare context for AI model.
        """
        context = []
        
        # Add system prompt first
        if system_prompt:
            context.append({
                "role": "system",
                "content": system_prompt
            })
            logger.debug(f"Added system prompt")
        
        # Add recent messages
        recent = messages[-max_messages:] if len(messages) > max_messages else messages
        context.extend(recent)
        
        logger.debug(f"Context prepared: {len(context)} total messages")
        return context
    
    @staticmethod
    def create_system_prompt(user_preferences: Optional[Dict] = None) -> str:
        """
        Create system prompt for AI.
        """
        prompt = (
            "You are DeepSeek, a helpful AI assistant created by Symphonize. "
            "Provide accurate, concise, and friendly responses. "
            "If you don't know something, admit it rather than guessing. "
            "Format code with proper syntax highlighting when possible."
        )
        return prompt


# Singleton instance
context_manager = ContextManager()

