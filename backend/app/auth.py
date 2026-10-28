from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from jwt import InvalidTokenError
from sqlalchemy.orm import Session

from .config import get_settings
from .database import get_db
from .models import User

security = HTTPBearer(auto_error=False)


def unauthorized(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail, headers={"WWW-Authenticate": "Bearer"})


def create_access_token(user: User) -> str:
    settings = get_settings()
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_minutes)
    return jwt.encode({"sub": str(user.id), "exp": expires}, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise unauthorized("Lai turpinātu, pieslēdzies savam kontam.")
    try:
        settings = get_settings()
        payload = jwt.decode(credentials.credentials, settings.jwt_secret, algorithms=[settings.jwt_algorithm], options={"require": ["sub", "exp"]})
        subject = payload["sub"]
        if not isinstance(subject, str) or not subject.isascii() or not subject.isdecimal() or len(subject) > 18:
            raise ValueError("Invalid subject")
        user_id = int(subject)
        if user_id < 1:
            raise ValueError("Invalid user id")
    except (InvalidTokenError, ValueError, TypeError, OverflowError):
        raise unauthorized("Sesija nav derīga vai ir beigusies. Pieslēdzies vēlreiz.") from None
    user = db.get(User, user_id)
    if not user:
        raise unauthorized("Sesija nav derīga vai ir beigusies. Pieslēdzies vēlreiz.")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Šai darbībai vajadzīgas administratora tiesības.")
    return user
