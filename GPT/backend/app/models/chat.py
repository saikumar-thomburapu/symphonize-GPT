"""
Chat-related Pydantic models for message and conversation validation.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime


class ChatMessage(BaseModel):
    """Individual chat message model."""
    id: Optional[str] = None
    conversation_id: str
    role: Literal["user", "assistant", "system"]
    content: str
    model: Optional[str] = None
    created_at: Optional[datetime] = None


class ChatRequest(BaseModel):
    """Request model for sending a chat message."""
    conversation_id: str
    message: str
    model: Optional[str] = "deepseek-v2:16b"  # Default model, optional
    
    class Config:
        json_schema_extra = {
            "example": {
                "conversation_id": "conv_456",
                "message": "Hello",
                "model": "deepseek-v2:16b"
            }
        }


class ChatResponse(BaseModel):
    """Response model for chat completion."""
    message_id: str
    conversation_id: str
    role: str
    content: str
    model: str
    created_at: datetime

