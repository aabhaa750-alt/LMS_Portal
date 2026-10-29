from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import User, PersonalNote, Course, UnitTopic, Resource
from app.schemas import NoteCreate, NoteUpdate, NoteOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/notes", tags=["Notes"])


def build_note_out(note: PersonalNote) -> NoteOut:
    return NoteOut(
        id=note.id,
        user_id=note.user_id,
        course_id=note.course_id,
        course_name=note.course.name if note.course else None,
        unit_topic_id=note.unit_topic_id,
        topic_title=note.unit_topic.topic_title if note.unit_topic else None,
        resource_id=note.resource_id,
        resource_title=note.resource.title if note.resource else None,
        title=note.title,
        content=note.content,
        tags=note.tags or "",
        created_at=note.created_at,
        updated_at=note.updated_at,
    )


@router.get("", response_model=List[NoteOut])
def get_notes(
    course_id: Optional[int] = None,
    unit_topic_id: Optional[int] = None,
    resource_id: Optional[int] = None,
    search: Optional[str] = None,
    tag: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(PersonalNote).filter(PersonalNote.user_id == current_user.id)

    if course_id:
        query = query.filter(PersonalNote.course_id == course_id)
    if unit_topic_id:
        query = query.filter(PersonalNote.unit_topic_id == unit_topic_id)
    if resource_id:
        query = query.filter(PersonalNote.resource_id == resource_id)
    if tag:
        query = query.filter(PersonalNote.tags.ilike(f"%{tag.strip()}%"))

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                PersonalNote.title.ilike(search_term),
                PersonalNote.content.ilike(search_term),
                PersonalNote.tags.ilike(search_term)
            )
        )

    notes = query.order_by(PersonalNote.updated_at.desc()).all()
    return [build_note_out(n) for n in notes]


@router.post("", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
def create_note(
    note_in: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify course if provided
    if note_in.course_id:
        c = db.query(Course).filter(Course.id == note_in.course_id, Course.user_id == current_user.id).first()
        if not c:
            note_in.course_id = None

    # Verify unit_topic if provided
    if note_in.unit_topic_id:
        u = db.query(UnitTopic).filter(UnitTopic.id == note_in.unit_topic_id, UnitTopic.user_id == current_user.id).first()
        if not u:
            note_in.unit_topic_id = None

    # Verify resource if provided
    if note_in.resource_id:
        r = db.query(Resource).filter(Resource.id == note_in.resource_id, Resource.user_id == current_user.id).first()
        if not r:
            note_in.resource_id = None

    note = PersonalNote(
        user_id=current_user.id,
        course_id=note_in.course_id,
        unit_topic_id=note_in.unit_topic_id,
        resource_id=note_in.resource_id,
        title=note_in.title.strip() if note_in.title else "Untitled Note",
        content=note_in.content,
        tags=note_in.tags.strip() if note_in.tags else "",
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return build_note_out(note)


@router.get("/{note_id}", response_model=NoteOut)
def get_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = db.query(PersonalNote).filter(
        PersonalNote.id == note_id,
        PersonalNote.user_id == current_user.id
    ).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return build_note_out(note)


@router.put("/{note_id}", response_model=NoteOut)
def update_note(
    note_id: int,
    note_in: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = db.query(PersonalNote).filter(
        PersonalNote.id == note_id,
        PersonalNote.user_id == current_user.id
    ).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    if note_in.title is not None and note_in.title.strip():
        note.title = note_in.title.strip()
    if note_in.content is not None:
        note.content = note_in.content
    if note_in.course_id is not None:
        note.course_id = note_in.course_id if note_in.course_id > 0 else None
    if note_in.unit_topic_id is not None:
        note.unit_topic_id = note_in.unit_topic_id if note_in.unit_topic_id > 0 else None
    if note_in.resource_id is not None:
        note.resource_id = note_in.resource_id if note_in.resource_id > 0 else None
    if note_in.tags is not None:
        note.tags = note_in.tags.strip()

    db.commit()
    db.refresh(note)
    return build_note_out(note)


@router.delete("/{note_id}")
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = db.query(PersonalNote).filter(
        PersonalNote.id == note_id,
        PersonalNote.user_id == current_user.id
    ).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    db.delete(note)
    db.commit()
    return {"message": "Note deleted successfully."}
