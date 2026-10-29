from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, Course, UnitTopic, StudyGoal
from app.schemas import StudyGoalCreate, StudyGoalOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/progress", tags=["Study Progress"])


def get_current_week_identifier() -> str:
    now = datetime.utcnow()
    return f"{now.year}-W{now.isocalendar()[1]:02d}"


@router.get("")
def get_progress_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.utcnow()
    total_topics = db.query(UnitTopic).filter(UnitTopic.user_id == current_user.id).count()
    completed_topics = db.query(UnitTopic).filter(
        UnitTopic.user_id == current_user.id,
        UnitTopic.status == "Completed"
    ).count()
    in_progress_topics = db.query(UnitTopic).filter(
        UnitTopic.user_id == current_user.id,
        UnitTopic.status == "In Progress"
    ).count()
    not_started_topics = db.query(UnitTopic).filter(
        UnitTopic.user_id == current_user.id,
        UnitTopic.status == "Not Started"
    ).count()

    overall_progress_pct = round((completed_topics / total_topics * 100), 1) if total_topics > 0 else 0.0

    # Course breakdown
    courses = db.query(Course).filter(Course.user_id == current_user.id).order_by(Course.created_at.asc()).all()
    course_breakdown = []

    for c in courses:
        c_topics = db.query(UnitTopic).filter(
            UnitTopic.course_id == c.id,
            UnitTopic.user_id == current_user.id
        ).order_by(UnitTopic.unit_number.asc(), UnitTopic.order_index.asc()).all()

        c_total = len(c_topics)
        c_completed = sum(1 for t in c_topics if t.status == "Completed")
        c_in_progress = sum(1 for t in c_topics if t.status == "In Progress")
        c_not_started = sum(1 for t in c_topics if t.status == "Not Started")
        c_pct = round((c_completed / c_total * 100), 1) if c_total > 0 else 0.0

        course_breakdown.append({
            "course_id": c.id,
            "course_name": c.name,
            "course_code": c.code,
            "course_color": c.color,
            "total_topics": c_total,
            "completed_topics": c_completed,
            "in_progress_topics": c_in_progress,
            "not_started_topics": c_not_started,
            "progress_pct": c_pct,
            "topics": [
                {
                    "id": t.id,
                    "unit_number": t.unit_number,
                    "unit_title": t.unit_title,
                    "topic_title": t.topic_title,
                    "status": t.status,
                    "completed_at": t.completed_at
                }
                for t in c_topics
            ]
        })

    # Weekly goal
    week_id = get_current_week_identifier()
    goal = db.query(StudyGoal).filter(
        StudyGoal.user_id == current_user.id,
        StudyGoal.week_identifier == week_id
    ).first()

    start_of_week = now - timedelta(days=now.weekday(), hours=now.hour, minutes=now.minute, seconds=now.second)
    completed_this_week = db.query(UnitTopic).filter(
        UnitTopic.user_id == current_user.id,
        UnitTopic.status == "Completed",
        UnitTopic.completed_at >= start_of_week
    ).count()

    goal_out = None
    if goal:
        goal_pct = min(100.0, round((completed_this_week / goal.target_topics * 100), 1)) if goal.target_topics > 0 else 0.0
        goal_out = {
            "id": goal.id,
            "week_identifier": goal.week_identifier,
            "target_topics": goal.target_topics,
            "target_hours": goal.target_hours,
            "notes": goal.notes,
            "completed_topics_this_week": completed_this_week,
            "progress_pct": goal_pct
        }
    else:
        # Default placeholder if no goal set yet
        goal_out = {
            "id": None,
            "week_identifier": week_id,
            "target_topics": 5,
            "target_hours": 15.0,
            "notes": None,
            "completed_topics_this_week": completed_this_week,
            "progress_pct": round((completed_this_week / 5 * 100), 1)
        }

    return {
        "total_topics": total_topics,
        "completed_topics": completed_topics,
        "in_progress_topics": in_progress_topics,
        "not_started_topics": not_started_topics,
        "overall_progress_pct": overall_progress_pct,
        "course_breakdown": course_breakdown,
        "weekly_goal": goal_out
    }


@router.post("/goal")
def set_weekly_goal(
    goal_in: StudyGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    week_id = goal_in.week_identifier or get_current_week_identifier()
    goal = db.query(StudyGoal).filter(
        StudyGoal.user_id == current_user.id,
        StudyGoal.week_identifier == week_id
    ).first()

    if goal:
        goal.target_topics = goal_in.target_topics
        goal.target_hours = goal_in.target_hours
        goal.notes = goal_in.notes
    else:
        goal = StudyGoal(
            user_id=current_user.id,
            week_identifier=week_id,
            target_topics=goal_in.target_topics,
            target_hours=goal_in.target_hours,
            notes=goal_in.notes
        )
        db.add(goal)

    db.commit()
    db.refresh(goal)
    return {"message": "Weekly study goal saved successfully."}
