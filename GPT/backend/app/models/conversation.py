"""
Conversation-related Pydantic models.
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ConversationCreate(BaseModel):
    """
    Create new conversation request.
    """
    title: Optional[str] = None  # If None, will auto-generate from first message
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "AI Chat with Gemini"
            }
        }


class ConversationUpdate(BaseModel):
    """
    Update conversation (e.g., change title).
    """
    title: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Updated Conversation Title"
            }
        }


class ConversationResponse(BaseModel):
    """
    Conversation response with metadata.
    """
    id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = 0
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "conv_123",
                "user_id": "user_456",
                "title": "AI Chat Session",
                "created_at": "2025-10-29T10:00:00Z",
                "updated_at": "2025-10-29T10:15:00Z",
                "message_count": 5
            }
        }


class ConversationDetail(ConversationResponse):
    """
    Conversation detail with all messages.
    """
    messages: List[dict] = []  # List of all messages in this conversation
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "conv_123",
                "user_id": "user_456",
                "title": "AI Chat Session",
                "created_at": "2025-10-29T10:00:00Z",
                "updated_at": "2025-10-29T10:15:00Z",
                "message_count": 2,
                "messages": [
                    {
                        "id": "msg_1",
                        "role": "user",
                        "content": "Hello!",
                        "created_at": "2025-10-29T10:00:00Z"
                    },
                    {
                        "id": "msg_2",
                        "role": "assistant",
                        "content": "Hi there! How can I help?",
                        "created_at": "2025-10-29T10:01:00Z"
                    }
                ]
            }
        }
