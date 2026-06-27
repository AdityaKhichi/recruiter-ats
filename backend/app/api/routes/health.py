from pydantic import BaseModel
from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.models.recruiter import Recruiter


class HealthResponse(BaseModel):
    status: str


router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def get_health():
    """Simple health check endpoint."""
    return HealthResponse(status="healthy")


@router.get("/health/protected", response_model=HealthResponse)
def get_protected_health(current_user: Recruiter = Depends(get_current_user)):
    """Protected health endpoint to test authentication."""
    return HealthResponse(status=f"healthy (user={current_user.email})")
