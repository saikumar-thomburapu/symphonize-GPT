"""
API Key Pydantic models for request/response validation.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime


class APIKeyCreate(BaseModel):
    """Request model for creating a new API key."""
    key_name: str = Field(..., min_length=1, max_length=100, description="Descriptive name for the API key")
    expires_in_days: Optional[int] = Field(None, ge=1, le=365, description="Number of days until key expires (None = never)")
    
    @validator('key_name')
    def validate_key_name(cls, v):
        """Ensure key name is not empty after stripping whitespace."""
        if not v.strip():
            raise ValueError('Key name cannot be empty')
        return v.strip()


class APIKeyResponse(BaseModel):
    """Response model for API key information (without the actual key)."""
    id: str
    key_name: str
    key_prefix: str
    created_at: datetime
    expires_at: Optional[datetime]
    last_used_at: Optional[datetime]
    is_active: bool
    
    class Config:
        from_attributes = True


class APIKeyCreateResponse(BaseModel):
    """Response model when creating a new API key (includes full key - shown only once!)."""
    api_key: str = Field(..., description="Full API key - SAVE THIS! It won't be shown again")
    key_info: APIKeyResponse
    
    class Config:
        from_attributes = True


class APIKeyListResponse(BaseModel):
    """Response model for listing API keys."""
    api_keys: list[APIKeyResponse]
    total: int
