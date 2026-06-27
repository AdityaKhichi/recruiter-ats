"""
Recruiter model.

SQLAlchemy 2.0 style declarative model using Base from app.core.database.
This module only defines the Recruiter ORM model and exports it as Recruiter.
"""
from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.candidate import Candidate
    from app.models.recruiter import Recruiter
    from app.models.job import Job

from sqlalchemy import DateTime, String, Integer, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from sqlalchemy.orm import relationship




class Recruiter(Base):
    """Database model for a recruiter.

    Fields:
      - id: primary key
      - email: unique identifier for login/contact
      - hashed_password: password hash (not plaintext)
      - full_name: optional display name
      - created_at: creation timestamp (server default)
      - updated_at: last update timestamp (server updated)
    """

    __tablename__ = "recruiters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(256), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(256), nullable=True)

    created_at: Mapped[str] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[str] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), server_onupdate=func.now(), nullable=False
    )

    # Relationships
    jobs: Mapped[list["Job"]] = relationship(
        "Job",
        back_populates="recruiter",
        cascade="all, delete-orphan",
        lazy="select",
    )

    candidates: Mapped[list["Candidate"]] = relationship(
        "Candidate",
        back_populates="recruiter",
        cascade="all, delete-orphan",
        lazy="select",
    )


__all__ = ["Recruiter"]
