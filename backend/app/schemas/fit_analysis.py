from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field, ConfigDict

from app.schemas.fit_score import Recommendation


class FitAnalysis(BaseModel):
    """Single structured AI analysis object persisted to the DB.

    Fields mirror the FitScore but are stored as a single JSONB column.
    """

    score: int = Field(..., ge=0, le=100)
    summary: Optional[str] = None
    strengths: List[str] = Field(default_factory=list)
    gaps: List[str] = Field(default_factory=list)
    recommendation: Recommendation = Field(...)

    model_config = ConfigDict(from_attributes=True)


__all__ = ["FitAnalysis"]
