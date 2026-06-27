"""
Security helpers for password hashing and verification.

Uses passlib to provide a simple stable interface:
- hash_password(password: str) -> str
- verify_password(plain_password: str, hashed_password: str) -> bool

No JWT or route logic here.
"""
from __future__ import annotations

from passlib.context import CryptContext

# Use a hashing scheme available without optional native dependencies.
# pbkdf2_sha256 is widely supported and doesn't require external C extensions.
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plaintext password.

    Returns the hashed password string suitable for storage.
    """
    if password is None:
        raise TypeError("password must be a str")
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a stored hash.

    Returns True when the password matches, False otherwise.
    """
    if plain_password is None or hashed_password is None:
        return False
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # Any error indicates verification failed or hash is invalid
        return False
