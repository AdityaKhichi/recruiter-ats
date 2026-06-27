from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from app.schemas.resume_parser import ParsedResume
from app.schemas.fit_analysis import FitAnalysis


class CandidateCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=256)
    email: EmailStr
    phone: Optional[str] = None

    # Optional resume fields
    resume_filename: Optional[str] = None
    resume_text: Optional[str] = None
    resume_pages: Optional[int] = None
    resume_filesize: Optional[int] = None
    resume_uploaded_at: Optional[datetime] = None

    # Association
    job_id: Optional[int] = None
    recruiter_id: Optional[int] = None

    # Additional optional metadata
    ai_summary: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator("full_name", mode="before")
    @classmethod
    def _strip_full_name(cls, v):
        if not isinstance(v, str):
            raise TypeError("full_name must be a string")
        s = v.strip()
        if not s:
            raise ValueError("full_name must not be empty")
        return s


class CandidateUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=256)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    resume_filename: Optional[str] = None
    resume_text: Optional[str] = None
    ai_summary: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator("full_name", mode="before")
    @classmethod
    def _strip_full_name(cls, v):
        if v is None:
            return None
        if not isinstance(v, str):
            raise TypeError("full_name must be a string")
        s = v.strip()
        if not s:
            raise ValueError("full_name must not be empty")
        return s


class CandidateResponse(BaseModel):
    id: int
    # The structured parsed resume (contains fields like full_name, email, phone, skills, etc.)
    parsed_resume: Optional[ParsedResume] = None

    # Full AI analysis persisted as structured object
    fit_analysis: Optional[FitAnalysis] = None

    # Raw/extracted resume fields (kept for backward compatibility)
    resume_filename: Optional[str] = None
    resume_text: Optional[str] = None
    resume_pages: Optional[int] = None
    resume_filesize: Optional[int] = None
    resume_uploaded_at: Optional[str] = None
    ai_summary: Optional[str] = None
    job_id: int
    recruiter_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CandidateListResponse(BaseModel):
    items: List[CandidateResponse]
    total: Optional[int] = None
    page: Optional[int] = None
    limit: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


__all__ = [
    "CandidateCreate",
    "CandidateUpdate",
    "CandidateResponse",
    "CandidateListResponse",
]
