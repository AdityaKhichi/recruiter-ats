from __future__ import annotations

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, ConfigDict


class Recommendation(Enum):
    HIGHLY_RECOMMENDED = "Highly Recommended"
    RECOMMENDED = "Recommended"
    CONSIDER = "Consider"
    NOT_RECOMMENDED = "Not Recommended"


class FitScore(BaseModel):
    """Structured fit score returned by the AI Fit Scoring feature.

    - score: integer between 0 and 100 inclusive
    - summary: optional short summary text
    - strengths: list of strength tags or short phrases
    - gaps: list of gap descriptions
    - recommendation: one of the Recommendation enum values
    """

    score: int = Field(..., ge=0, le=100)
    summary: Optional[str] = None
    strengths: List[str] = Field(default_factory=list)
    gaps: List[str] = Field(default_factory=list)
    recommendation: Recommendation = Field(...)

    model_config = ConfigDict(from_attributes=True)


__all__ = ["FitScore", "Recommendation"]
