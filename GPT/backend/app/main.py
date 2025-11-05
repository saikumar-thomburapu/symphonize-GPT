"""
Main FastAPI application - Symphonize AI Chat Backend.
This is the entry point that ties everything together.
"""

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .core.config import settings
from .api import auth, chat, conversations
from .utils.data_cleanup import data_cleanup
import asyncio
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Symphonize AI Chat API",
    description="Backend API for Symphonize AI Chat Application",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI at /docs
    redoc_url="/redoc"  # ReDoc at /redoc
)

# Configure CORS (allows frontend to call backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        settings.FRONTEND_URL,
        # Add your server IPs here for remote access
        "http://192.168.200.154:3000",  # ← Your server IP
        
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # ✅ ADDED: Expose all headers for frontend
    max_age=600,  # Cache CORS preflight for 10 minutes
)

# Include routers (API endpoints)
app.include_router(auth.router)  # /auth/signup, /auth/login, etc.
app.include_router(chat.router)  # /chat/message, /chat/stream, etc.
app.include_router(conversations.router)  # /conversations, etc.

@app.on_event("startup")
async def startup_event():
    """
    Runs when the application starts.
    
    You can add initialization tasks here:
    - Database connections
    - Background tasks
    - Scheduled jobs
    """
    logger.info("🚀 Symphonize AI Chat Backend starting up...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"API Host: {settings.API_HOST}:{settings.API_PORT}")
    logger.info(f"Frontend URL: {settings.FRONTEND_URL}")
    logger.info("✅ CORS configured for remote access")
    
    # Optional: Start background cleanup task
    # Uncomment to enable automatic 30-day data deletion
    # asyncio.create_task(data_cleanup.schedule_daily_cleanup())
    
    logger.info("✅ Backend ready!")

@app.on_event("shutdown")
async def shutdown_event():
    """
    Runs when the application shuts down.
    Clean up resources here.
    """
    logger.info("🛑 Shutting down Symphonize AI Chat Backend...")

@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint - API health check.
    Visit http://localhost:8000/ to verify backend is running.
    """
    return {
        "message": "Symphonize AI Chat API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health", tags=["Root"])
async def health_check():
    """
    Health check endpoint for monitoring.
    Returns API status and configuration info.
    """
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "services": {
            "gemini": "configured" if settings.GEMINI_API_KEY else "not configured",
            "deepseek": "configured" if settings.DEEPSEEK_BASE_URL else "not configured",
            "ollama": "configured" if settings.OLLAMA_BASE_URL else "not configured",
            "supabase": "configured" if settings.SUPABASE_URL else "not configured"
        }
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Global exception handler for unhandled errors.
    Prevents server crashes and returns clean error messages.
    """
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "message": str(exc) if settings.DEBUG else "An error occurred"
        }
    )

# Run the application
if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG  # Auto-reload on code changes in development
    )

