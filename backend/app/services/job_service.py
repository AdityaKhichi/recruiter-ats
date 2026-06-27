from __future__ import annotations

from typing import Iterable, List, Optional

from sqlalchemy.orm import Session
import json

from app.models.job import Job, JobStatus


def _requirements_to_text(requirements: Optional[Iterable[str]] | None) -> Optional[str]:
    if requirements is None:
        return None
    # ensure list of strings
    return json.dumps([str(r).strip() for r in list(requirements) if str(r).strip()])


def create_job(db: Session, *, title: str, recruiter_id: int, description: Optional[str] = None,
               requirements: Optional[Iterable[str]] = None, status: Optional[JobStatus] = None) -> Job:
    """Create and persist a Job.

    Returns the created Job instance (refreshed).
    """
    job = Job(
        title=title,
        description=description,
        requirements=_requirements_to_text(requirements),
        recruiter_id=recruiter_id,
        status=status or JobStatus.DRAFT,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def get_job(db: Session, job_id: int) -> Optional[Job]:
    """Return a Job by id or None if not found."""
    return db.get(Job, job_id)


def get_jobs(
    db: Session,
    *,
    status: Optional[JobStatus] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 100,
) -> List[Job]:
    """Return a list of jobs with filtering, pagination, and sorting.

    - status: optional JobStatus to filter on
    - search: optional substring to search in title (case-insensitive)
    - page: 1-based page number
    - limit: items per page
    Sorted by created_at descending.
    """
    q = db.query(Job)
    if status is not None:
        q = q.filter(Job.status == status)
    if search:
        # case-insensitive contains on title
        q = q.filter(Job.title.ilike(f"%{search}%"))

    # sort by newest first
    q = q.order_by(Job.created_at.desc())

    if page < 1:
        page = 1
    offset = (page - 1) * limit
    return q.offset(offset).limit(limit).all()


def update_job(db: Session, job_id: int, *, actor_id: int,
               title: Optional[str] = None,
               description: Optional[str] = None, requirements: Optional[Iterable[str]] = None,
               status: Optional[JobStatus] = None) -> Optional[Job]:
    """Update fields on a Job. Returns the updated Job or None if not found."""
    job = db.get(Job, job_id)
    if job is None:
        return None

    # enforce ownership: only the recruiter who created the job may update it
    if actor_id is None or job.recruiter_id != actor_id:
        # Keep service independent of FastAPI - raise PermissionError for callers to handle
        raise PermissionError("not the owner")

    changed = False
    if title is not None:
        job.title = title
        changed = True
    if description is not None:
        job.description = description
        changed = True
    if requirements is not None:
        job.requirements = _requirements_to_text(requirements)
        changed = True
    if status is not None:
        job.status = status
        changed = True

    if changed:
        db.add(job)
        db.commit()
        db.refresh(job)

    return job


def delete_job(db: Session, job_id: int, *, actor_id: int) -> Optional[Job]:
    """Delete a Job. Returns the deleted Job (detached) or None if not found.

    Raises PermissionError when actor_id is not the owner.
    """
    job = db.get(Job, job_id)
    if job is None:
        return None

    if actor_id is None or job.recruiter_id != actor_id:
        raise PermissionError("not the owner")

    db.delete(job)
    db.commit()
    return job


__all__ = [
    "create_job",
    "get_job",
    "get_jobs",
    "update_job",
    "delete_job",
]
