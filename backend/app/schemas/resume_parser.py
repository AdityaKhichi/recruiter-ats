from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class ParsedResume(BaseModel):
    """Structured schema representing parsed resume data.

    This schema is intentionally permissive: many fields are optional and use
    sensible defaults so downstream AI components can rely on a stable shape.
    """

    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None

    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None

    summary: Optional[str] = None

    # Structured collections. Use lists with default factories to avoid mutable defaults.
    education: List[Dict[str, Any]] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    projects: List[Dict[str, Any]] = Field(default_factory=list)
    experience: List[Dict[str, Any]] = Field(default_factory=list)

    # Numeric / derived fields
    total_experience_years: float = 0.0

    # Current employment
    current_company: Optional[str] = None
    current_designation: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


__all__ = ["ParsedResume"]
