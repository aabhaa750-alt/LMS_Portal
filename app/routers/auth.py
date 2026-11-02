from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import (
    UserRegister,
    UserLogin,
    UserUpdate,
    PasswordChange,
    UserOut,
)
from app.auth import (
    hash_password,
    verify_password,
    create_session_token,
    invalidate_session_token,
    get_current_user,
    get_token_from_request,
)
from app.config import SESSION_COOKIE_NAME, SESSION_MAX_AGE
from app.database import init_db

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut)
def register(user_data: UserRegister, response: Response, db: Session = Depends(get_db)):
    # 1. Normalize and validate email
    normalized_email = user_data.email.lower().strip()
    if not normalized_email or "@" not in normalized_email:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A valid email address is required."
        )

    # 2. Check if email is already taken
    try:
        existing = db.query(User).filter(User.email == normalized_email).first()
    except Exception as e:
        # If table was missing, try re-initializing and retry once
        try:
            init_db()
            existing = db.query(User).filter(User.email == normalized_email).first()
        except Exception as inner_e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database connection error: {type(inner_e).__name__}: {str(inner_e)}"
            )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please sign in instead."
        )

    # 3. Securely hash password
    try:
        hashed_pwd = hash_password(user_data.password)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password security processing error: {str(e)}"
        )

    # 4. Create and persist user
    new_user = User(
        email=normalized_email,
        hashed_password=hashed_pwd,
        full_name=user_data.full_name.strip(),
        program=user_data.program or "Master of Business Administration (MBA)",
        academic_year=user_data.academic_year or "Year 1",
        semester=user_data.semester or "Semester 1",
    )
    
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"User registration could not be saved: {type(e).__name__}: {str(e)}"
        )

    # 5. Automatically create session and set cookie
    try:
        token = create_session_token(db, new_user.id)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Session authentication failed: {type(e).__name__}: {str(e)}"
        )

    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        max_age=SESSION_MAX_AGE,
        httponly=True,
        samesite="lax",
        path="/",
    )

    return new_user



@router.post("/login", response_model=UserOut)
def login(login_data: UserLogin, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower().strip()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please try again."
        )

    token = create_session_token(db, user.id)
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        max_age=SESSION_MAX_AGE,
        httponly=True,
        samesite="lax",
        path="/",
    )

    return user


@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    token = get_token_from_request(request)
    if token:
        invalidate_session_token(db, token)

    response.delete_cookie(key=SESSION_COOKIE_NAME, path="/")
    return {"message": "Logged out successfully."}


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserOut)
def update_profile(
    profile_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if profile_data.full_name is not None and profile_data.full_name.strip():
        current_user.full_name = profile_data.full_name.strip()
    if profile_data.program is not None:
        current_user.program = profile_data.program.strip()
    if profile_data.academic_year is not None:
        current_user.academic_year = profile_data.academic_year.strip()
    if profile_data.semester is not None:
        current_user.semester = profile_data.semester.strip()
    if profile_data.avatar_url is not None:
        current_user.avatar_url = profile_data.avatar_url.strip()

    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/password")
def change_password(
    pwd_data: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(pwd_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password does not match."
        )

    current_user.hashed_password = hash_password(pwd_data.new_password)
    db.commit()
    return {"message": "Password changed successfully."}
