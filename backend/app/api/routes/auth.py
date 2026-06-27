from __future__ import annotations

from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, StringConstraints
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verify_password
from app.core.jwt import create_access_token
from app.models.recruiter import Recruiter

router = APIRouter()


class RegisterRequest(BaseModel):
    email: EmailStr
    password: Annotated[str, StringConstraints(min_length=8)]
    full_name: Optional[str] = None


class RegisterResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str]


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)) -> RegisterResponse:
    # Validate uniqueness
    existing = db.query(Recruiter).filter(Recruiter.email == req.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    hashed = hash_password(req.password)
    recruiter = Recruiter(email=req.email, hashed_password=hashed, full_name=req.full_name)
    db.add(recruiter)
    db.commit()
    db.refresh(recruiter)

    return RegisterResponse(id=recruiter.id, email=recruiter.email, full_name=recruiter.full_name)


class LoginRequest(BaseModel):
    email: EmailStr
    password: Annotated[str, StringConstraints(min_length=8)]


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    recruiter = db.query(Recruiter).filter(Recruiter.email == req.email).first()
    if not recruiter:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not verify_password(req.password, recruiter.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Create token payload. Include recruiter id as subject.
    payload = {"sub": f"recruiter:{recruiter.id}", "recruiter_id": recruiter.id}
    token = create_access_token(payload)

    return TokenResponse(access_token=token)
