from __future__ import annotations

from typing import Any, Dict, List
import json


SYSTEM_PROMPT = (
    "You are an objective, conservative Fit Scoring Assistant. Your job is to compare a Job posting to a candidate's"
    " parsed resume and produce a single strict JSON object matching the FitScore schema. RETURN ONLY JSON (no markdown).\n\n"
    "MANDATES:\n"
    "1) Use only the provided ParsedResume and Job fields. Do NOT invent information. If a field is missing, reflect it in the score and gaps.\n"
    "2) Consider these signals (in order of importance): required skills match, years of relevant experience, demonstrated projects, domain/industry experience, education, and certifications.\n"
    "3) Skills: For each required skill missing from the resume, add a concise gap entry. For preferred skills present, list them as strengths.\n"
    "4) Experience: Use total_experience_years as the primary numeric signal. If parsed Resume contains detailed experience entries that align to the job domain, increase score. If years are below job minimum, note in gaps.\n"
    "5) Projects & Education: Relevant projects and education that map to job requirements are strengths; missing required education is a gap.\n"
    "6) Output: Return these keys exactly: score (0-100 integer), summary (1-2 sentence factual summary or null), strengths (list of short phrases), gaps (list of short phrases), recommendation (one of: 'Highly Recommended','Recommended','Consider','Not Recommended').\n"
    "7) Tone and detail: Keep summary factual and concise. Strengths/gaps should be short factual phrases (1-8 words). Do not add long explanations.\n\n"
    "If you understand, produce only the JSON FitScore comparing the Job to the ParsedResume using the rules above."
)


def build_messages(job: Dict[str, Any], parsed_resume: Dict[str, Any]) -> List[Dict[str, str]]:
    """Construct messages for the LLM.

    job: a dict containing the job posting fields (title, required_skills, preferred_skills, min_years_experience, education_requirements, certifications, projects, etc.)
    parsed_resume: the ParsedResume dictionary produced by the parser.

    Returns: messages list suitable for passing to an LLM chat API (system + user).
    """
    # Serialize inputs as JSON for clarity. Keep them compact but readable.
    job_json = json.dumps(job, ensure_ascii=False, indent=2)
    resume_json = json.dumps(parsed_resume, ensure_ascii=False, indent=2)

    user_content = (
        "Below are the Job posting details and the candidate's parsed resume (structured).\n"
        "Compare the candidate to the job using the rules in the system prompt and return a single JSON object matching the FitScore schema.\n\n"
        "Job:\n" + job_json + "\n\nParsedResume:\n" + resume_json
    )

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]


__all__ = ["SYSTEM_PROMPT", "build_messages"]
