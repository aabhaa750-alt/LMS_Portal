from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import DATABASE_URL, UPLOADS_DIR
from app.models import User, Course, UnitTopic, Resource, PersonalNote, TaskAssignment
from app.auth import hash_password
from app.storage import get_safe_file_path


def test_disk_and_database_persistence():
    # 1. Connect and insert
    engine1 = create_engine(DATABASE_URL)
    Session1 = sessionmaker(bind=engine1)
    db1 = Session1()

    user = User(
        email="persistence_test@mba.edu",
        hashed_password=hash_password("Pass123!"),
        full_name="Persistence Student",
        program="MBA",
        academic_year="Year 1",
        semester="Semester 1",
    )
    db1.add(user)
    db1.commit()
    user_id = user.id

    course = Course(
        user_id=user_id,
        name="Financial Management & Modeling",
        code="MBA602",
        description="Corporate finance and valuation models.",
    )
    db1.add(course)
    db1.commit()
    course_id = course.id

    # Create dummy resource on disk
    dummy_filename = "test_persisted_file.txt"
    file_path = UPLOADS_DIR / dummy_filename
    test_content = b"DCF Model Assumptions & Beta Calculations for Persistence Test"
    with open(file_path, "wb") as f:
        f.write(test_content)

    resource = Resource(
        user_id=user_id,
        course_id=course_id,
        title="DCF Valuation Model",
        description="Discounted Cash Flow spreadsheet template.",
        resource_type="Spreadsheet",
        file_path=dummy_filename,
        original_filename="dcf_model.xlsx",
        file_extension=".xlsx",
        file_size=len(test_content),
        mime_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        tags="finance, valuation, dcf",
    )
    db1.add(resource)
    db1.commit()
    resource_id = resource.id

    # Close and dispose Session and Engine (simulating server shutdown)
    db1.close()
    engine1.dispose()

    # 2. Simulate server restart: create completely new engine and session
    engine2 = create_engine(DATABASE_URL)
    Session2 = sessionmaker(bind=engine2)
    db2 = Session2()

    # Verify user persists
    persisted_user = db2.query(User).filter(User.id == user_id).first()
    assert persisted_user is not None
    assert persisted_user.email == "persistence_test@mba.edu"

    # Verify course persists
    persisted_course = db2.query(Course).filter(Course.id == course_id).first()
    assert persisted_course is not None
    assert persisted_course.name == "Financial Management & Modeling"

    # Verify resource record persists
    persisted_resource = db2.query(Resource).filter(Resource.id == resource_id).first()
    assert persisted_resource is not None
    assert persisted_resource.title == "DCF Valuation Model"

    # Verify physical file on disk exists and content is uncorrupted
    safe_path = get_safe_file_path(persisted_resource.file_path)
    assert safe_path.exists()
    assert safe_path.read_bytes() == test_content

    # Clean up test file
    safe_path.unlink()
    db2.delete(persisted_user)
    db2.commit()
    db2.close()
    engine2.dispose()
