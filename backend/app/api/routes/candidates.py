from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi import UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.recruiter import Recruiter
from app.schemas.candidate import CandidateCreate, CandidateResponse, CandidateUpdate
from app.services.candidate_service import (
    create_candidate as svc_create_candidate,
    get_candidate as svc_get_candidate,
    list_candidates as svc_list_candidates,
    update_candidate as svc_update_candidate,
    delete_candidate as svc_delete_candidate,
)

router = APIRouter()

from pathlib import Path
from uuid import uuid4

# Directory to store uploads (relative to project root)
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


def _candidate_response_from_orm(cand):
    """Build CandidateResponse dict from ORM object plus sidecar metadata."""
    from app.schemas.candidate import CandidateResponse
    import json

    data = {
        "id": cand.id,
        "full_name": cand.full_name,
        "email": cand.email,
        "phone": cand.phone,
        "resume_filename": cand.resume_filename,
        "resume_text": cand.resume_text,
        "fit_score": cand.fit_score,
        "ai_summary": cand.ai_summary,
        "job_id": cand.job_id,
        "recruiter_id": cand.recruiter_id,
        "created_at": cand.created_at,
        "updated_at": cand.updated_at,
    }

    # include parsed resume JSON if present, validate/deserialize into ParsedResume
    if hasattr(cand, "parsed_resume") and cand.parsed_resume is not None:
        try:
            from app.schemas.resume_parser import ParsedResume

            parsed = ParsedResume.model_validate(cand.parsed_resume)
            # return as dict matching the ParsedResume schema
            data["parsed_resume"] = parsed.model_dump()
        except Exception:
            # If DB contains invalid JSON for whatever reason, log and return None
            import logging

            logging.getLogger(__name__).exception("Invalid parsed_resume JSON for candidate %s", cand.id)
            data["parsed_resume"] = None
    else:
        data["parsed_resume"] = None

    # attempt to load metadata sidecar
    if cand.resume_filename:
        metapath = UPLOAD_DIR / f"{Path(cand.resume_filename).stem}.meta.json"
        if metapath.exists():
            try:
                meta = json.loads(metapath.read_text())
                data["resume_pages"] = meta.get("page_count")
                data["resume_filesize"] = meta.get("file_size")
                data["resume_uploaded_at"] = meta.get("uploaded_at")
            except Exception:
                data["resume_pages"] = None
                data["resume_filesize"] = None
                data["resume_uploaded_at"] = None
        else:
            data["resume_pages"] = None
            data["resume_filesize"] = None
            data["resume_uploaded_at"] = None
    else:
        data["resume_pages"] = None
        data["resume_filesize"] = None
        data["resume_uploaded_at"] = None

    return CandidateResponse.model_validate(data)


@router.post("/jobs/{job_id}/candidates", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
def create_candidate(
    job_id: int,
    req: CandidateCreate,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_user),
) -> CandidateResponse:
    # ignore req.job_id and use path param; set recruiter from authenticated user
    try:
        cand = svc_create_candidate(
            db,
            actor_id=current_user.id,
            full_name=req.full_name,
            email=req.email,
            job_id=job_id,
            recruiter_id=current_user.id,
            phone=req.phone,
            resume_filename=req.resume_filename,
            resume_text=req.resume_text,
            fit_score=req.fit_score,
            ai_summary=req.ai_summary,
        )
    except PermissionError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return _candidate_response_from_orm(cand)


@router.post("/jobs/{job_id}/candidates/upload")
def upload_candidate_resume(
    job_id: int,
    file: UploadFile = File(...),
    candidate_id: int | None = Form(None),
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_user),
):
    """Upload a candidate resume PDF for a job. Only the job owner may upload.

    Stores the file under uploads/ with a generated unique filename and returns that filename.
    """
    # ensure job exists and is owned by current_user
    from app.models.job import Job

    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    if job.recruiter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    # Accept only PDFs
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF uploads are allowed")

    # generate unique filename with .pdf extension
    filename = f"{uuid4().hex}.pdf"
    dest = UPLOAD_DIR / filename
    # write file
    with dest.open("wb") as f:
        while True:
            chunk = file.file.read(1024 * 64)
            if not chunk:
                break
            f.write(chunk)

    # extract text from the stored PDF
    extracted = ""
    page_count = None
    try:
        from app.utils.pdf_parser import extract_text_from_pdf

        extracted, page_count = extract_text_from_pdf(dest)
    except Exception:
        # If extraction fails or parser missing, continue with empty text/page_count
        extracted = ""
        page_count = None

    # if candidate_id provided, update the candidate record (ownership enforced in service)
    if candidate_id is not None:
        try:
            # validate ownership and existence
            from app.services.candidate_service import update_candidate as svc_update_candidate
            from app.services.candidate_service import get_candidate as svc_get_candidate
            from app.services.ai.resume_parser_service import parse_resume

            _ = svc_get_candidate(db, candidate_id, actor_id=current_user.id)

            # try to parse the extracted text (best-effort). If parsing fails, log and continue.
            parsed_json = None
            try:
                parsed_json = parse_resume(extracted or "")
            except Exception as e:
                logger.exception("Resume parsing failed for candidate %s: %s", candidate_id, e)

            svc_update_candidate(
                db,
                candidate_id,
                resume_filename=filename,
                resume_text=extracted,
                parsed_resume=parsed_json,
                actor_id=current_user.id,
            )

            # write sidecar metadata file
            import json

            filesize = dest.stat().st_size
            from datetime import datetime, timezone

            uploaded_at = datetime.now(timezone.utc)
            meta = {"page_count": page_count, "file_size": filesize, "uploaded_at": uploaded_at.isoformat()}
            metapath = UPLOAD_DIR / f"{Path(filename).stem}.meta.json"
            metapath.write_text(json.dumps(meta))
        except PermissionError:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        except Exception:
            # fall through to return filename and extracted text even if DB update failed
            logger.exception("Failed to attach resume to candidate %s", candidate_id)
            pass

    # also store extracted text as a companion .txt file for convenience
    txtpath = UPLOAD_DIR / f"{Path(filename).stem}.txt"
    txtpath.write_text(extracted or "")

    # read sidecar metadata if present
    import json

    metapath = UPLOAD_DIR / f"{Path(filename).stem}.meta.json"
    meta = None
    if metapath.exists():
        meta = json.loads(metapath.read_text())

    return {
        "filename": filename,
        "extracted_text": extracted,
        "metadata": meta,
    }


@router.get("/jobs/{job_id}/candidates", response_model=List[CandidateResponse])
def list_job_candidates(
    job_id: int,
    search: str | None = None,
    page: int = 1,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_user),
) -> List[CandidateResponse]:
    try:
        items = svc_list_candidates(db, actor_id=current_user.id, job_id=job_id, search=search, page=page, limit=limit)
    except PermissionError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return [_candidate_response_from_orm(i) for i in items]


@router.get("/jobs/{job_id}/candidates/{candidate_id}", response_model=CandidateResponse)
def get_job_candidate(job_id: int, candidate_id: int, db: Session = Depends(get_db), current_user: Recruiter = Depends(get_current_user)) -> CandidateResponse:
    try:
        cand = svc_get_candidate(db, candidate_id, actor_id=current_user.id)
    except PermissionError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    if cand is None or cand.job_id != job_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
    return _candidate_response_from_orm(cand)


@router.put("/jobs/{job_id}/candidates/{candidate_id}", response_model=CandidateResponse)
def update_job_candidate(job_id: int, candidate_id: int, req: CandidateUpdate, db: Session = Depends(get_db), current_user: Recruiter = Depends(get_current_user)) -> CandidateResponse:
    try:
        # svc_update_candidate enforces ownership via actor_id
        updated = svc_update_candidate(
            db,
            candidate_id,
            full_name=req.full_name,
            email=req.email,
            phone=req.phone,
            resume_filename=req.resume_filename,
            resume_text=req.resume_text,
            fit_score=req.fit_score,
            ai_summary=req.ai_summary,
            actor_id=current_user.id,
        )
    except PermissionError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    if updated is None or updated.job_id != job_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
    return _candidate_response_from_orm(updated)


@router.delete("/jobs/{job_id}/candidates/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job_candidate(job_id: int, candidate_id: int, db: Session = Depends(get_db), current_user: Recruiter = Depends(get_current_user)):
    try:
        deleted = svc_delete_candidate(db, candidate_id, actor_id=current_user.id)
    except PermissionError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    if deleted is None or deleted.job_id != job_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
    return None
