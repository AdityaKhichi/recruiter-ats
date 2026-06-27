from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.jwt import decode_access_token
from app.models.recruiter import Recruiter

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    db: Session = Depends(get_db), creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)
) -> Recruiter:
    """Dependency that returns the current authenticated Recruiter.

    Raises HTTPException 401 when the token is missing or invalid.
    """
    if creds is None or not creds.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    token = creds.credentials
    try:
        payload = decode_access_token(token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    # Expect recruiter_id in the token payload
    recruiter_id = payload.get("recruiter_id")
    if recruiter_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    user = db.query(Recruiter).get(recruiter_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user
