"""
Authentication API endpoints - Login, Signup, Token verification.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..models.user import UserSignup, UserLogin, TokenResponse, UserResponse
from ..services.supabase_service import supabase_service
from ..core.security import create_access_token, decode_access_token
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserSignup):
    """
    Register a new user account.
    
    What happens here:
    1. Check if email already exists
    2. Create user in database (password is hashed automatically)
    3. Generate JWT token
    4. Return token + user info
    
    Args:
        user_data: Email and password from signup form
    
    Returns:
        Access token and user information
    """
    try:
        # Check if user already exists
        existing_user = await supabase_service.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        new_user = await supabase_service.create_user(
            email=user_data.email,
            password=user_data.password
        )
        
        if not new_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
        
        # Create access token
        access_token = create_access_token(data={"sub": new_user["id"]})
        
        # Format response
        user_response = UserResponse(
            id=new_user["id"],
            email=new_user["email"],
            created_at=new_user["created_at"]
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signup error: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """
    Login with email and password.
    
    What happens here:
    1. Verify email exists
    2. Check password is correct
    3. Generate JWT token
    4. Return token + user info
    
    Args:
        credentials: Email and password from login form
    
    Returns:
        Access token and user information
    """
    try:
        # Verify credentials
        is_valid = await supabase_service.verify_user_password(
            credentials.email,
            credentials.password
        )
        
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Get user data
        user = await supabase_service.get_user_by_email(credentials.email)
        
        # Create access token
        access_token = create_access_token(data={"sub": user["id"]})
        
        # Format response
        user_response = UserResponse(
            id=user["id"],
            email=user["email"],
            created_at=user["created_at"]
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login error: {str(e)}"
        )


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Dependency function to get current authenticated user.
    
    This is used in other endpoints to verify user is logged in.
    Example: @router.get("/protected", dependencies=[Depends(get_current_user)])
    
    How it works:
    1. Extract token from Authorization header
    2. Decode and verify token
    3. Fetch user from database
    4. Return user data
    
    Args:
        credentials: HTTP Bearer token from request header
    
    Returns:
        User data dictionary
    """
    try:
        # Extract token
        token = credentials.credentials
        
        # Decode token
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        # Get user ID from token
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        # Fetch user from database
        user = await supabase_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        return user
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current user's information.
    
    Useful for frontend to fetch user details after login.
    
    Returns:
        Current user data
    """
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        created_at=current_user["created_at"]
    )


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Logout endpoint.
    
    Since we use JWT tokens (stateless), logout is handled on frontend
    by deleting the token. This endpoint is here for completeness.
    
    Returns:
        Success message
    """
    return {"message": "Logged out successfully"}
