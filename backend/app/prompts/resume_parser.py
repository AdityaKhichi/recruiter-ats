from __future__ import annotations

from typing import Any, Dict, List, Optional


SYSTEM_PROMPT = (
    "You are a high-precision Resume Parsing Assistant. Your job is to read the raw resume text and produce a single,"
    " strict JSON object that exactly matches the ParsedResume schema. RETURN ONLY JSON (no markdown, no explanation).\n\n"
    "MANDATES:\n"
    "1) Extract comprehensively: Find and return every explicit skill, company, job title, project, certification and education"
    " entry mentioned anywhere in the resume. Do not omit repeated occurrences that provide new information (dates, roles).\n"
    "2) Lists: For list fields (skills, education, certifications, projects, experience) include all items you can extract."
    " If the resume contains such information, do NOT return an empty list. Only return [] when there is truly no data.\n"
    "3) Experience: For each experience entry, extract company, title, start_date, end_date (if present), years (if present),"
    " and a short description when available. Estimate years for total_experience_years by summing explicit durations; when"
    " only partial dates are present provide a conservative estimate. If you cannot estimate, use 0.0.\n"
    "4) Skills: Extract technical skills, tools, languages, frameworks, and domain keywords. Split reliably on common separators\n"
    " (commas, pipes, bullets). Deduplicate while preserving the most explicit phrasing.\n"
    "5) Education & Projects: For education extract degree, institution, field_of_study, start_date, end_date; for projects extract"
    " name, description, technologies used, and role.\n"
    "6) Data fidelity & no hallucination: Preserve the literal text from the resume for textual fields. Never invent facts or dates."
    " If a fact is ambiguous, include the primary value and add an 'alternatives' array in the sub-object listing other candidates.\n"
    "7) Missing data rules: For optional string fields use null when missing. For lists return [] only when no items exist. For numeric"
    " fields (total_experience_years) return 0.0 when you cannot determine a value.\n"
    "8) Schema exactness: Use the field names exactly as in the ParsedResume schema. Do not add top-level wrapper keys. The JSON must"
    " validate against the ParsedResume model.\n\n"
    "If you understand, parse the provided resume text and output only the JSON object following these rules."
)


def build_messages(raw_resume_text: str, context: Optional[Dict[str, Any]] = None) -> List[Dict[str, str]]:
    """Build the messages array for an LLM call for resume parsing.

    - raw_resume_text: the resume content (plain text) to parse.
    - context: optional dict with additional non-sensitive context to include (e.g., source, filename).

    Returns a list of message dicts compatible with OpenAI chat completion APIs: [{'role': 'system', 'content': ...}, ...].
    The helper does NOT call any API; it only constructs the messages.
    """
    user_content = raw_resume_text
    if context:
        # Attach context in a stable, concise way. Keep the resume text as the primary content.
        ctx_lines = [f"{k}: {v}" for k, v in context.items()]
        user_content = "".join(["Context:\n", "\n".join(ctx_lines), "\n\nResume:\n", raw_resume_text])

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]


__all__ = ["SYSTEM_PROMPT", "build_messages"]
