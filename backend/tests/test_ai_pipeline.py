import json
import pytest

from app.schemas.resume_parser import ParsedResume
from app.schemas.fit_score import FitScore, Recommendation


class _FakeChatCompletion:
    @staticmethod
    def create(model, messages, temperature=0):
        # messages[1]['content'] contains either the raw resume (parser)
        # or a combined Job + ParsedResume (fit scorer). Use simple keyword
        # detection to return deterministic JSON for tests.
        user = messages[1]["content"] if len(messages) > 1 else ""

        # Fit scoring messages contain the marker 'ParsedResume:'
        if "ParsedResume:" in user:
            # Determine scenario from parsed resume JSON blob
            if "StrongCandidate" in user:
                fit = {
                    "score": 95,
                    "summary": "Strong match: required skills present and 6 years experience.",
                    "strengths": ["Python", "FastAPI"],
                    "gaps": [],
                    "recommendation": "Highly Recommended",
                }
            elif "WeakCandidate" in user:
                fit = {
                    "score": 25,
                    "summary": "Weak match: missing many required skills.",
                    "strengths": [],
                    "gaps": ["Missing required skills"],
                    "recommendation": "Not Recommended",
                }
            elif "NoExperience" in user:
                fit = {
                    "score": 45,
                    "summary": "Missing experience years.",
                    "strengths": [],
                    "gaps": ["Insufficient years of experience"],
                    "recommendation": "Consider",
                }
            elif "NoSkills" in user:
                fit = {
                    "score": 35,
                    "summary": "Missing key skills.",
                    "strengths": [],
                    "gaps": ["Missing required skills"],
                    "recommendation": "Not Recommended",
                }
            elif "LargeResume" in user:
                fit = {
                    "score": 88,
                    "summary": "Large resume with relevant experience.",
                    "strengths": ["Leadership", "Architecture"],
                    "gaps": [],
                    "recommendation": "Recommended",
                }
            else:
                # Empty or unknown
                fit = {
                    "score": 10,
                    "summary": None,
                    "strengths": [],
                    "gaps": ["No usable information"],
                    "recommendation": "Not Recommended",
                }

            return {"choices": [{"message": {"content": json.dumps(fit)}}]}

        # Otherwise treat as resume parsing request: return a ParsedResume-shaped JSON
        text = user
        if "StrongCandidate" in text:
            parsed = {
                "full_name": "Alice Strong",
                "email": "alice@example.com",
                "phone": "+1-555-0100",
                "location": "Remote",
                "skills": ["Python", "FastAPI", "SQL"],
                "experience": [{"company": "Acme", "title": "Senior Engineer", "years": 6}],
                "total_experience_years": 6.0,
                # marker so scorer can detect scenario
                "_test_marker": "StrongCandidate",
            }
        elif "WeakCandidate" in text:
            parsed = {
                "full_name": "Bob Weak",
                "email": "bob@example.com",
                "skills": ["HTML"],
                "experience": [],
                "total_experience_years": 0.0,
                "_test_marker": "WeakCandidate",
            }
        elif "NoExperience" in text:
            parsed = {
                "full_name": "Charlie NoExp",
                "email": "charlie@example.com",
                "skills": ["Python"],
                "experience": [],
                "total_experience_years": 0.0,
                "_test_marker": "NoExperience",
            }
        elif "NoSkills" in text:
            parsed = {
                "full_name": "Dana NoSkills",
                "email": "dana@example.com",
                "skills": [],
                "experience": [{"company": "Startup", "title": "Intern", "years": 1}],
                "total_experience_years": 1.0,
                "_test_marker": "NoSkills",
            }
        elif "LargeResume" in text:
            parsed = {
                "full_name": "Eve Large",
                "email": "eve@example.com",
                "skills": ["Python", "Leadership", "Architecture"],
                "experience": [{"company": "BigCo", "title": "Principal", "years": 12}],
                "total_experience_years": 12.0,
                "_test_marker": "LargeResume",
            }
        elif text.strip() == "":
            parsed = {
                "full_name": None,
                "email": None,
                "phone": None,
                "location": None,
                "skills": [],
                "experience": [],
                "total_experience_years": 0.0,
                "_test_marker": "Empty",
            }
        else:
            parsed = {"full_name": "Unknown", "skills": [], "experience": [], "total_experience_years": 0.0}

        return {"choices": [{"message": {"content": json.dumps(parsed)}}]}


class _FakeClient:
    ChatCompletion = _FakeChatCompletion


@pytest.mark.parametrize(
    "resume_text, expect_marker",
    [
        ("StrongCandidate: experienced Python developer...", "StrongCandidate"),
        ("WeakCandidate: junior with unrelated skills...", "WeakCandidate"),
        ("NoExperience: recent grad...", "NoExperience"),
        ("NoSkills: lots of prose but no skills listed...", "NoSkills"),
        ("", "Empty"),
        ("LargeResume: " + "word " * 5000, "LargeResume"),
    ],
)
def test_full_pipeline(monkeypatch, resume_text, expect_marker):
    # Patch the openai client accessor to return our fake client
    import app.services.ai.openai_client as oc

    monkeypatch.setattr(oc, "get_openai_client", lambda: _FakeClient())

    # Import functions under test
    from app.services.ai.resume_parser_service import parse_resume
    from app.services.ai.fit_score_service import score_candidate

    # Parse resume
    parsed = parse_resume(resume_text)

    # Ensure ParsedResume schema validates
    parsed_validated = ParsedResume.model_validate(parsed)
    assert parsed_validated is not None
    # marker present in the parsed dict for scenario mapping
    assert parsed.get("_test_marker") == expect_marker or (expect_marker == "Empty" and parsed.get("_test_marker") == "Empty")

    # Build a sample job with a required skill to make scoring relevant
    job = {"title": "Backend Engineer", "description": "", "requirements": ["Python"]}

    fit = score_candidate(job, parsed)
    # FitScore instance returned
    assert isinstance(fit, FitScore)
    # Validate via model_validate roundtrip
    fit_validated = FitScore.model_validate(fit.model_dump())
    assert fit_validated.score >= 0 and fit_validated.score <= 100
    assert fit_validated.recommendation in list(Recommendation)
