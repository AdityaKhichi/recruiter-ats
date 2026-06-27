
from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.recruiter import Recruiter
from app.schemas.job import JobCreate, JobResponse, JobUpdate
from app.services.job_service import create_job as svc_create_job, get_job as svc_get_job, get_jobs as svc_get_jobs, update_job as svc_update_job, delete_job as svc_delete_job

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    req: JobCreate, db: Session = Depends(get_db), current_user: Recruiter = Depends(get_current_user)
) -> JobResponse:
    """Create a new job. recruiter is taken from the authenticated user."""
    # enforce recruiter from auth rather than trusting client payload
    job = svc_create_job(
        db,
        title=req.title,
        recruiter_id=current_user.id,
        description=req.description,
        requirements=req.requirements,
        status=req.status,
    )
    return JobResponse.model_validate(job)


@router.get("/", response_model=List[JobResponse])
def list_jobs(
    status: str | None = None,
    search: str | None = None,
    page: int = 1,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_user),
) -> List[JobResponse]:
    # Accept status as string and let service handle conversion if needed
    status_enum = None
    if status is not None:
        try:
            from app.models.job import JobStatus as _JS

            status_enum = _JS(status.lower())
        except Exception:
            # invalid status -> return empty list
            return []

    jobs = svc_get_jobs(db, status=status_enum, search=search, page=page, limit=limit)
    return [JobResponse.model_validate(j) for j in jobs]


@router.get("/{job_id}", response_model=JobResponse)
def retrieve_job(job_id: int, db: Session = Depends(get_db), current_user: Recruiter = Depends(get_current_user)) -> JobResponse:
    job = svc_get_job(db, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return JobResponse.model_validate(job)


@router.put("/{job_id}", response_model=JobResponse)
def update_job(job_id: int, req: JobUpdate, db: Session = Depends(get_db), current_user: Recruiter = Depends(get_current_user)) -> JobResponse:
    try:
        job = svc_update_job(
            db,
            job_id,
            actor_id=current_user.id,
            title=req.title,
            description=req.description,
            requirements=req.requirements,
            status=req.status,
        )
    except PermissionError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return JobResponse.model_validate(job)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(job_id: int, db: Session = Depends(get_db), current_user: Recruiter = Depends(get_current_user)):
    try:
        job = svc_delete_job(db, job_id, actor_id=current_user.id)
    except PermissionError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return None
