from __future__ import annotations

from datetime import datetime
from typing import List, Optional

import json
from pydantic import BaseModel, Field, ConfigDict, field_validator

from app.models.job import JobStatus


def _str_to_list(value: Optional[object]) -> Optional[List[str]]:
    """Helper to normalize requirements stored as a string into a list of strings.

    Accepts None, a list, or a string. If string, attempts JSON decode, then
    falls back to splitting on newlines. Strips items and filters empty ones.
    """
    if value is None:
        return None
    if isinstance(value, list):
        # ensure items are strings
        return [str(x).strip() for x in value if str(x).strip()]
    if isinstance(value, str):
        s = value.strip()
        if not s:
            return []
        # try JSON array first
        try:
            parsed = json.loads(s)
            if isinstance(parsed, list):
                return [str(x).strip() for x in parsed if str(x).strip()]
        except Exception:
            pass
        # fallback: split on newlines
        parts = [p.strip() for p in s.splitlines() if p.strip()]
        return parts
    # fallback: coerce to string and split
    return [p.strip() for p in str(value).splitlines() if p.strip()]


class JobBase(BaseModel):
    """Shared configuration for job schemas."""

    model_config = ConfigDict(from_attributes=True)

    @staticmethod
    def _normalize_requirements_value(v: Optional[object]) -> List[str]:
        # ensure requirements exposed as list; default to empty list
        out = _str_to_list(v)
        return out or []


class JobCreate(JobBase):
    """Schema for creating a job. Requires title and description. requirements
    defaults to an empty list. status must be a valid JobStatus.
    """

    title: str = Field(..., min_length=1, max_length=256)
    description: str = Field(..., min_length=1)
    requirements: List[str] = Field(default_factory=list)
    status: JobStatus = JobStatus.DRAFT
    recruiter_id: Optional[int] = None

    @field_validator("title", mode="before")
    @classmethod
    def _strip_title(cls, v):
        if not isinstance(v, str):
            raise TypeError("title must be a string")
        s = v.strip()
        if not s:
            raise ValueError("title must not be empty")
        return s

    @field_validator("description", mode="before")
    @classmethod
    def _strip_description(cls, v):
        if not isinstance(v, str):
            raise TypeError("description must be a string")
        s = v.strip()
        if not s:
            raise ValueError("description must not be empty")
        return s

    @field_validator("requirements", mode="before")
    @classmethod
    def _normalize_requirements(cls, v):
        return cls._normalize_requirements_value(v)


class JobUpdate(BaseModel):
    """Partial schema for updating a job. All fields optional but when
    provided must be valid (non-empty title/description, valid status).
    """

    title: Optional[str] = Field(None, min_length=1, max_length=256)
    description: Optional[str] = Field(None, min_length=1)
    requirements: Optional[List[str]] = None
    status: Optional[JobStatus] = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator("title", mode="before")
    @classmethod
    def _strip_title(cls, v):
        if v is None:
            return None
        if not isinstance(v, str):
            raise TypeError("title must be a string")
        s = v.strip()
        if not s:
            raise ValueError("title must not be empty")
        return s

    @field_validator("description", mode="before")
    @classmethod
    def _strip_description(cls, v):
        if v is None:
            return None
        if not isinstance(v, str):
            raise TypeError("description must be a string")
        s = v.strip()
        if not s:
            raise ValueError("description must not be empty")
        return s

    @field_validator("requirements", mode="before")
    @classmethod
    def _normalize_requirements(cls, v):
        if v is None:
            return None
        return JobBase._normalize_requirements_value(v)


class JobResponse(JobBase):
    """Full job representation returned by the API."""

    id: int
    title: str
    description: Optional[str] = None
    requirements: List[str] = Field(default_factory=list)
    status: JobStatus
    recruiter_id: int
    created_at: datetime
    updated_at: datetime

    # recruiter_id already inherited and may be present

    model_config = ConfigDict(from_attributes=True)

    @field_validator("requirements", mode="before")
    @classmethod
    def _normalize_requirements(cls, v):
        # ensure requirements are always a list in responses
        return JobBase._normalize_requirements_value(v)


__all__ = ["JobCreate", "JobUpdate", "JobResponse"]
