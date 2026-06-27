from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict

from app.prompts.resume_parser import build_messages
from app.services.ai.openai_client import get_openai_client
from app.core.config import settings
from app.schemas.resume_parser import ParsedResume


logger = logging.getLogger(__name__)


class ResumeParseError(Exception):
    """Base exception for resume parsing failures."""


class ResumeValidationError(ResumeParseError):
    """Raised when the model returns JSON that does not match the ParsedResume schema."""



def _extract_json_from_text(text: str) -> str:
    """Attempt to extract a JSON substring from arbitrary text.

    Finds the first '{' and the last '}' and returns that slice. Raises ValueError if not found.
    """
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("No JSON object found in text")
    return text[start : end + 1]


def _local_fallback_parse(resume_text: str) -> Dict[str, Any]:
    """A conservative local parser used when the OpenAI client is unavailable or an API call fails.

    This function does minimal extraction (name, email, phone, skills) using regexes and simple heuristics
    to produce a valid ParsedResume-shaped dict. It intentionally does not attempt to infer missing facts.
    """
    lines = [l.strip() for l in resume_text.splitlines() if l.strip()]
    full_name = lines[0] if lines else None

    email_match = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", resume_text)
    phone_match = re.search(r"(?:\+?\d[\d\-(). ]{6,}\d)", resume_text)

    skills = []
    m = re.search(r"Skills?:\s*(.*)", resume_text, flags=re.I)
    if m:
        # split on commas or pipes
        skills = [s.strip() for s in re.split(r",|\||;", m.group(1)) if s.strip()]

    return {
        "full_name": full_name,
        "email": email_match.group(0) if email_match else None,
        "phone": phone_match.group(0) if phone_match else None,
        "location": None,
        "linkedin_url": None,
        "github_url": None,
        "portfolio_url": None,
        "summary": None,
        "education": [],
        "skills": skills,
        "certifications": [],
        "projects": [],
        "experience": [],
        "total_experience_years": 0.0,
        "current_company": None,
        "current_designation": None,
    }


def parse_resume(resume_text: str) -> Dict[str, Any]:
    """Parse resume text using the configured OpenAI client and the resume parser prompt.

    - Uses build_messages to construct the prompt messages.
    - Calls the OpenAI client if available; on any error it falls back to a conservative local parser.
    - Returns a Python dict parsed from the model's JSON output.
    """
    client = get_openai_client()
    messages = build_messages(resume_text)

    # If no client, use local fallback (validated) and return
    if client is None:
        fallback = _local_fallback_parse(resume_text)
        try:
            ParsedResume.model_validate(fallback)
            return fallback
        except Exception as exc:
            logger.exception("Local fallback validation failed")
            raise ResumeValidationError(f"Local fallback validation failed: {exc}")

    model = getattr(settings, "OPENAI_MODEL", "gpt-4")

    max_attempts = 2
    last_exception: Exception | None = None

    for attempt in range(1, max_attempts + 1):
        content = ""
        try:
            # Support a couple of openai client shapes (module-based and new-style client)
            if hasattr(client, "ChatCompletion") and hasattr(client.ChatCompletion, "create"):
                resp = client.ChatCompletion.create(model=model, messages=messages, temperature=0)
                content = resp["choices"][0]["message"]["content"]
            elif hasattr(client, "chat") and hasattr(client.chat, "completions"):
                resp = client.chat.completions.create(model=model, messages=messages, temperature=0)
                content = resp.choices[0].message.content
            else:
                raise ResumeParseError("OpenAI client has an unsupported shape")

            # Attempt to parse JSON
            try:
                data = json.loads(content)
            except Exception:
                try:
                    extracted = _extract_json_from_text(content)
                    data = json.loads(extracted)
                except Exception as exc:
                    raise ResumeParseError(f"LLM returned invalid JSON: {exc}")

            # Validate schema
            try:
                parsed = ParsedResume.model_validate(data)
            except Exception as exc:
                raise ResumeValidationError(f"ParsedResume validation failed: {exc}")

            # Success
            return parsed.model_dump()

        except (ResumeParseError, ResumeValidationError) as exc:
            # Log the failure (snippet of content for debugging)
            snippet = content[:1000] if content else "<no content>"
            logger.warning("Attempt %d/%d failed: %s; snippet=%s", attempt, max_attempts, exc, snippet)
            last_exception = exc
            if attempt == max_attempts:
                # Final attempt failed: raise a meaningful service-level error
                if isinstance(exc, ResumeValidationError):
                    raise ResumeValidationError(f"Resume validation failed after {max_attempts} attempts: {exc}")
                else:
                    raise ResumeParseError(f"Resume parsing failed after {max_attempts} attempts: {exc}")
            # otherwise retry once
            continue
        except Exception as exc:
            logger.exception("Unexpected error while parsing resume")
            raise ResumeParseError(f"Unexpected error during resume parsing: {exc}")

    # If we exit loop without return, raise last exception
    if last_exception:
        raise ResumeParseError(f"Resume parsing failed: {last_exception}")
    raise ResumeParseError("Resume parsing failed for unknown reasons")


__all__ = ["parse_resume"]
