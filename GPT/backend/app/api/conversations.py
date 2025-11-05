"""
Conversation management API endpoints - Create, list, update, delete conversations.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from ..models.conversation import (
    ConversationCreate,
    ConversationUpdate,
    ConversationResponse,
    ConversationDetail
)
from ..services.supabase_service import supabase_service
from ..api.auth import get_current_user

router = APIRouter(prefix="/conversations", tags=["Conversations"])


@router.post("/", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    conversation_data: ConversationCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new conversation.
    
    When user clicks "New Chat" button, this endpoint creates a new conversation.
    
    Args:
        conversation_data: Optional title for conversation
        current_user: Authenticated user
    
    Returns:
        New conversation data
    """
    try:
        conversation = await supabase_service.create_conversation(
            user_id=current_user["id"],
            title=conversation_data.title or "New Conversation"
        )
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create conversation"
            )
        
        return ConversationResponse(
            id=conversation["id"],
            user_id=conversation["user_id"],
            title=conversation["title"],
            created_at=conversation["created_at"],
            updated_at=conversation["updated_at"],
            message_count=0
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating conversation: {str(e)}"
        )


@router.get("/", response_model=List[ConversationResponse])
async def list_conversations(current_user: dict = Depends(get_current_user)):
    """
    Get all conversations for current user.
    
    This populates the sidebar with user's conversation history.
    Sorted by most recent first.
    
    Args:
        current_user: Authenticated user
    
    Returns:
        List of user's conversations
    """
    try:
        conversations = await supabase_service.get_conversations(current_user["id"])
        
        # Format response
        result = []
        for conv in conversations:
            result.append(ConversationResponse(
                id=conv["id"],
                user_id=conv["user_id"],
                title=conv["title"],
                created_at=conv["created_at"],
                updated_at=conv["updated_at"],
                message_count=len(conv.get("messages", []))
            ))
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching conversations: {str(e)}"
        )


@router.get("/{conversation_id}", response_model=ConversationDetail)
async def get_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get single conversation with all messages.
    
    When user clicks on a conversation in sidebar, this loads all details.
    
    Args:
        conversation_id: Conversation ID
        current_user: Authenticated user
    
    Returns:
        Conversation with all messages
    """
    try:
        conversation = await supabase_service.get_conversation_detail(
            conversation_id,
            current_user["id"]
        )
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        return ConversationDetail(
            id=conversation["id"],
            user_id=conversation["user_id"],
            title=conversation["title"],
            created_at=conversation["created_at"],
            updated_at=conversation["updated_at"],
            message_count=len(conversation.get("messages", [])),
            messages=conversation.get("messages", [])
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching conversation: {str(e)}"
        )


@router.patch("/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: str,
    update_data: ConversationUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update conversation (rename title).
    
    When user edits conversation title in sidebar.
    
    Args:
        conversation_id: Conversation ID
        update_data: New title
        current_user: Authenticated user
    
    Returns:
        Updated conversation
    """
    try:
        conversation = await supabase_service.update_conversation_title(
            conversation_id,
            update_data.title,
            current_user["id"]
        )
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        return ConversationResponse(
            id=conversation["id"],
            user_id=conversation["user_id"],
            title=conversation["title"],
            created_at=conversation["created_at"],
            updated_at=conversation["updated_at"]
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating conversation: {str(e)}"
        )


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete conversation and all its messages.
    
    When user clicks delete button on a conversation.
    
    Args:
        conversation_id: Conversation ID
        current_user: Authenticated user
    
    Returns:
        No content (204 status)
    """
    try:
        success = await supabase_service.delete_conversation(
            conversation_id,
            current_user["id"]
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting conversation: {str(e)}"
        )
