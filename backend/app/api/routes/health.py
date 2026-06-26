from pydantic import BaseModel
from fastapi import APIRouter


class HealthResponse(BaseModel):
    status: str


router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def get_health():
    """Simple health check endpoint."""
    return HealthResponse(status="healthy")
