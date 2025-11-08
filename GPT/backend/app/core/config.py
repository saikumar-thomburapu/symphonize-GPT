# """
# Configuration settings loaded from environment variables.
# """

# from pydantic_settings import BaseSettings
# from typing import Optional


# class Settings(BaseSettings):
#     """
#     Application settings loaded from .env file.
#     """
    
#     # Supabase settings
#     SUPABASE_URL: str
#     SUPABASE_KEY: str
#     SUPABASE_SERVICE_KEY: str
    
#     # AI Model API Keys (all optional now)
#     GEMINI_API_KEY: Optional[str] = None
#     DEEPSEEK_API_KEY: Optional[str] = None
#     DEEPSEEK_BASE_URL: Optional[str] = None
#     OLLAMA_BASE_URL: str = "http://192.168.200.161:11434"
#     #OLLAMA_BASE_URL: str = "http://localhost:11434"
    
#     # Application settings
#     ENVIRONMENT: str = "development"
#     DEBUG: bool = True
#     API_HOST: str = "0.0.0.0"
#     API_PORT: int = 8000
    
#     # Security
#     SECRET_KEY: str
#     ALGORITHM: str = "HS256"
#     ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
#     # CORS settings
#     FRONTEND_URL: str = "http://localhost:3000"
    
#     # Data retention
#     DATA_RETENTION_DAYS: int = 30
    
#     class Config:
#         env_file = ".env"
#         case_sensitive = True


# # Create global settings instance
# settings = Settings()


"""
Configuration settings with auto-detection for multiple servers.
"""

from pydantic_settings import BaseSettings
from typing import Optional
import socket

def get_local_ip():
    """Get local machine IP address."""
    try:
        # Connect to external server to determine local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "localhost"

def get_ollama_url(config_url: str) -> str:
    """
    Smart Ollama URL detection.
    
    - If running on 161: Uses localhost:11434
    - If running on 154: Uses remote 192.168.200.161:11434
    """
    local_ip = get_local_ip()
    
    # If on 161 (production server), use localhost
    if "161" in local_ip:
        return "http://localhost:11434"
    
    # Otherwise (154), use remote
    return "http://192.168.200.161:11434"

def get_frontend_url(config_url: str) -> str:
    """
    Smart Frontend URL detection.
    
    Automatically detects current server and returns correct URL.
    """
    local_ip = get_local_ip()
    
    # Detect which server we're on
    if "161" in local_ip:
        return f"http://{local_ip}:8001"  # Production
    else:
        return f"http://{local_ip}:8001"  # Development

class Settings(BaseSettings):
    """
    Application settings with auto-detection.
    Automatically works on both 192.168.200.154 and 192.168.200.161
    """
    
    # Supabase settings
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_KEY: str
    
    # AI Model API Keys (optional)
    GEMINI_API_KEY: Optional[str] = None
    DEEPSEEK_API_KEY: Optional[str] = None
    DEEPSEEK_BASE_URL: Optional[str] = None
    
    # ✅ AUTO-DETECT Ollama URL based on server
    OLLAMA_BASE_URL: str = "http://localhost:11434,http://192.168.200.161:11434"
    
    # Application settings
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # ✅ AUTO-DETECT Frontend URL
    FRONTEND_URL: str = "auto"
    
    # Data retention
    DATA_RETENTION_DAYS: int = 30
    
    # Add to Settings class
    SENDER_EMAIL: Optional[str] = None
    SENDER_PASSWORD: Optional[str] = None

    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # Auto-detect Ollama URL
        if self.OLLAMA_BASE_URL == "http://localhost:11434,http://192.168.200.161:11434":
            self.OLLAMA_BASE_URL = get_ollama_url(self.OLLAMA_BASE_URL)
        
        # Auto-detect Frontend URL
        if self.FRONTEND_URL == "auto":
            self.FRONTEND_URL = get_frontend_url(self.FRONTEND_URL)

# Create global settings instance
settings = Settings()
