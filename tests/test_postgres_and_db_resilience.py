import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, check_db_connection, init_db
from app.models import (
    User,
    Course,
    Resource,
    PersonalNote,
    TaskAssignment,
    DailyPlanCompletion,
    Bookmark,
    AccessHistory,
    SessionToken
)
from app.auth import hash_password, verify_password, create_session_token
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_database_connection_diagnostics():
    """Ensure check_db_connection returns healthy diagnostics."""
    status = check_db_connection()
    assert status["connected"] is True
    assert status["engine"] in ["sqlite", "postgresql"]


def test_open_lms_access_without_authentication():
    """Verify that all core LMS endpoints are directly accessible without login."""
    # 1. /api/auth/me should return primary student without session token
    res_me = client.get("/api/auth/me")
    assert res_me.status_code == 200
    user = res_me.json()
    assert bool(user.get("full_name"))
    assert "id" in user

    # 2. /api/dashboard should return 200 with courses
    res_dash = client.get("/api/dashboard")
    assert res_dash.status_code == 200
    dash = res_dash.json()
    assert dash["total_courses"] >= 1

    # 3. All other core modules should return 200 without login
    for ep in ["/api/courses", "/api/resources", "/api/notes", "/api/bookmarks", "/api/tasks", "/api/progress", "/api/ai/status"]:
        r = client.get(ep)
        assert r.status_code == 200, f"Endpoint {ep} failed with {r.status_code}"


def test_auth_registration_and_duplicate_prevention():
    """Test user registration with normalization and duplicate 400 rejection."""
    unique_suffix = int(datetime.utcnow().timestamp())
    email = f"Test.Student.{unique_suffix}@Example.com"
    payload = {
        "email": email,
        "password": "StrongPassword123!",
        "full_name": "Test Student",
        "program": "MBA Core",
        "academic_year": "Year 1",
        "semester": "Semester 1"
    }

    # 1. Register new user
    res1 = client.post("/api/auth/register", json=payload)
    assert res1.status_code == 200
    user_data = res1.json()
    assert user_data["email"] == email.lower().strip()
    assert "id" in user_data

    # 2. Attempt duplicate registration (should return 400 Bad Request)
    res2 = client.post("/api/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"].lower()

    # 3. Test login with registered credentials
    res3 = client.post("/api/auth/login", json={
        "email": email.upper(),  # case-insensitive check
        "password": "StrongPassword123!"
    })
    assert res3.status_code == 200
    assert res3.json()["id"] == user_data["id"]

    # 4. Test login with wrong password
    res4 = client.post("/api/auth/login", json={
        "email": email,
        "password": "WrongPassword!"
    })
    assert res4.status_code == 401


def test_database_model_crud_lifecycle():
    """Test full CRUD operations on core models to verify PostgreSQL-compatible schema."""
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        ts = int(datetime.utcnow().timestamp())
        # Create User
        user = User(
            email=f"crud_test_{ts}@example.com",
            hashed_password=hash_password("Pass123!"),
            full_name="CRUD User"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        assert user.id is not None

        # Create Course
        course = Course(
            user_id=user.id,
            code=f"MBA{ts % 1000}",
            name="Corporate Strategy",
            instructor="Prof. Porter"
        )
        db.add(course)
        db.commit()
        db.refresh(course)
        assert course.id is not None

        # Create Personal Note
        note = PersonalNote(
            user_id=user.id,
            course_id=course.id,
            title="Five Forces Framework",
            content="Summary of industry rivalry and barriers to entry."
        )
        db.add(note)
        db.commit()
        db.refresh(note)
        assert note.id is not None

        # Update Note
        note.title = "Porter's Five Forces Framework"
        db.commit()
        db.refresh(note)
        assert note.title == "Porter's Five Forces Framework"

        # Create Task
        task = TaskAssignment(
            user_id=user.id,
            course_id=course.id,
            title="Strategy Case Memo",
            due_date=datetime.utcnow() + timedelta(days=7),
            priority="High",
            status="To Do"
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        assert task.id is not None

        # Create Daily Plan Completion
        comp = DailyPlanCompletion(
            user_id=user.id,
            plan_date=datetime.utcnow().strftime("%Y-%m-%d"),
            item_key=f"task_{task.id}",
            completed=True
        )
        db.add(comp)
        db.commit()
        db.refresh(comp)
        assert comp.id is not None

        # Read back
        found_note = db.query(PersonalNote).filter(PersonalNote.id == note.id).first()
        assert found_note is not None
        assert found_note.content == "Summary of industry rivalry and barriers to entry."

        # Delete operations
        db.delete(note)
        db.delete(task)
        db.delete(comp)
        db.delete(course)
        db.delete(user)
        db.commit()

        assert db.query(User).filter(User.id == user.id).first() is None
    finally:
        db.close()


def test_scripts_dry_run_and_init():
    """Verify that init_db and migration scripts run without exception."""
    import subprocess
    import sys

    # Test init_db.py on current database
    res1 = subprocess.run(
        [sys.executable, "scripts/init_db.py"],
        capture_output=True,
        text=True
    )
    assert res1.returncode == 0
    assert "Found 14 tables" in res1.stdout

    # Test migrate_sqlite_to_pg.py in --dry-run mode
    res2 = subprocess.run(
        [sys.executable, "scripts/migrate_sqlite_to_pg.py", "--dry-run", "--database-url", "postgresql://mock:mock@localhost/mock"],
        capture_output=True,
        text=True
    )
    assert res2.returncode == 0
    assert "Dry run completed" in res2.stdout
