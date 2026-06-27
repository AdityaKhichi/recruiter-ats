from __future__ import annotations

import os
from typing import Optional

from app.core.config import settings

_OPENAI_KEY_SETTING = getattr(settings, "OPENAI_API_KEY", None)
_OPENAI_API_KEY = _OPENAI_KEY_SETTING or os.getenv("OPENAI_API_KEY")


# Try to import openai package but don't fail hard if it's missing. The app
# should start even if the library or API key is unavailable; callers can
# handle that case when they attempt to use the client.
try:
    import openai
except Exception:  # pragma: no cover - optional dependency
    openai = None


def _init_client() -> Optional[object]:
    """Initialize and return the OpenAI client or None when unavailable.

    This function intentionally does not perform any network calls. It only
    configures the client with the API key when possible.
    """
    if openai is None:
        return None

    if not _OPENAI_API_KEY:
        # No key configured; leave uninitialized
        return None

    # The classic openai package uses global configuration; set the key and
    # return the module as the client. Newer official SDKs may expose a
    # client class — adapt as needed in the future.
    try:
        # Some versions use openai.api_key, others expect openai.api_key = ...
        setattr(openai, "api_key", _OPENAI_API_KEY)
    except Exception:
        # Best-effort; if setting fails, return None so callers know not to use it
        return None

    return openai


# Singleton client instance (None if not available)
_CLIENT = _init_client()


def get_openai_client() -> Optional[object]:
    """Return the initialized OpenAI client or None if not configured/available.

    Use this function to obtain the client in a reusable way. It is safe to
    call from FastAPI dependencies or background tasks.
    """
    return _CLIENT


def openai_available() -> bool:
    """Return True when an OpenAI client is configured and available."""
    return _CLIENT is not None


__all__ = ["get_openai_client", "openai_available"]
