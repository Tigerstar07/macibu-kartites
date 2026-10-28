from fastapi import APIRouter, Depends, HTTPException, status
from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.orm import Session

from sqlalchemy.exc import IntegrityError

from .auth import create_access_token, get_current_user, unauthorized
from .database import get_db
from .models import Score, User
from .schemas import LoginRequest, RegisterRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])
password_hash = PasswordHash.recommended()
DUMMY_HASH = password_hash.hash("rrv-login-timing-placeholder")


def token_response(user: User) -> TokenResponse:
    return TokenResponse(access_token=create_access_token(user), user=user)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    if db.scalar(select(User).where(User.email == payload.email.lower())):
        raise HTTPException(status_code=409, detail="Šis e-pasts jau ir reģistrēts. Pieslēdzies savam kontam.")
    user = User(email=payload.email.lower(), password_hash=password_hash.hash(payload.password), display_name=payload.display_name.strip())
    db.add(user)
    try:
        db.flush()
        db.add(Score(user_id=user.id))
        db.commit()
    except IntegrityError:
        db.rollback()
        if db.scalar(select(User).where(User.email == payload.email.lower())):
            raise HTTPException(status_code=409, detail="Šis e-pasts jau ir reģistrēts. Pieslēdzies savam kontam.") from None
        raise
    db.refresh(user)
    return token_response(user)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    valid = password_hash.verify(payload.password, user.password_hash if user and user.password_hash else DUMMY_HASH)
    if not user or not user.password_hash or not valid:
        raise unauthorized("Nepareizs e-pasts vai parole.")
    return token_response(user)


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)) -> User:
    return user


