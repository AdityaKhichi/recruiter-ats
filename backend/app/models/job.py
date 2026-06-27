"""
Job model.

Defines the Job ORM model and a JobStatus enum. Uses SQLAlchemy 2.0 style mappings
and Base from app.core.database. Establishes a relationship to the Recruiter model
via a backref so no changes to app/models/recruiter.py are required.
"""
from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.candidate import Candidate

import enum

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
    Enum as SAEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class JobStatus(enum.Enum):
    OPEN = "open"
    CLOSED = "closed"
    DRAFT = "draft"


class Job(Base):
    """Database model for a job posting.

    Fields:
      - id: primary key
      - title: job title
      - description: long description / responsibilities
      - requirements: long-form requirements
      - status: JobStatus enum
      - recruiter_id: FK to recruiters.id
      - created_at, updated_at: timestamps
    """

    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(256), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    requirements: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[JobStatus] = mapped_column(
        SAEnum(JobStatus, name="job_status"), nullable=False, default=JobStatus.DRAFT
    )

    recruiter_id: Mapped[int] = mapped_column(ForeignKey("recruiters.id"), nullable=False, index=True)

    # Relationship to Recruiter (many-to-one). Back-populates Recruiter.jobs.
    recruiter = relationship(
        "Recruiter",
        back_populates="jobs",
        lazy="select",
    )

    # Relationship to Candidate (one-to-many)
    candidates: Mapped[list["Candidate"]] = relationship(
        "Candidate",
        back_populates="job",
        cascade="all, delete-orphan",
        lazy="select",
    )

    created_at: Mapped[str] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[str] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), server_onupdate=func.now(), nullable=False
    )


__all__ = ["Job", "JobStatus"]
