"""
Constants for the Symphonize AI Chat application.
This follows your standard MLOps structure.
"""

# AI Model Types
class ModelTypes:
    GEMINI_FLASH = "gemini-1.5-flash"
    GEMINI_PRO = "gemini-1.5-pro"
    DEEPSEEK = "deepseek-v2:16b"
    OLLAMA_LLAMA = "llama3.2"
    OLLAMA_MISTRAL = "mistral"
    OLLAMA_QWEN = "qwen2.5"

# Message Roles
class MessageRole:
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

# API Response Messages
class ResponseMessages:
    SUCCESS = "Operation successful"
    UNAUTHORIZED = "Invalid credentials"
    NOT_FOUND = "Resource not found"
    SERVER_ERROR = "Internal server error"
    INVALID_MODEL = "Invalid model selected"

# Database Table Names
class Tables:
    USERS = "users"
    CONVERSATIONS = "conversations"
    MESSAGES = "messages"

# Default Values
DEFAULT_MAX_TOKENS = 2048
DEFAULT_TEMPERATURE = 0.7
CONTEXT_WINDOW_SIZE = 10  # Number of previous messages to include for context



# Extrac adding# File Upload Settings
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_FILE_TYPES = ['pdf', 'txt', 'docx', 'png', 'jpg', 'jpeg', 'webp']

# Rate Limiting
RATE_LIMIT_MESSAGES_PER_MINUTE = 30

# Session Settings
SESSION_TIMEOUT_MINUTES = 24 * 60  # 24 hours