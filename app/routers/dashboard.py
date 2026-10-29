from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.database import get_db
from app.models import User, Course, UnitTopic, Resource, Bookmark, AccessHistory, TaskAssignment, StudyGoal
from app.schemas import DashboardStatsOut, ResourceOut, TaskOut, StudyGoalOut
from app.auth import get_current_user
from app.routers.resources import build_resource_out

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


def get_greeting(hour: int) -> str:
    if 5 <= hour < 12:
        return "Good morning"
    elif 12 <= hour < 17:
        return "Good afternoon"
    elif 17 <= hour < 22:
        return "Good evening"
    else:
        return "Welcome"


@router.get("", response_model=DashboardStatsOut)
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.utcnow()
    greeting = get_greeting(now.hour)

    # Database calculated counts
    total_courses = db.query(Course).filter(Course.user_id == current_user.id).count()
    total_resources = db.query(Resource).filter(Resource.user_id == current_user.id).count()
    total_topics = db.query(UnitTopic).filter(UnitTopic.user_id == current_user.id).count()
    completed_topics = db.query(UnitTopic).filter(
        UnitTopic.user_id == current_user.id,
        UnitTopic.status == "Completed"
    ).count()

    overall_progress_pct = round((completed_topics / total_topics * 100), 1) if total_topics > 0 else 0.0

    # Recently added resources (latest 5)
    recent_resources_raw = db.query(Resource).filter(
        Resource.user_id == current_user.id
    ).order_by(Resource.created_at.desc()).limit(5).all()
    recent_resources = [build_resource_out(r, current_user.id, db) for r in recent_resources_raw]

    # Recently accessed resources (distinct, latest 5)
    recent_access_subq = db.query(
        AccessHistory.resource_id,
        func.max(AccessHistory.accessed_at).label("max_accessed")
    ).filter(
        AccessHistory.user_id == current_user.id
    ).group_by(AccessHistory.resource_id).order_by(desc("max_accessed")).limit(5).all()

    recent_accessed = []
    for row in recent_access_subq:
        res = db.query(Resource).filter(Resource.id == row.resource_id, Resource.user_id == current_user.id).first()
        if res:
            recent_accessed.append(build_resource_out(res, current_user.id, db))

    # Bookmarked resources (latest 5)
    bookmarked_raw = db.query(Resource).join(Bookmark, Resource.id == Bookmark.resource_id).filter(
        Bookmark.user_id == current_user.id
    ).order_by(Bookmark.created_at.desc()).limit(5).all()
    bookmarked_resources = [build_resource_out(r, current_user.id, db) for r in bookmarked_raw]

    # Upcoming tasks/deadlines (not completed, sorted by due_date)
    upcoming_tasks_raw = db.query(TaskAssignment).filter(
        TaskAssignment.user_id == current_user.id,
        TaskAssignment.status != "Completed"
    ).order_by(TaskAssignment.due_date.asc()).limit(5).all()

    upcoming_tasks = []
    for t in upcoming_tasks_raw:
        upcoming_tasks.append(
            TaskOut(
                id=t.id,
                user_id=t.user_id,
                course_id=t.course_id,
                course_name=t.course.name if t.course else None,
                course_color=t.course.color if t.course else "#2563eb",
                resource_id=t.resource_id,
                resource_title=None,
                title=t.title,
                description=t.description,
                task_type=t.task_type,
                due_date=t.due_date,
                priority=t.priority,
                status=t.status,
                is_overdue=t.due_date < now and t.status != "Completed",
                created_at=t.created_at,
                updated_at=t.updated_at,
            )
        )

    # Current weekly study goal
    current_week = f"{now.year}-W{now.isocalendar()[1]:02d}"
    goal_record = db.query(StudyGoal).filter(
        StudyGoal.user_id == current_user.id,
        StudyGoal.week_identifier == current_week
    ).first()

    study_goal_out = None
    if goal_record:
        # Count topics completed during the current week (from Monday 00:00 to now)
        start_of_week = now - timedelta(days=now.weekday(), hours=now.hour, minutes=now.minute, seconds=now.second)
        completed_this_week = db.query(UnitTopic).filter(
            UnitTopic.user_id == current_user.id,
            UnitTopic.status == "Completed",
            UnitTopic.completed_at >= start_of_week
        ).count()
        goal_pct = min(100.0, round((completed_this_week / goal_record.target_topics * 100), 1)) if goal_record.target_topics > 0 else 0.0

        study_goal_out = StudyGoalOut(
            id=goal_record.id,
            week_identifier=goal_record.week_identifier,
            target_topics=goal_record.target_topics,
            target_hours=goal_record.target_hours,
            notes=goal_record.notes,
            completed_topics_this_week=completed_this_week,
            progress_pct=goal_pct
        )

    return DashboardStatsOut(
        greeting=greeting,
        user_name=current_user.full_name,
        program=current_user.program or "MBA Student",
        academic_year=current_user.academic_year or "Year 1",
        semester=current_user.semester or "Semester 1",
        total_courses=total_courses,
        total_resources=total_resources,
        completed_topics=completed_topics,
        total_topics=total_topics,
        overall_progress_pct=overall_progress_pct,
        recent_resources=recent_resources,
        recent_accessed=recent_accessed,
        bookmarked_resources=bookmarked_resources,
        upcoming_tasks=upcoming_tasks,
        study_goal=study_goal_out,
    )
