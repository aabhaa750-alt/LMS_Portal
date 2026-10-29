import os
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.database import get_db
from app.models import User, Course, UnitTopic, Resource, Bookmark, AccessHistory
from app.schemas import ResourceOut, ResourceUpdate
from app.auth import get_current_user
from app.storage import save_uploaded_file, get_safe_file_path, delete_stored_file, EXTENSION_TYPE_MAP
from pathlib import Path

router = APIRouter(prefix="/api/resources", tags=["Resources"])


def build_resource_out(res: Resource, current_user_id: int, db: Session) -> ResourceOut:
    is_bookmarked = db.query(Bookmark).filter(
        Bookmark.resource_id == res.id,
        Bookmark.user_id == current_user_id
    ).first() is not None

    last_access = db.query(AccessHistory).filter(
        AccessHistory.resource_id == res.id,
        AccessHistory.user_id == current_user_id
    ).order_by(AccessHistory.accessed_at.desc()).first()

    return ResourceOut(
        id=res.id,
        user_id=res.user_id,
        course_id=res.course_id,
        course_name=res.course.name if res.course else "Unknown",
        course_code=res.course.code if res.course else None,
        course_color=res.course.color if res.course else "#2563eb",
        unit_topic_id=res.unit_topic_id,
        unit_title=res.unit_topic.unit_title if res.unit_topic else None,
        topic_title=res.unit_topic.topic_title if res.unit_topic else None,
        title=res.title,
        description=res.description,
        resource_type=res.resource_type,
        original_filename=res.original_filename,
        file_extension=res.file_extension,
        file_size=res.file_size,
        mime_type=res.mime_type,
        tags=res.tags or "",
        is_completed=res.is_completed,
        is_bookmarked=is_bookmarked,
        last_accessed_at=last_access.accessed_at if last_access else None,
        created_at=res.created_at,
        updated_at=res.updated_at,
    )


@router.post("/upload", response_model=ResourceOut, status_code=status.HTTP_201_CREATED)
async def upload_resource(
    course_id: int = Form(...),
    file: UploadFile = File(...),
    unit_topic_id: Optional[int] = Form(None),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify course ownership
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.user_id == current_user.id
    ).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Selected course not found.")

    # Verify unit topic if provided
    if unit_topic_id:
        topic = db.query(UnitTopic).filter(
            UnitTopic.id == unit_topic_id,
            UnitTopic.course_id == course_id,
            UnitTopic.user_id == current_user.id
        ).first()
        if not topic:
            unit_topic_id = None

    # Save file safely to disk and compute hash
    stored_filename, file_size, file_hash = await save_uploaded_file(file)
    ext = Path(file.filename or "").suffix.lower()
    resource_type = EXTENSION_TYPE_MAP.get(ext, "Document")

    # Check for accidental duplicate upload within the same course
    duplicate = db.query(Resource).filter(
        Resource.user_id == current_user.id,
        Resource.course_id == course_id,
        Resource.file_hash == file_hash
    ).first()

    if duplicate:
        # Delete newly saved file
        delete_stored_file(stored_filename)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Duplicate file: This exact file has already been uploaded to this course as '{duplicate.title}'."
        )

    # Determine title
    final_title = title.strip() if title and title.strip() else Path(file.filename or "Resource").stem

    resource = Resource(
        user_id=current_user.id,
        course_id=course.id,
        unit_topic_id=unit_topic_id,
        title=final_title,
        description=description.strip() if description else None,
        resource_type=resource_type,
        file_path=stored_filename,
        original_filename=file.filename or "document",
        file_extension=ext,
        file_size=file_size,
        mime_type=file.content_type,
        file_hash=file_hash,
        tags=tags.strip() if tags else "",
        is_completed=False,
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)

    return build_resource_out(resource, current_user.id, db)


@router.get("", response_model=List[ResourceOut])
def get_resources(
    course_id: Optional[int] = None,
    unit_topic_id: Optional[int] = None,
    resource_type: Optional[str] = None,
    search: Optional[str] = None,
    tag: Optional[str] = None,
    is_completed: Optional[bool] = None,
    sort_by: str = Query("newest", pattern="^(newest|oldest|name_asc|name_desc|size_desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Resource).filter(Resource.user_id == current_user.id)

    if course_id:
        query = query.filter(Resource.course_id == course_id)
    if unit_topic_id:
        query = query.filter(Resource.unit_topic_id == unit_topic_id)
    if resource_type:
        query = query.filter(Resource.resource_type == resource_type)
    if is_completed is not None:
        query = query.filter(Resource.is_completed == is_completed)
    if tag:
        query = query.filter(Resource.tags.ilike(f"%{tag.strip()}%"))

    if search:
        search_term = f"%{search.strip()}%"
        # Join course and unit_topic for comprehensive search
        query = query.outerjoin(Course, Resource.course_id == Course.id)\
                     .outerjoin(UnitTopic, Resource.unit_topic_id == UnitTopic.id)\
                     .filter(
                         or_(
                             Resource.title.ilike(search_term),
                             Resource.description.ilike(search_term),
                             Resource.original_filename.ilike(search_term),
                             Resource.tags.ilike(search_term),
                             Course.name.ilike(search_term),
                             UnitTopic.topic_title.ilike(search_term),
                             UnitTopic.unit_title.ilike(search_term)
                         )
                     )

    # Sorting
    if sort_by == "oldest":
        query = query.order_by(Resource.created_at.asc())
    elif sort_by == "name_asc":
        query = query.order_by(Resource.title.asc())
    elif sort_by == "name_desc":
        query = query.order_by(Resource.title.desc())
    elif sort_by == "size_desc":
        query = query.order_by(Resource.file_size.desc())
    else:  # newest default
        query = query.order_by(Resource.created_at.desc())

    resources = query.all()
    return [build_resource_out(r, current_user.id, db) for r in resources]


@router.get("/{resource_id}", response_model=ResourceOut)
def get_resource(
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

    return build_resource_out(resource, current_user.id, db)


@router.put("/{resource_id}", response_model=ResourceOut)
def update_resource(
    resource_id: int,
    res_in: ResourceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resource = db.query(Resource).filter(
        Resource.id == resource_id,
        Resource.user_id == current_user.id
    ).first()

    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")

    if res_in.title is not None and res_in.title.strip():
        resource.title = res_in.title.strip()
    if res_in.description is not None:
        resource.description = res_in.description.strip() if res_in.description else None
    if res_in.course_id is not None:
        course = db.query(Course).filter(Course.id == res_in.course_id, Course.user_id == current_user.id).first()
        if course:
            resource.course_id = course.id
    if res_in.unit_topic_id is not None:
        if res_in.unit_topic_id == 0:
            resource.unit_topic_id = None
        else:
            topic = db.query(UnitTopic).filter(UnitTopic.id == res_in.unit_topic_id, UnitTopic.user_id == current_user.id).first()
            if topic:
                resource.unit_topic_id = topic.id
    if res_in.tags is not None:
        resource.tags = res_in.tags.strip()
    if res_in.is_completed is not None:
        resource.is_completed = res_in.is_completed

    db.commit()
    db.refresh(resource)
    return build_resource_out(resource, current_user.id, db)


@router.delete("/{resource_id}")
def delete_resource(
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

    # Safe delete from filesystem
    delete_stored_file(resource.file_path)

    db.delete(resource)
    db.commit()
    return {"message": f"Resource '{resource.title}' deleted successfully."}


@router.get("/{resource_id}/download")
def download_resource(
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

    file_path = get_safe_file_path(resource.file_path)

    # Log access history
    access = AccessHistory(user_id=current_user.id, resource_id=resource.id, accessed_at=datetime.utcnow())
    db.add(access)
    db.commit()

    return FileResponse(
        path=str(file_path),
        filename=resource.original_filename,
        media_type=resource.mime_type or "application/octet-stream"
    )


@router.get("/{resource_id}/view")
def view_resource(
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

    file_path = get_safe_file_path(resource.file_path)

    # Log access history
    access = AccessHistory(user_id=current_user.id, resource_id=resource.id, accessed_at=datetime.utcnow())
    db.add(access)
    db.commit()

    media_type = resource.mime_type or "application/octet-stream"
    if resource.file_extension == ".pdf":
        media_type = "application/pdf"
    elif resource.file_extension in [".jpg", ".jpeg"]:
        media_type = "image/jpeg"
    elif resource.file_extension == ".png":
        media_type = "image/png"
    elif resource.file_extension in [".txt", ".csv"]:
        media_type = "text/plain; charset=utf-8"

    return FileResponse(
        path=str(file_path),
        media_type=media_type,
        headers={"Content-Disposition": f'inline; filename="{resource.original_filename}"'}
    )


@router.post("/{resource_id}/toggle-complete", response_model=ResourceOut)
def toggle_resource_complete(
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

    resource.is_completed = not resource.is_completed
    db.commit()
    db.refresh(resource)

    return build_resource_out(resource, current_user.id, db)
