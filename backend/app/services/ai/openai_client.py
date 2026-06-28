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

    # Some OpenAI SDK shapes read the API key from the environment. Set it
    # so newer SDK clients that pick up OPENAI_API_KEY from env will work.
    try:
        os.environ.setdefault("OPENAI_API_KEY", _OPENAI_API_KEY)
    except Exception:
        # non-fatal: continue and try to set client-specific attributes
        pass

    # Prefer constructing a dedicated client when the SDK exposes one (new
    # OpenAI SDKs expose OpenAI class). Fall back to configuring the module
    # (older openai package) by setting api_key.
    try:
        if hasattr(openai, "OpenAI"):
            try:
                # New-style client: instantiate with the API key when supported.
                return openai.OpenAI(api_key=_OPENAI_API_KEY)
            except Exception:
                # If instantiation fails, continue to try module-level config
                pass

        # Classic module-based client: set api_key attribute
        try:
            setattr(openai, "api_key", _OPENAI_API_KEY)
        except Exception:
            return None

        return openai
    except Exception:
        # If anything unexpected happens, do not crash the app at import time.
        return None


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
