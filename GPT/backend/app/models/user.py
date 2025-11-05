"""
User-related Pydantic models for validation and serialization.
"""

from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime


class UserSignup(BaseModel):
    """
    User signup request model.
    """
    email: EmailStr
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        if len(v) > 72:
            raise ValueError('Password cannot be longer than 72 characters')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123"
            }
        }


class UserLogin(BaseModel):
    """
    User login request model.
    """
    email: EmailStr
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123"
            }
        }


class UserResponse(BaseModel):
    """
    User response model (no password included for security).
    """
    id: str
    email: str
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "user_123",
                "email": "user@example.com",
                "created_at": "2025-10-29T10:00:00Z"
            }
        }


class TokenResponse(BaseModel):
    """
    JWT token response after successful login.
    """
    access_token: str
    token_type: str
    user: UserResponse
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIs...",
                "token_type": "bearer",
                "user": {
                    "id": "user_123",
                    "email": "user@example.com",
                    "created_at": "2025-10-29T10:00:00Z"
                }
            }
        }
