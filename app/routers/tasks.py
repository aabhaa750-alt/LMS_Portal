from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.database import get_db
from app.models import User, TaskAssignment, Course, Resource
from app.schemas import TaskCreate, TaskUpdate, TaskStatusUpdate, TaskOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["Tasks & Assignments"])


def build_task_out(t: TaskAssignment) -> TaskOut:
    now = datetime.utcnow()
    is_overdue = t.due_date < now and t.status != "Completed"

    return TaskOut(
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
        is_overdue=is_overdue,
        created_at=t.created_at,
        updated_at=t.updated_at,
    )


@router.get("", response_model=List[TaskOut])
def get_tasks(
    course_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    priority: Optional[str] = None,
    task_type: Optional[str] = None,
    overdue_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(TaskAssignment).filter(TaskAssignment.user_id == current_user.id)

    if course_id:
        query = query.filter(TaskAssignment.course_id == course_id)
    if status_filter:
        query = query.filter(TaskAssignment.status == status_filter)
    if priority:
        query = query.filter(TaskAssignment.priority == priority)
    if task_type:
        query = query.filter(TaskAssignment.task_type == task_type)
    if overdue_only:
        now = datetime.utcnow()
        query = query.filter(TaskAssignment.due_date < now, TaskAssignment.status != "Completed")

    tasks = query.order_by(TaskAssignment.due_date.asc()).all()
    return [build_task_out(t) for t in tasks]


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if task_in.course_id:
        course = db.query(Course).filter(Course.id == task_in.course_id, Course.user_id == current_user.id).first()
        if not course:
            task_in.course_id = None

    if task_in.resource_id:
        resource = db.query(Resource).filter(Resource.id == task_in.resource_id, Resource.user_id == current_user.id).first()
        if not resource:
            task_in.resource_id = None

    task = TaskAssignment(
        user_id=current_user.id,
        course_id=task_in.course_id,
        resource_id=task_in.resource_id,
        title=task_in.title.strip(),
        description=task_in.description.strip() if task_in.description else None,
        task_type=task_in.task_type,
        due_date=task_in.due_date,
        priority=task_in.priority,
        status=task_in.status,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return build_task_out(task)


@router.get("/{task_id}", response_model=TaskOut)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(TaskAssignment).filter(
        TaskAssignment.id == task_id,
        TaskAssignment.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    return build_task_out(task)


@router.put("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(TaskAssignment).filter(
        TaskAssignment.id == task_id,
        TaskAssignment.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if task_in.title is not None and task_in.title.strip():
        task.title = task_in.title.strip()
    if task_in.description is not None:
        task.description = task_in.description.strip() if task_in.description else None
    if task_in.course_id is not None:
        task.course_id = task_in.course_id if task_in.course_id > 0 else None
    if task_in.resource_id is not None:
        task.resource_id = task_in.resource_id if task_in.resource_id > 0 else None
    if task_in.task_type is not None:
        task.task_type = task_in.task_type
    if task_in.due_date is not None:
        task.due_date = task_in.due_date
    if task_in.priority is not None:
        task.priority = task_in.priority
    if task_in.status is not None:
        task.status = task_in.status

    db.commit()
    db.refresh(task)
    return build_task_out(task)


@router.patch("/{task_id}/status", response_model=TaskOut)
def update_task_status(
    task_id: int,
    status_in: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(TaskAssignment).filter(
        TaskAssignment.id == task_id,
        TaskAssignment.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    task.status = status_in.status
    db.commit()
    db.refresh(task)
    return build_task_out(task)


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(TaskAssignment).filter(
        TaskAssignment.id == task_id,
        TaskAssignment.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully."}
