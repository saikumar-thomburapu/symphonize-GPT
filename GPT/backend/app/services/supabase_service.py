"""
Supabase database service for user and chat management.
"""

from supabase import create_client, Client
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from ..core.config import settings
from ..core.security import get_password_hash, verify_password
import uuid


class SupabaseService:
    """
    Handle all Supabase database operations.
    """
    
    def __init__(self):
        """Initialize Supabase client."""
        self.client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        self.service_client: Client = create_client(
            settings.SUPABASE_URL, 
            settings.SUPABASE_SERVICE_KEY
        )
    
    # ==================== USER OPERATIONS ====================
    
    
    async def create_user(self, email: str, password: str) -> Dict[str, Any]:
        """
        Create new user account.
        
        Args:
            email: User email
            password: User password (will be hashed)
        
        Returns:
            User data dictionary
        """
        user_id = str(uuid.uuid4())
        password_str=str(password)[:72]
        hashed_password = get_password_hash(password_str)
        
        try:
            response = self.service_client.table("users").insert({
                "id": user_id,
                "email": email,
                "password_hash": hashed_password,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }).execute()
            
            return response.data[0] if response.data else None
        except Exception as e:
            raise Exception(f"Error creating user: {str(e)}")
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Fetch user by email.
        
        Args:
            email: User email
        
        Returns:
            User data or None
        """
        try:
            response = self.service_client.table("users").select(
                "*"
            ).eq("email", email).execute()
            
            return response.data[0] if response.data else None
        except Exception as e:
            raise Exception(f"Error fetching user: {str(e)}")
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch user by ID.
        """
        try:
            response = self.service_client.table("users").select(
                "*"
            ).eq("id", user_id).execute()
            
            return response.data[0] if response.data else None
        except Exception as e:
            raise Exception(f"Error fetching user: {str(e)}")
    
    async def verify_user_password(self, email: str, password: str) -> bool:
        """
        Verify user credentials.
        
        Args:
            email: User email
            password: Plain password to verify
        
        Returns:
            True if credentials valid, False otherwise
        """
        user = await self.get_user_by_email(email)
        if not user:
            return False
        
        return verify_password(password, user.get("password_hash", ""))
    
    async def update_user_password(self, user_id: str, hashed_password: str) -> bool:
        """
        Update user's password in database.
        
        Args:
            user_id: User ID
            hashed_password: New hashed password
        
        Returns:
            True if successful
        """
        try:
            self.service_client.table("users").update({
                "password_hash": hashed_password,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", user_id).execute()
            
            return True
        except Exception as e:
            raise Exception(f"Error updating password: {str(e)}")

    # ==================== CONVERSATION OPERATIONS ====================
    
    async def create_conversation(self, user_id: str, title: Optional[str] = None) -> Dict[str, Any]:
        """
        Create new conversation for user.
        
        Args:
            user_id: User ID
            title: Conversation title (optional)
        
        Returns:
            Conversation data
        """
        conversation_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        try:
            response = self.service_client.table("conversations").insert({
                "id": conversation_id,
                "user_id": user_id,
                "title": title or "New Conversation",
                "created_at": now,
                "updated_at": now
            }).execute()
            
            return response.data[0] if response.data else None
        except Exception as e:
            raise Exception(f"Error creating conversation: {str(e)}")
    
    async def get_conversations(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get all conversations for user (most recent first).
        """
        try:
            response = self.service_client.table("conversations").select(
                "*, messages(count)"
            ).eq("user_id", user_id).order(
                "created_at", desc=True
            ).execute()
            
            return response.data if response.data else []
        except Exception as e:
            raise Exception(f"Error fetching conversations: {str(e)}")
    
    async def get_conversation_detail(self, conversation_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get single conversation with all messages.
        Includes security check - only user's own conversations.
        """
        try:
            response = self.service_client.table("conversations").select(
                "*, messages(*)"
            ).eq("id", conversation_id).eq("user_id", user_id).execute()
            
            return response.data[0] if response.data else None
        except Exception as e:
            raise Exception(f"Error fetching conversation: {str(e)}")
    
    async def update_conversation_title(self, conversation_id: str, title: str, user_id: str) -> Dict[str, Any]:
        """
        Update conversation title (with user verification).
        """
        try:
            response = self.service_client.table("conversations").update({
                "title": title,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", conversation_id).eq("user_id", user_id).execute()
            
            return response.data[0] if response.data else None
        except Exception as e:
            raise Exception(f"Error updating conversation: {str(e)}")
    
    async def delete_conversation(self, conversation_id: str, user_id: str) -> bool:
        """
        Delete conversation and all its messages.
        """
        try:
            self.service_client.table("conversations").delete().eq(
                "id", conversation_id
            ).eq("user_id", user_id).execute()
            
            return True
        except Exception as e:
            raise Exception(f"Error deleting conversation: {str(e)}")
    
    # ==================== MESSAGE OPERATIONS ====================
    
    async def save_message(
        self, 
        conversation_id: str, 
        role: str, 
        content: str, 
        model: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Save chat message to database.
        
        Args:
            conversation_id: Conversation ID
            role: "user" or "assistant"
            content: Message content
            model: AI model used (for assistant messages)
        
        Returns:
            Message data
        """
        message_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        try:
            response = self.service_client.table("messages").insert({
                "id": message_id,
                "conversation_id": conversation_id,
                "role": role,
                "content": content,
                "model": model,
                "created_at": now
            }).execute()
            
            # Update conversation's updated_at timestamp
            self.service_client.table("conversations").update({
                "updated_at":now
            }).eq("id", conversation_id).execute()
                
            return response.data[0] if response.data else None
        except Exception as e:
            raise Exception(f"Error saving message: {str(e)}")
    
    async def get_conversation_messages(self, conversation_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get messages from a conversation.
        
        Args:
            conversation_id: Conversation ID
            limit: Max number of messages to fetch
        
        Returns:
            List of messages
        """
        try:
            response = self.service_client.table("messages").select(
                "*"
            ).eq("conversation_id", conversation_id).order(
                "created_at", desc=False
            ).limit(limit).execute()
            
            return response.data if response.data else []
        except Exception as e:
            raise Exception(f"Error fetching messages: {str(e)}")
    
    # ==================== DATA CLEANUP ====================
    
    async def delete_old_user_data(self, days: int = 30) -> int:
        """
        Delete conversations and messages older than specified days.
        Runs periodically (from scheduler).
        
        Args:
            days: Number of days to retain data
        
        Returns:
            Number of records deleted
        """
        cutoff_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
        
        try:
            # Delete old messages first (due to foreign key constraints)
            self.service_client.table("messages").delete().lt(
                "created_at", cutoff_date
            ).execute()
            
            # Then delete empty conversations
            self.service_client.table("conversations").delete().lt(
                "created_at", cutoff_date
            ).execute()
            
            return 1  # Success indicator
        except Exception as e:
            raise Exception(f"Error deleting old data: {str(e)}")


# Create singleton instance
supabase_service = SupabaseService()
