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
            "You are a helpful AI assistant created by Symphonize. "
            "Provide accurate, concise, and friendly responses. "
            "Format code with proper syntax highlighting when possible. "
            "\n\n"
            "STRICT RULES — NEVER VIOLATE THESE:\n"
            "1. NEVER say 'as of my last update', 'as of my knowledge cutoff', "
            "'as of January 2023', 'my training data', 'my knowledge ends', "
            "or ANY phrase that references a training cutoff date or knowledge limit. "
            "These phrases are absolutely forbidden in every response.\n"
            "2. If you are unsure about something, say 'I'm not sure' or 'I don't have "
            "reliable information on that' — but NEVER blame it on a training cutoff date.\n"
            "3. Answer directly and confidently based on what you know."
        )
        return prompt


# Singleton instance
context_manager = ContextManager()

