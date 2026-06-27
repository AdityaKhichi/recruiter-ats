"""
JWT helpers using python-jose.

Provides two simple helpers:
- create_access_token(data: dict, expires_delta: Optional[timedelta]) -> str
- decode_access_token(token: str) -> dict

This module intentionally avoids any framework-specific code; it only
encodes/decodes JWTs using settings from app.core.config.
"""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from jose import JWTError, jwt

from app.core.config import settings

# Algorithm to use for signing. HS256 is a reasonable default.
ALGORITHM = "HS256"


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token containing `data` as claims.

    - data: the claims to include (will be copied)
    - expires_delta: optional timedelta for expiration. If omitted, uses
      settings.ACCESS_TOKEN_EXPIRE_MINUTES.
    Returns the encoded JWT as a string.
    """
    to_encode = data.copy()
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=ALGORITHM)
    return token


def decode_access_token(token: str) -> Dict[str, Any]:
    """Decode and validate a JWT access token.

    Returns the payload (claims) as a dict. Raises JWTError on failure.
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except JWTError as exc:
        # Re-raise so callers can handle verification failures
        raise
