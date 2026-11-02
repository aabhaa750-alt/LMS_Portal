from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.database import get_db
from app.models import (
    User, Course, UnitTopic, Resource, Bookmark, AccessHistory,
    TaskAssignment, StudyGoal, PersonalNote, DailyPlanCompletion
)
from app.schemas import (
    DashboardStatsOut, ResourceOut, TaskOut, StudyGoalOut,
    ContinueLearningOut, DailyPlanOut, DailyPlanItemOut, DailyPlanToggleIn
)
from app.auth import get_current_user
from app.routers.resources import build_resource_out

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


def get_greeting(hour: int) -> str:
    if 5 <= hour < 12:
        return "Good morning"
    elif 12 <= hour < 17:
        return "Good afternoon"
    elif 17 <= hour < 21:
        return "Good evening"
    else:
        return "Working late"


def format_relative_time(dt: datetime) -> str:
    now = datetime.utcnow()
    diff = now - dt
    seconds = int(diff.total_seconds())
    if seconds < 60:
        return "Just now"
    elif seconds < 3600:
        mins = max(1, seconds // 60)
        return f"Accessed {mins} minute{'s' if mins > 1 else ''} ago"
    elif seconds < 86400:
        hours = max(1, seconds // 3600)
        return f"Accessed {hours} hour{'s' if hours > 1 else ''} ago"
    elif seconds < 172800:
        return "Accessed yesterday"
    else:
        days = seconds // 86400
        return f"Accessed {days} days ago"


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

    # Continue Learning: find the single most recently accessed resource
    continue_learning = None
    last_access = db.query(AccessHistory).filter(
        AccessHistory.user_id == current_user.id
    ).order_by(AccessHistory.accessed_at.desc()).first()

    if last_access:
        last_res = db.query(Resource).filter(
            Resource.id == last_access.resource_id,
            Resource.user_id == current_user.id
        ).first()
        if last_res:
            pos_label = last_access.position_label or last_res.last_position_label
            if not pos_label:
                if last_res.resource_type == "Presentation":
                    pos_label = f"Slide {last_access.slide_number or last_res.last_slide_number or 1}"
                else:
                    pos_label = f"Page {last_access.page_number or last_res.last_page_number or 1}"

            continue_learning = ContinueLearningOut(
                id=last_res.id,
                title=last_res.title,
                resource_type=last_res.resource_type,
                course_id=last_res.course_id,
                course_name=last_res.course.name if last_res.course else "Course Resource",
                course_code=last_res.course.code if last_res.course else None,
                course_color=last_res.course.color if last_res.course else "#2563eb",
                last_page_number=last_access.page_number or last_res.last_page_number or 1,
                last_slide_number=last_access.slide_number or last_res.last_slide_number or 1,
                last_position=pos_label,
                last_accessed_at=last_access.accessed_at,
                relative_time=format_relative_time(last_access.accessed_at)
            )

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
        continue_learning=continue_learning,
    )


@router.get("/daily-plan", response_model=DailyPlanOut)
def get_daily_study_plan(
    date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan_date = date or datetime.now().strftime("%Y-%m-%d")
    items: List[DailyPlanItemOut] = []

    # 1. Real incomplete unit topics from student's active courses (up to 2)
    incomplete_topics = db.query(UnitTopic).join(Course).filter(
        UnitTopic.user_id == current_user.id,
        UnitTopic.status != "Completed"
    ).order_by(UnitTopic.order_index.asc()).limit(2).all()

    for t in incomplete_topics:
        items.append(
            DailyPlanItemOut(
                id=f"topic_{t.id}",
                type="topic",
                subject=t.course.name,
                subject_color=t.course.color or "#2563eb",
                title=f"{t.unit_title}: {t.topic_title}",
                activity=f"Study core MBA concept '{t.topic_title}' from {t.unit_title}",
                estimated_duration="25 mins",
                action_type="open_course",
                action_label="Study Topic",
                target_id=t.course_id,
                concept_name=t.topic_title,
                is_completed=False
            )
        )

    # 2. Uploaded study material to review (1 item)
    res = db.query(Resource).join(Course).filter(
        Resource.user_id == current_user.id
    ).order_by(Resource.created_at.desc()).first()

    if res:
        action_label = "Open Deck" if res.resource_type == "Presentation" else "Read Document"
        items.append(
            DailyPlanItemOut(
                id=f"resource_{res.id}",
                type="resource",
                subject=res.course.name,
                subject_color=res.course.color or "#4f46e5",
                title=f"Review: {res.title}",
                activity=f"Review slide decks and lecture notes in {res.original_filename}",
                estimated_duration="20 mins",
                action_type="open_reader",
                action_label=action_label,
                target_id=res.id,
                concept_name=res.title,
                is_completed=False
            )
        )

    # 3. Upcoming deadline / task (1 item)
    upcoming_task = db.query(TaskAssignment).filter(
        TaskAssignment.user_id == current_user.id,
        TaskAssignment.status != "Completed"
    ).order_by(TaskAssignment.due_date.asc()).first()

    if upcoming_task:
        due_str = upcoming_task.due_date.strftime("%b %d")
        items.append(
            DailyPlanItemOut(
                id=f"task_{upcoming_task.id}",
                type="task",
                subject=upcoming_task.course.name if upcoming_task.course else "General MBA",
                subject_color=upcoming_task.course.color if upcoming_task.course else "#0284c7",
                title=f"{upcoming_task.task_type}: {upcoming_task.title}",
                activity=f"Work on assignment deliverable before deadline ({due_str})",
                estimated_duration="30 mins",
                action_type="open_tasks",
                action_label="View Deadline",
                target_id=upcoming_task.id,
                concept_name=upcoming_task.title,
                is_completed=False
            )
        )

    # 4. Personal note to revise (1 item if exists)
    note = db.query(PersonalNote).filter(
        PersonalNote.user_id == current_user.id
    ).order_by(PersonalNote.updated_at.desc()).first()

    if note:
        items.append(
            DailyPlanItemOut(
                id=f"note_{note.id}",
                type="note",
                subject=note.course.name if note.course else "Personal Revision",
                subject_color=note.course.color if note.course else "#7c3aed",
                title=f"Revision: {note.title}",
                activity=f"Review key takeaways, formulas, and revision points",
                estimated_duration="15 mins",
                action_type="open_notes",
                action_label="Revise Note",
                target_id=note.id,
                concept_name=note.title,
                is_completed=False
            )
        )

    # Check completions from DailyPlanCompletion
    completions = db.query(DailyPlanCompletion).filter(
        DailyPlanCompletion.user_id == current_user.id,
        DailyPlanCompletion.plan_date == plan_date,
        DailyPlanCompletion.completed == True
    ).all()
    completed_keys = {c.item_key for c in completions}

    completed_count = 0
    for item in items:
        if item.id in completed_keys:
            item.is_completed = True
            completed_count += 1

    total_count = len(items)
    progress_pct = round((completed_count / total_count * 100), 1) if total_count > 0 else 0.0

    return DailyPlanOut(
        date=plan_date,
        total_items=total_count,
        completed_items=completed_count,
        progress_pct=progress_pct,
        items=items
    )


@router.post("/daily-plan/toggle")
def toggle_daily_plan_item(
    req: DailyPlanToggleIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan_date = req.plan_date or datetime.now().strftime("%Y-%m-%d")

    rec = db.query(DailyPlanCompletion).filter(
        DailyPlanCompletion.user_id == current_user.id,
        DailyPlanCompletion.plan_date == plan_date,
        DailyPlanCompletion.item_key == req.item_key
    ).first()

    if rec:
        if req.completed is not None:
            rec.completed = req.completed
        else:
            rec.completed = not rec.completed
        rec.completed_at = datetime.utcnow()
    else:
        new_val = req.completed if req.completed is not None else True
        rec = DailyPlanCompletion(
            user_id=current_user.id,
            plan_date=plan_date,
            item_key=req.item_key,
            completed=new_val,
            completed_at=datetime.utcnow()
        )
        db.add(rec)

    db.commit()
    db.refresh(rec)

    # Return total completed count for today
    total_completed = db.query(DailyPlanCompletion).filter(
        DailyPlanCompletion.user_id == current_user.id,
        DailyPlanCompletion.plan_date == plan_date,
        DailyPlanCompletion.completed == True
    ).count()

    return {
        "status": "success",
        "item_key": rec.item_key,
        "completed": rec.completed,
        "plan_date": rec.plan_date,
        "completed_count": total_completed
    }
