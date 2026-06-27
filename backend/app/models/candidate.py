"""
Candidate model.

Defines the Candidate ORM model and relationships to Job and Recruiter.
Uses SQLAlchemy 2.0 style mappings and Base from app.core.database.
"""
from __future__ import annotations

from typing import Optional

from sqlalchemy import (
    DateTime,
    Float,
    JSON,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Candidate(Base):
    """Database model for a candidate.

    Fields:
      - id: primary key
      - full_name: candidate name
      - email: contact email
      - phone: contact phone
      - resume_filename: stored filename for an uploaded resume (no upload logic here)
      - resume_text: extracted resume text
      - fit_score: optional numeric score
      - ai_summary: optional AI-generated summary (no AI implemented here)
      - job_id: FK to jobs.id
      - recruiter_id: FK to recruiters.id
      - created_at, updated_at: timestamps
    """

    __tablename__ = "candidates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    full_name: Mapped[str] = mapped_column(String(256), nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(320), nullable=False, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)

    resume_filename: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    resume_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # Parsed resume JSON stored as JSONB (when supported by the DB)
    parsed_resume: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    # Note: resume metadata (pages, filesize, uploaded_at) are stored as sidecar
    # files under uploads/; the DB stores filename and extracted text.

    fit_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    ai_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id"), nullable=False, index=True)
    recruiter_id: Mapped[int] = mapped_column(ForeignKey("recruiters.id"), nullable=False, index=True)

    # Relationships. Use fully-qualified string paths to avoid circular imports.
    job = relationship(
        "Job",
        back_populates="candidates",
        lazy="select",
    )
    recruiter = relationship(
        "Recruiter",
        back_populates="candidates",
        lazy="select",
    )

    created_at: Mapped[str] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[str] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), server_onupdate=func.now(), nullable=False
    )


__all__ = ["Candidate"]
