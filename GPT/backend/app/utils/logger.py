"""
Centralized logging configuration for the application.
Logs are written to both console and files.
"""

import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler
from datetime import datetime

# Create logs directory
LOGS_DIR = Path("logs")
LOGS_DIR.mkdir(exist_ok=True)

# Define log format
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

def setup_logger(name: str = "app", level: int = logging.INFO):
    """
    Setup logger with both console and file handlers.
    
    Args:
        name: Logger name
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Remove existing handlers
    if logger.handlers:
        logger.handlers.clear()
    
    # Create formatters
    formatter = logging.Formatter(LOG_FORMAT, DATE_FORMAT)
    
    # ==================== CONSOLE HANDLER ====================
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # ==================== FILE HANDLER - ALL LOGS ====================
    # Rotates after 10MB, keeps 5 backup files
    file_handler = RotatingFileHandler(
        LOGS_DIR / "app.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding="utf-8"
    )
    file_handler.setLevel(logging.DEBUG)  # Log everything to file
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    # ==================== FILE HANDLER - ERRORS ONLY ====================
    error_handler = RotatingFileHandler(
        LOGS_DIR / "errors.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding="utf-8"
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(formatter)
    logger.addHandler(error_handler)
    
    # ==================== FILE HANDLER - DAILY LOG ====================
    today = datetime.now().strftime("%Y-%m-%d")
    daily_handler = RotatingFileHandler(
        LOGS_DIR / f"app-{today}.log",
        maxBytes=10 * 1024 * 1024,
        backupCount=1,
        encoding="utf-8"
    )
    daily_handler.setLevel(logging.INFO)
    daily_handler.setFormatter(formatter)
    logger.addHandler(daily_handler)
    
    return logger


def get_logger(name: str = "app"):
    """Get existing logger or create new one."""
    return logging.getLogger(name)


# Create default logger
logger = setup_logger()
