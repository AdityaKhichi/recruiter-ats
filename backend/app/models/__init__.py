"""
Import all models so SQLAlchemy's DeclarativeBase has them registered
before mapper/relationship configuration. This prevents errors when
relationships refer to class names rather than module paths.
"""
from __future__ import annotations

# Import models so they are registered on the Base.metadata
from app.models.recruiter import Recruiter  # noqa: F401
from app.models.job import Job, JobStatus  # noqa: F401
from app.models.candidate import Candidate  # noqa: F401

__all__ = ["Recruiter", "Job", "JobStatus", "Candidate"]
