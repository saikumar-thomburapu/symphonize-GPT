"""
Validation utilities for email and other inputs.
"""

import re

def validate_email_domain(email: str) -> bool:
    """
    Validate email domain - only allow specific domains.
    
    Args:
        email: Email address to validate
    
    Returns:
        True if email domain is allowed, False otherwise
    """
    # ✅ YOUR ALLOWED DOMAINS
    ALLOWED_DOMAINS = [
        "symphonize.com",      # No @ sign in domain
        "tekworks.in",
        "gmail.com"
    ]
    
    # Basic email format check
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return False
    
    # Check domain (case-insensitive)
    domain = email.split('@')[1].lower()
    return domain in ALLOWED_DOMAINS

def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password strength.
    
    Args:
        password: Password to validate
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not password or len(password) < 8:
        return False, "Password must be at least 8 characters"
    
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one number"
    
    return True, "Valid"

