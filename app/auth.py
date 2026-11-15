import secrets
from datetime import datetime, timedelta
from typing import Optional
import bcrypt
from fastapi import Request, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.config import SESSION_COOKIE_NAME, SESSION_MAX_AGE
from app.database import get_db
from app.models import User, SessionToken


def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def create_session_token(db: Session, user_id: int) -> str:
    token = secrets.token_urlsafe(48)
    expires_at = datetime.utcnow() + timedelta(seconds=SESSION_MAX_AGE)
    
    session_record = SessionToken(
        token=token,
        user_id=user_id,
        expires_at=expires_at
    )
    db.add(session_record)
    db.commit()
    db.refresh(session_record)
    return token


def invalidate_session_token(db: Session, token: str) -> None:
    session_record = db.query(SessionToken).filter(SessionToken.token == token).first()
    if session_record:
        db.delete(session_record)
        db.commit()


def get_token_from_request(request: Request) -> Optional[str]:
    # 1. Cookie
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if token:
        return token
    
    # 2. Authorization: Bearer <token>
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:].strip()
        
    return None


def get_default_user(db: Session) -> User:
    """
    Returns the primary student user for open / single-user LMS access.
    Prioritizes existing user accounts with courses and data (e.g. Aabha Agrawal).
    If no user exists, creates a default student profile and seeds starter curriculum.
    """
    from app.models import Course
    from sqlalchemy import func

    # 1. Primary student account with courses and learning resources
    top_user = (
        db.query(User)
        .outerjoin(Course)
        .group_by(User.id)
        .order_by(func.count(Course.id).desc())
        .first()
    )
    if top_user and len(top_user.courses) > 0:
        return top_user

    # 2. Look for known primary student email
    primary = db.query(User).filter(
        User.email.in_(["mba_student@stanford.edu", "agrawalaabha27@gmail.com", "aabhaa750@gmail.com", "student@mba.edu"])
    ).first()
    if primary:
        return primary

    # 3. Any existing user in database
    any_user = db.query(User).first()
    if any_user:
        return any_user

    # 4. If database is completely empty (e.g. fresh database setup), create default student user
    new_student = User(
        email="mba_student@stanford.edu",
        hashed_password=hash_password("mbalearninghub2026"),
        full_name="Aabha Agrawal",
        program="Master of Business Administration (MBA)",
        academic_year="Year 1",
        semester="Semester 1"
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    try:
        from app.seed_data import seed_mba_starter_data
        seed_mba_starter_data(db, new_student)
    except Exception as e:
        print(f"Starter seed note: {e}")
    return new_student


def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> User:
    token = get_token_from_request(request)
    if token:
        session_record = db.query(SessionToken).filter(
            SessionToken.token == token,
            SessionToken.expires_at > datetime.utcnow()
        ).first()
        if session_record and session_record.user:
            return session_record.user

    # Open / single-user mode: automatically resolve to the primary student user
    return get_default_user(db)


def get_optional_user(
    request: Request,
    db: Session = Depends(get_db)
) -> Optional[User]:
    return get_current_user(request, db)
