from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, Course, UnitTopic, Resource
from app.schemas import (
    CourseCreate,
    CourseUpdate,
    CourseOut,
    CourseDetailOut,
    UnitTopicCreate,
    UnitTopicUpdate,
    UnitTopicStatusUpdate,
    UnitTopicOut,
)
from app.auth import get_current_user
from app.storage import delete_stored_file

router = APIRouter(prefix="/api/courses", tags=["Courses"])


def get_course_stats(db: Session, course: Course):
    resource_count = db.query(Resource).filter(
        Resource.course_id == course.id,
        Resource.user_id == course.user_id
    ).count()

    total_topics = db.query(UnitTopic).filter(
        UnitTopic.course_id == course.id,
        UnitTopic.user_id == course.user_id
    ).count()

    completed_topics = db.query(UnitTopic).filter(
        UnitTopic.course_id == course.id,
        UnitTopic.user_id == course.user_id,
        UnitTopic.status == "Completed"
    ).count()

    progress_pct = round((completed_topics / total_topics * 100), 1) if total_topics > 0 else 0.0

    return {
        "resource_count": resource_count,
        "total_topics": total_topics,
        "completed_topics": completed_topics,
        "progress_pct": progress_pct,
    }


@router.get("", response_model=List[CourseOut])
def get_courses(
    academic_year: Optional[str] = None,
    semester: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Course).filter(Course.user_id == current_user.id)
    if academic_year:
        query = query.filter(Course.academic_year == academic_year)
    if semester:
        query = query.filter(Course.semester == semester)

    courses = query.order_by(Course.created_at.asc()).all()

    result = []
    for c in courses:
        stats = get_course_stats(db, c)
        c_dict = {
            "id": c.id,
            "name": c.name,
            "code": c.code,
            "description": c.description,
            "academic_year": c.academic_year,
            "semester": c.semester,
            "instructor": c.instructor,
            "color": c.color,
            "icon": c.icon,
            "created_at": c.created_at,
            **stats
        }
        result.append(CourseOut(**c_dict))

    return result


@router.post("", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
def create_course(
    course_in: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = Course(
        user_id=current_user.id,
        name=course_in.name.strip(),
        code=course_in.code.strip() if course_in.code else None,
        description=course_in.description.strip() if course_in.description else None,
        academic_year=course_in.academic_year or current_user.academic_year,
        semester=course_in.semester or current_user.semester,
        instructor=course_in.instructor.strip() if course_in.instructor else None,
        color=course_in.color or "#2563eb",
        icon=course_in.icon or "book-open",
    )
    db.add(course)
    db.commit()
    db.refresh(course)

    stats = get_course_stats(db, course)
    return CourseOut(
        id=course.id,
        name=course.name,
        code=course.code,
        description=course.description,
        academic_year=course.academic_year,
        semester=course.semester,
        instructor=course.instructor,
        color=course.color,
        icon=course.icon,
        created_at=course.created_at,
        **stats
    )


@router.get("/{course_id}", response_model=CourseDetailOut)
def get_course_detail(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.user_id == current_user.id
    ).first()

    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    stats = get_course_stats(db, course)
    unit_topics = db.query(UnitTopic).filter(
        UnitTopic.course_id == course.id,
        UnitTopic.user_id == current_user.id
    ).order_by(UnitTopic.unit_number.asc(), UnitTopic.order_index.asc()).all()

    return CourseDetailOut(
        id=course.id,
        name=course.name,
        code=course.code,
        description=course.description,
        academic_year=course.academic_year,
        semester=course.semester,
        instructor=course.instructor,
        color=course.color,
        icon=course.icon,
        created_at=course.created_at,
        unit_topics=unit_topics,
        **stats
    )


@router.put("/{course_id}", response_model=CourseOut)
def update_course(
    course_id: int,
    course_in: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.user_id == current_user.id
    ).first()

    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    if course_in.name is not None:
        course.name = course_in.name.strip()
    if course_in.code is not None:
        course.code = course_in.code.strip() if course_in.code else None
    if course_in.description is not None:
        course.description = course_in.description.strip() if course_in.description else None
    if course_in.academic_year is not None:
        course.academic_year = course_in.academic_year.strip()
    if course_in.semester is not None:
        course.semester = course_in.semester.strip()
    if course_in.instructor is not None:
        course.instructor = course_in.instructor.strip() if course_in.instructor else None
    if course_in.color is not None:
        course.color = course_in.color.strip()
    if course_in.icon is not None:
        course.icon = course_in.icon.strip()

    db.commit()
    db.refresh(course)
    stats = get_course_stats(db, course)

    return CourseOut(
        id=course.id,
        name=course.name,
        code=course.code,
        description=course.description,
        academic_year=course.academic_year,
        semester=course.semester,
        instructor=course.instructor,
        color=course.color,
        icon=course.icon,
        created_at=course.created_at,
        **stats
    )


@router.delete("/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.user_id == current_user.id
    ).first()

    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    # Clean up uploaded files on disk for resources in this course
    resources = db.query(Resource).filter(
        Resource.course_id == course_id,
        Resource.user_id == current_user.id
    ).all()
    for res in resources:
        delete_stored_file(res.file_path)

    db.delete(course)
    db.commit()
    return {"message": f"Course '{course.name}' and all associated materials deleted successfully."}


# Unit / Topic management
@router.post("/{course_id}/units", response_model=UnitTopicOut, status_code=status.HTTP_201_CREATED)
def create_unit_topic(
    course_id: int,
    topic_in: UnitTopicCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.user_id == current_user.id
    ).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    unit_topic = UnitTopic(
        course_id=course.id,
        user_id=current_user.id,
        unit_number=topic_in.unit_number,
        unit_title=topic_in.unit_title.strip(),
        topic_title=topic_in.topic_title.strip(),
        description=topic_in.description.strip() if topic_in.description else None,
        status=topic_in.status if topic_in.status in ["Not Started", "In Progress", "Completed"] else "Not Started",
        order_index=topic_in.order_index,
        completed_at=datetime.utcnow() if topic_in.status == "Completed" else None
    )
    db.add(unit_topic)
    db.commit()
    db.refresh(unit_topic)
    return unit_topic


@router.put("/units/{topic_id}", response_model=UnitTopicOut)
def update_unit_topic(
    topic_id: int,
    topic_in: UnitTopicUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    unit_topic = db.query(UnitTopic).filter(
        UnitTopic.id == topic_id,
        UnitTopic.user_id == current_user.id
    ).first()

    if not unit_topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit topic not found")

    if topic_in.unit_number is not None:
        unit_topic.unit_number = topic_in.unit_number
    if topic_in.unit_title is not None:
        unit_topic.unit_title = topic_in.unit_title.strip()
    if topic_in.topic_title is not None:
        unit_topic.topic_title = topic_in.topic_title.strip()
    if topic_in.description is not None:
        unit_topic.description = topic_in.description.strip() if topic_in.description else None
    if topic_in.order_index is not None:
        unit_topic.order_index = topic_in.order_index
    if topic_in.status is not None:
        unit_topic.status = topic_in.status
        if topic_in.status == "Completed" and not unit_topic.completed_at:
            unit_topic.completed_at = datetime.utcnow()
        elif topic_in.status != "Completed":
            unit_topic.completed_at = None

    db.commit()
    db.refresh(unit_topic)
    return unit_topic


@router.patch("/units/{topic_id}/status", response_model=UnitTopicOut)
def update_unit_topic_status(
    topic_id: int,
    status_in: UnitTopicStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    unit_topic = db.query(UnitTopic).filter(
        UnitTopic.id == topic_id,
        UnitTopic.user_id == current_user.id
    ).first()

    if not unit_topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit topic not found")

    unit_topic.status = status_in.status
    if status_in.status == "Completed":
        unit_topic.completed_at = datetime.utcnow()
    else:
        unit_topic.completed_at = None

    db.commit()
    db.refresh(unit_topic)
    return unit_topic


@router.delete("/units/{topic_id}")
def delete_unit_topic(
    topic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    unit_topic = db.query(UnitTopic).filter(
        UnitTopic.id == topic_id,
        UnitTopic.user_id == current_user.id
    ).first()

    if not unit_topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit topic not found")

    db.delete(unit_topic)
    db.commit()
    return {"message": "Topic deleted successfully."}
