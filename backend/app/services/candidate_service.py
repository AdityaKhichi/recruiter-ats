from __future__ import annotations

from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.candidate import Candidate
from app.models.job import Job


def create_candidate(
    db: Session,
    *,
    actor_id: int,
    full_name: str,
    email: str,
    job_id: int,
    recruiter_id: int,
    phone: Optional[str] = None,
    resume_filename: Optional[str] = None,
    resume_text: Optional[str] = None,
    fit_score: Optional[float] = None,
    ai_summary: Optional[str] = None,
) -> Candidate:
    """Create and persist a Candidate.

    Enforces that the actor (recruiter) owns the job (job.recruiter_id == actor_id).
    Returns the created Candidate.
    Raises PermissionError when actor is not owner.
    """
    job = db.get(Job, job_id)
    if job is None:
        raise ValueError("job not found")
    if job.recruiter_id != actor_id:
        raise PermissionError("not the owner of the job")

    cand = Candidate(
        full_name=full_name,
        email=email,
        phone=phone,
        resume_filename=resume_filename,
        resume_text=resume_text,
        fit_score=fit_score,
        ai_summary=ai_summary,
        job_id=job_id,
        recruiter_id=recruiter_id,
    )
    db.add(cand)
    db.commit()
    db.refresh(cand)
    return cand


def get_candidate(db: Session, candidate_id: int, *, actor_id: int) -> Optional[Candidate]:
    """Return a Candidate by id or None if not found.

    Enforces that the actor owns the job the candidate belongs to.
    Raises PermissionError when actor is not owner.
    """
    cand = db.get(Candidate, candidate_id)
    if cand is None:
        return None
    job = db.get(Job, cand.job_id)
    if job is None:
        return None
    if job.recruiter_id != actor_id:
        raise PermissionError("not the owner")
    return cand


def list_candidates(
    db: Session,
    *,
    actor_id: int,
    job_id: Optional[int] = None,
    recruiter_id: Optional[int] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 100,
) -> List[Candidate]:
    """List candidates with optional filtering and pagination.

    - search: case-insensitive search on full_name
    - pagination is 1-based page
    """
    q = db.query(Candidate).join(Job)
    # Ensure actor only sees candidates for their own jobs
    q = q.filter(Job.recruiter_id == actor_id)
    if job_id is not None:
        q = q.filter(Candidate.job_id == job_id)
    if recruiter_id is not None:
        q = q.filter(Candidate.recruiter_id == recruiter_id)
    if search:
        q = q.filter(Candidate.full_name.ilike(f"%{search}%"))

    # order newest first
    q = q.order_by(Candidate.created_at.desc())

    if page < 1:
        page = 1
    offset = (page - 1) * limit
    return q.offset(offset).limit(limit).all()


def update_candidate(
    db: Session,
    candidate_id: int,
    *,
    full_name: Optional[str] = None,
    email: Optional[str] = None,
    phone: Optional[str] = None,
    resume_filename: Optional[str] = None,
    resume_text: Optional[str] = None,
    fit_score: Optional[float] = None,
    ai_summary: Optional[str] = None,
    actor_id: Optional[int] = None,
    parsed_resume: Optional[dict] = None,
) -> Optional[Candidate]:
    """Update a candidate. Returns updated Candidate or None if not found."""
    cand = db.get(Candidate, candidate_id)
    if cand is None:
        return None

    # ownership: only job owner may update candidate
    job = db.get(Job, cand.job_id)
    if job is None:
        return None
    if actor_id is None or job.recruiter_id != actor_id:
        raise PermissionError("not the owner")

    changed = False
    if full_name is not None:
        cand.full_name = full_name
        changed = True
    if email is not None:
        cand.email = email
        changed = True
    if phone is not None:
        cand.phone = phone
        changed = True
    if resume_filename is not None:
        cand.resume_filename = resume_filename
        changed = True
    if resume_text is not None:
        cand.resume_text = resume_text
        changed = True
    if fit_score is not None:
        cand.fit_score = fit_score
        changed = True
    if ai_summary is not None:
        cand.ai_summary = ai_summary
        changed = True
    if parsed_resume is not None:
        cand.parsed_resume = parsed_resume
        changed = True

    if changed:
        db.add(cand)
        db.commit()
        db.refresh(cand)

    return cand


def delete_candidate(db: Session, candidate_id: int, *, actor_id: int) -> Optional[Candidate]:
    """Delete a candidate and return the deleted instance or None if missing.

    Enforces that the actor owns the job the candidate belongs to.
    Raises PermissionError when actor is not owner.
    """
    cand = db.get(Candidate, candidate_id)
    if cand is None:
        return None
    job = db.get(Job, cand.job_id)
    if job is None:
        return None
    if actor_id is None or job.recruiter_id != actor_id:
        raise PermissionError("not the owner")
    db.delete(cand)
    db.commit()
    return cand


__all__ = [
    "create_candidate",
    "get_candidate",
    "list_candidates",
    "update_candidate",
    "delete_candidate",
]
