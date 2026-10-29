from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Resource, Bookmark
from app.schemas import ResourceOut
from app.auth import get_current_user
from app.routers.resources import build_resource_out

router = APIRouter(prefix="/api/bookmarks", tags=["Bookmarks"])


@router.get("", response_model=List[ResourceOut])
def get_bookmarks(
    course_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Resource).join(Bookmark, Resource.id == Bookmark.resource_id).filter(
        Bookmark.user_id == current_user.id
    )

    if course_id:
        query = query.filter(Resource.course_id == course_id)

    resources = query.order_by(Bookmark.created_at.desc()).all()
    return [build_resource_out(r, current_user.id, db) for r in resources]


@router.post("/{resource_id}")
def toggle_bookmark(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resource = db.query(Resource).filter(
        Resource.id == resource_id,
        Resource.user_id == current_user.id
    ).first()

    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")

    existing = db.query(Bookmark).filter(
        Bookmark.resource_id == resource_id,
        Bookmark.user_id == current_user.id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"bookmarked": False, "message": "Bookmark removed."}
    else:
        new_bm = Bookmark(resource_id=resource_id, user_id=current_user.id)
        db.add(new_bm)
        db.commit()
        return {"bookmarked": True, "message": "Resource bookmarked."}
