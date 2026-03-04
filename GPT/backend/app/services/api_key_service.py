"""
API Key Service - Handles API key generation, validation, and management.
"""

import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict, List
import logging

from passlib.context import CryptContext
from ..services.supabase_service import supabase_service

logger = logging.getLogger(__name__)

# Password context for hashing API keys (same as passwords)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class APIKeyService:
    """Service for managing API keys."""
    
    def __init__(self):
        self.key_prefix = "sk_live_"
        self.key_length = 64  # Length of random part
    
    def generate_api_key(self) -> str:
        """
        Generate a cryptographically secure API key.
        
        Format: sk_live_<64-character-random-string>
        Example: sk_live_abc123def456...
        
        Returns:
            str: Generated API key
        """
        random_part = secrets.token_urlsafe(self.key_length)[:self.key_length]
        api_key = f"{self.key_prefix}{random_part}"
        logger.info(f"Generated new API key with prefix: {api_key[:12]}...")
        return api_key
    
    def hash_api_key(self, api_key: str) -> str:
        """
        Hash an API key using bcrypt (same as passwords).
        
        Args:
            api_key: Plain text API key
            
        Returns:
            str: Hashed API key
        """
        return pwd_context.hash(api_key)
    
    def verify_api_key(self, plain_key: str, hashed_key: str) -> bool:
        """
        Verify an API key against its hash.
        
        Args:
            plain_key: Plain text API key
            hashed_key: Hashed API key from database
            
        Returns:
            bool: True if key matches, False otherwise
        """
        return pwd_context.verify(plain_key, hashed_key)
    
    def extract_key_prefix(self, api_key: str) -> str:
        """
        Extract the prefix from an API key for identification.
        
        Args:
            api_key: Full API key
            
        Returns:
            str: Key prefix (first 12 characters)
        """
        return api_key[:12] if len(api_key) >= 12 else api_key
    
    async def create_api_key(
        self,
        user_id: str,
        key_name: str,
        expires_in_days: Optional[int] = None
    ) -> Dict:
        """
        Create a new API key for a user.
        
        Args:
            user_id: User ID who owns the key
            key_name: Descriptive name for the key
            expires_in_days: Number of days until expiration (None = never)
            
        Returns:
            dict: Contains 'api_key' (full key) and 'key_info' (metadata)
        """
        try:
            # Generate API key
            api_key = self.generate_api_key()
            
            # Hash the key
            key_hash = self.hash_api_key(api_key)
            
            # Extract prefix for identification
            key_prefix = self.extract_key_prefix(api_key)
            
            # Calculate expiration date
            expires_at = None
            if expires_in_days:
                expires_at = datetime.utcnow() + timedelta(days=expires_in_days)
            
            # Save to database
            key_record = await supabase_service.create_api_key_record(
                user_id=user_id,
                key_name=key_name,
                key_hash=key_hash,
                key_prefix=key_prefix,
                expires_at=expires_at
            )
            
            logger.info(f"✅ Created API key '{key_name}' for user {user_id}")
            
            return {
                "api_key": api_key,  # Full key - only shown once!
                "key_info": key_record
            }
        
        except Exception as e:
            logger.error(f"❌ Error creating API key: {str(e)}")
            raise
    
    async def validate_api_key(self, api_key: str) -> Optional[Dict]:
        """
        Validate an API key and return the associated user.
        
        Args:
            api_key: API key to validate
            
        Returns:
            dict: User data if valid, None otherwise
        """
        try:
            # Extract prefix to find potential keys
            key_prefix = self.extract_key_prefix(api_key)
            
            # Get all keys with this prefix
            potential_keys = await supabase_service.get_api_keys_by_prefix(key_prefix)
            
            if not potential_keys:
                logger.warning(f"⚠️ No API keys found with prefix: {key_prefix}")
                return None
            
            # Try to match the key
            for key_record in potential_keys:
                # Check if key is active
                if not key_record.get('is_active', False):
                    continue
                
                # Check if key is expired
                if key_record.get('expires_at'):
                    expires_at = datetime.fromisoformat(key_record['expires_at'].replace('Z', '+00:00'))
                    if datetime.utcnow().replace(tzinfo=expires_at.tzinfo) > expires_at:
                        logger.warning(f"⚠️ API key expired: {key_prefix}")
                        continue
                
                # Verify the key hash
                if self.verify_api_key(api_key, key_record['key_hash']):
                    # Update last used timestamp
                    await supabase_service.update_api_key_last_used(key_record['id'])
                    
                    # Get user data
                    user = await supabase_service.get_user_by_id(key_record['user_id'])
                    
                    logger.info(f"✅ Valid API key used: {key_prefix}... by user {user['id']}")
                    return user
            
            logger.warning(f"⚠️ Invalid API key: {key_prefix}")
            return None
        
        except Exception as e:
            logger.error(f"❌ Error validating API key: {str(e)}")
            return None
    
    async def list_user_api_keys(self, user_id: str) -> List[Dict]:
        """
        List all API keys for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            list: List of API key records (without hashes)
        """
        try:
            keys = await supabase_service.get_user_api_keys(user_id)
            logger.info(f"📋 Listed {len(keys)} API keys for user {user_id}")
            return keys
        
        except Exception as e:
            logger.error(f"❌ Error listing API keys: {str(e)}")
            raise
    
    async def revoke_api_key(self, key_id: str, user_id: str) -> bool:
        """
        Revoke (deactivate) an API key.
        
        Args:
            key_id: API key ID
            user_id: User ID (for authorization)
            
        Returns:
            bool: True if revoked successfully
        """
        try:
            success = await supabase_service.deactivate_api_key(key_id, user_id)
            
            if success:
                logger.info(f"✅ Revoked API key {key_id} for user {user_id}")
            else:
                logger.warning(f"⚠️ Failed to revoke API key {key_id}")
            
            return success
        
        except Exception as e:
            logger.error(f"❌ Error revoking API key: {str(e)}")
            raise


# Global instance
api_key_service = APIKeyService()
