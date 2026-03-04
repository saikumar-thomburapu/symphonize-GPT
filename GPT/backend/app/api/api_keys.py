"""
API Key Management Endpoints
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
import logging

from ..models.api_key import APIKeyCreate, APIKeyResponse, APIKeyCreateResponse, APIKeyListResponse
from ..services.api_key_service import api_key_service
from ..api.auth import get_current_user

router = APIRouter(prefix="/api-keys", tags=["API Keys"])
logger = logging.getLogger(__name__)


@router.post("/", response_model=APIKeyCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    key_data: APIKeyCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new API key for the authenticated user.
    
    **Important:** The full API key is only shown once during creation.
    Save it securely - you won't be able to retrieve it later!
    
    Args:
        key_data: API key creation data (name, expiration)
        current_user: Authenticated user (from JWT token)
        
    Returns:
        Full API key and key metadata
    """
    try:
        logger.info(f"🔑 Creating API key '{key_data.key_name}' for user {current_user['id']}")
        
        result = await api_key_service.create_api_key(
            user_id=current_user["id"],
            key_name=key_data.key_name,
            expires_in_days=key_data.expires_in_days
        )
        
        return APIKeyCreateResponse(
            api_key=result["api_key"],
            key_info=APIKeyResponse(**result["key_info"])
        )
    
    except Exception as e:
        logger.error(f"❌ Error creating API key: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating API key: {str(e)}"
        )


@router.get("/", response_model=APIKeyListResponse)
async def list_api_keys(current_user: dict = Depends(get_current_user)):
    """
    List all API keys for the authenticated user.
    
    Returns:
        List of API keys (without the actual key values)
    """
    try:
        logger.info(f"📋 Listing API keys for user {current_user['id']}")
        
        keys = await api_key_service.list_user_api_keys(current_user["id"])
        
        return APIKeyListResponse(
            api_keys=[APIKeyResponse(**key) for key in keys],
            total=len(keys)
        )
    
    except Exception as e:
        logger.error(f"❌ Error listing API keys: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing API keys: {str(e)}"
        )


@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_api_key(
    key_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Revoke (deactivate) an API key.
    
    Once revoked, the key can no longer be used for authentication.
    This action cannot be undone.
    
    Args:
        key_id: ID of the API key to revoke
        current_user: Authenticated user (from JWT token)
    """
    try:
        logger.info(f"🔒 Revoking API key {key_id} for user {current_user['id']}")
        
        success = await api_key_service.revoke_api_key(key_id, current_user["id"])
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API key not found or already revoked"
            )
        
        return None  # 204 No Content
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error revoking API key: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error revoking API key: {str(e)}"
        )
