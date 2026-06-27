from __future__ import annotations

import json
import logging
from typing import Any, Dict

from app.prompts.fit_scoring import build_messages
from app.services.ai.openai_client import get_openai_client
from app.schemas.fit_score import FitScore


logger = logging.getLogger(__name__)


class FitScoreError(Exception):
    """Base exception for fit scoring failures."""


class FitScoreValidationError(FitScoreError):
    """Raised when the LLM output cannot be validated against FitScore schema."""


def _extract_json_from_text(text: str) -> str:
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("No JSON object found in text")
    return text[start : end + 1]


def score_candidate(job: Dict[str, Any], parsed_resume: Dict[str, Any]) -> FitScore:
    """Score a candidate for a job using the configured OpenAI client.

    - Builds messages via prompts.fit_scoring.build_messages
    - Calls the OpenAI client with temperature=0.2
    - Expects JSON output matching FitScore; validates and returns a FitScore instance
    - Raises FitScoreError or FitScoreValidationError on failures
    """
    client = get_openai_client()
    messages = build_messages(job, parsed_resume)

    if client is None:
        raise FitScoreError("OpenAI client not configured")

    model = getattr(__import__("app.core.config", fromlist=["settings"]).settings, "OPENAI_MODEL", "gpt-4")

    max_attempts = 2
    last_exc: Exception | None = None

    for attempt in range(1, max_attempts + 1):
        content = ""
        try:
            # support different client shapes
            if hasattr(client, "ChatCompletion") and hasattr(client.ChatCompletion, "create"):
                resp = client.ChatCompletion.create(model=model, messages=messages, temperature=0.2)
                content = resp["choices"][0]["message"]["content"]
            elif hasattr(client, "chat") and hasattr(client.chat, "completions"):
                resp = client.chat.completions.create(model=model, messages=messages, temperature=0.2)
                content = resp.choices[0].message.content
            else:
                raise FitScoreError("OpenAI client has unsupported interface")

            # parse JSON
            try:
                data = json.loads(content)
            except Exception:
                try:
                    extracted = _extract_json_from_text(content)
                    data = json.loads(extracted)
                except Exception as exc:
                    logger.warning("Fit scoring attempt %d: failed to parse JSON: %s", attempt, exc)
                    raise FitScoreError(f"LLM returned invalid JSON: {exc}")

            # validate using FitScore
            try:
                fit = FitScore.model_validate(data)
            except Exception as exc:
                logger.warning("Fit scoring attempt %d: validation failed: %s", attempt, exc)
                raise FitScoreValidationError(f"FitScore validation failed: {exc}")

            return fit

        except (FitScoreError, FitScoreValidationError) as exc:
            # log snippet for debugging without exposing large content
            snippet = content[:1000] if content else "<no content>"
            logger.warning("Attempt %d/%d failed: %s; snippet=%s", attempt, max_attempts, exc, snippet)
            last_exc = exc
            if attempt == max_attempts:
                # final failure: raise meaningful service-level error
                if isinstance(exc, FitScoreValidationError):
                    raise FitScoreValidationError(f"FitScore validation failed after {max_attempts} attempts: {exc}")
                else:
                    raise FitScoreError(f"Fit scoring failed after {max_attempts} attempts: {exc}")
            # otherwise retry
            continue
        except Exception as exc:
            logger.exception("Unexpected error in fit scoring attempt %d", attempt)
            raise FitScoreError(f"Unexpected error during fit scoring: {exc}")

    # if we reach here raise last exception
    if last_exc:
        raise FitScoreError(f"Fit scoring failed: {last_exc}")
    raise FitScoreError("Fit scoring failed for unknown reasons")


__all__ = ["score_candidate", "FitScoreError", "FitScoreValidationError"]
