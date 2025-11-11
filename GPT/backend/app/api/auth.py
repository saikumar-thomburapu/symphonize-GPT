"""
Authentication API endpoints - Login, Signup, Token verification.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
import logging

from ..models.user import UserSignup, UserLogin, TokenResponse, UserResponse
from ..services.supabase_service import supabase_service
from ..services.email_service import email_service
from ..core.security import create_access_token, decode_access_token, get_password_hash
from ..core.config import settings
from ..utils.validators import validate_email_domain

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()
logger = logging.getLogger(__name__)

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserSignup):
    """Register a new user account."""
    try:
        existing_user = await supabase_service.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        new_user = await supabase_service.create_user(
            email=user_data.email,
            password=user_data.password
        )
        
        if not new_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
        
        access_token = create_access_token(data={"sub": new_user["id"]})
        
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
    """Login with email and password."""
    try:
        is_valid = await supabase_service.verify_user_password(
            credentials.email,
            credentials.password
        )
        
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        user = await supabase_service.get_user_by_email(credentials.email)
        access_token = create_access_token(data={"sub": user["id"]})
        
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
    """Get current authenticated user."""
    try:
        token = credentials.credentials
        payload = decode_access_token(token)
        
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
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
    """Get current user's information."""
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        created_at=current_user["created_at"]
    )

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout endpoint."""
    return {"message": "Logged out successfully"}

# ✅ FIXED: Returns specific error if email not registered
@router.post("/forgot-password")
async def forgot_password(email: str):
    """
    Request password reset email.
    Returns error if email not registered.
    """
    try:
        logger.info(f"🔔 Password reset requested for: {email}")
        
        # Validate email domain
        is_valid_domain = validate_email_domain(email)
        if not is_valid_domain:
            logger.warning(f"❌ Invalid domain: {email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only @symphonize.com, @tekworks.in, and @gmail.com emails are allowed"
            )
        
        # Check if user exists
        user = await supabase_service.get_user_by_email(email)
        
        # ✅ NEW: Return error if user not found
        if not user:
            logger.warning(f"⚠️ User not found: {email}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email not registered. Please sign up first."
            )
        
        # Generate 1-hour token
        reset_token = create_access_token(
            data={"sub": user["id"], "type": "password_reset"},
            expires_delta=timedelta(hours=1)
        )
        
        # Build reset link
        frontend_url = settings.FRONTEND_URL.rstrip('/')
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"
        
        # Send email
        user_name = email.split('@')[0].capitalize()
        await email_service.send_password_reset_email(
            recipient_email=email,
            reset_link=reset_link,
            user_name=user_name
        )
        
        logger.info(f"✅ Reset email sent to: {email}")
        
        return {
            "message": "Password reset link sent! Check your inbox and spam folder."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Forgot password error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing password reset: {str(e)}"
        )

# ✅ RESET PASSWORD ENDPOINT
@router.post("/reset-password")
async def reset_password(token: str, new_password: str):
    """
    Reset password using token.
    
    Steps:
    1. Verify token
    2. Validate password
    3. Update database
    """
    try:
        logger.info("🔔 Password reset attempt with token")
        
        # Verify token
        payload = decode_access_token(token)
        
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        # Check token type
        if payload.get("type") != "password_reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token type"
            )
        
        # Get user ID
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token payload"
            )
        
        # Validate password
        if not new_password or len(new_password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters"
            )
        
        # Get user
        user = await supabase_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Hash new password
        hashed_password = get_password_hash(new_password)
        
        # Update in database
        await supabase_service.update_user_password(user_id, hashed_password)
        
        logger.info(f"✅ Password reset successful for user: {user_id}")
        
        return {
            "message": "Password reset successfully! You can now login with your new password."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Reset password error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error resetting password: {str(e)}"
        )




















# """
# Authentication API endpoints - Login, Signup, Token verification.
# """

# from fastapi import APIRouter, HTTPException, status, Depends
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from ..models.user import UserSignup, UserLogin, TokenResponse, UserResponse
# from ..services.supabase_service import supabase_service
# from ..core.security import create_access_token, decode_access_token
# from datetime import datetime


# from ..services.email_service import email_service
# from ..utils.validators import validate_email_domain  # We'll create this

# router = APIRouter(prefix="/auth", tags=["Authentication"])
# security = HTTPBearer()


# @router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
# async def signup(user_data: UserSignup):
#     """
#     Register a new user account.
    
#     What happens here:
#     1. Check if email already exists
#     2. Create user in database (password is hashed automatically)
#     3. Generate JWT token
#     4. Return token + user info
    
#     Args:
#         user_data: Email and password from signup form
    
#     Returns:
#         Access token and user information
#     """
#     try:
#         # Check if user already exists
#         existing_user = await supabase_service.get_user_by_email(user_data.email)
#         if existing_user:
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Email already registered"
#             )
        
#         # Create new user
#         new_user = await supabase_service.create_user(
#             email=user_data.email,
#             password=user_data.password
#         )
        
#         if not new_user:
#             raise HTTPException(
#                 status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#                 detail="Failed to create user"
#             )
        
#         # Create access token
#         access_token = create_access_token(data={"sub": new_user["id"]})
        
#         # Format response
#         user_response = UserResponse(
#             id=new_user["id"],
#             email=new_user["email"],
#             created_at=new_user["created_at"]
#         )
        
#         return TokenResponse(
#             access_token=access_token,
#             token_type="bearer",
#             user=user_response
#         )
    
#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Signup error: {str(e)}"
#         )


# @router.post("/login", response_model=TokenResponse)
# async def login(credentials: UserLogin):
#     """
#     Login with email and password.
    
#     What happens here:
#     1. Verify email exists
#     2. Check password is correct
#     3. Generate JWT token
#     4. Return token + user info
    
#     Args:
#         credentials: Email and password from login form
    
#     Returns:
#         Access token and user information
#     """
#     try:
#         # Verify credentials
#         is_valid = await supabase_service.verify_user_password(
#             credentials.email,
#             credentials.password
#         )
        
#         if not is_valid:
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Invalid email or password"
#             )
        
#         # Get user data
#         user = await supabase_service.get_user_by_email(credentials.email)
        
#         # Create access token
#         access_token = create_access_token(data={"sub": user["id"]})
        
#         # Format response
#         user_response = UserResponse(
#             id=user["id"],
#             email=user["email"],
#             created_at=user["created_at"]
#         )
        
#         return TokenResponse(
#             access_token=access_token,
#             token_type="bearer",
#             user=user_response
#         )
    
#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Login error: {str(e)}"
#         )


# async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
#     """
#     Dependency function to get current authenticated user.
    
#     This is used in other endpoints to verify user is logged in.
#     Example: @router.get("/protected", dependencies=[Depends(get_current_user)])
    
#     How it works:
#     1. Extract token from Authorization header
#     2. Decode and verify token
#     3. Fetch user from database
#     4. Return user data
    
#     Args:
#         credentials: HTTP Bearer token from request header
    
#     Returns:
#         User data dictionary
#     """
#     try:
#         # Extract token
#         token = credentials.credentials
        
#         # Decode token
#         payload = decode_access_token(token)
#         if not payload:
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Invalid or expired token"
#             )
        
#         # Get user ID from token
#         user_id = payload.get("sub")
#         if not user_id:
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Invalid token payload"
#             )
        
#         # Fetch user from database
#         user = await supabase_service.get_user_by_id(user_id)
#         if not user:
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="User not found"
#             )
        
#         return user
    
#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Authentication failed"
#         )


# @router.get("/me", response_model=UserResponse)
# async def get_current_user_info(current_user: dict = Depends(get_current_user)):
#     """
#     Get current user's information.
    
#     Useful for frontend to fetch user details after login.
    
#     Returns:
#         Current user data
#     """
#     return UserResponse(
#         id=current_user["id"],
#         email=current_user["email"],
#         created_at=current_user["created_at"]
#     )


# @router.post("/logout")
# async def logout(current_user: dict = Depends(get_current_user)):
#     """
#     Logout endpoint.
    
#     Since we use JWT tokens (stateless), logout is handled on frontend
#     by deleting the token. This endpoint is here for completeness.
    
#     Returns:
#         Success message
#     """
#     return {"message": "Logged out successfully"}




# @router.post("/forgot-password")
# async def forgot_password(email: str):
#     """
#     Request password reset email - PROFESSIONAL VERSION.
    
#     What happens:
#     1. Validate email domain (only @therdsymphonize.com or @techbox.in)
#     2. Check if user exists
#     3. Generate 1-hour expiration token
#     4. Send professional reset email
#     5. Return success message
    
#     Args:
#         email: User email address
    
#     Returns:
#         Success message
#     """
#     try:
#         # ✅ VALIDATE EMAIL DOMAIN
#         is_valid_domain = validate_email_domain(email)
#         if not is_valid_domain:
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Only @therdsymphonize.com and @techbox.in emails are allowed"
#             )
        
#         # Check if user exists
#         user = await supabase_service.get_user_by_email(email)
        
#         if not user:
#             # Don't reveal if email exists (security)
#             return {
#                 "message": "If email exists, you will receive a password reset link"
#             }
        
#         # ✅ GENERATE 1-HOUR TOKEN
#         reset_token = create_access_token(
#             data={"sub": user["id"], "type": "password_reset"},
#             expires_delta=timedelta(hours=1)  # 1 hour only!
#         )
        
#         # ✅ BUILD RESET LINK
#         frontend_url = settings.FRONTEND_URL.rstrip('/')
#         reset_link = f"{frontend_url}/reset-password?token={reset_token}"
        
#         # ✅ SEND PROFESSIONAL EMAIL
#         user_name = email.split('@')[0].capitalize()
#         await email_service.send_password_reset_email(
#             recipient_email=email,
#             reset_link=reset_link,
#             user_name=user_name
#         )
        
#         logger.info(f"✅ Reset email sent to: {email}")
        
#         return {
#             "message": "If email exists, you will receive a password reset link. Check your inbox and spam folder."
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"❌ Forgot password error: {str(e)}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Error processing password reset"
#         )
