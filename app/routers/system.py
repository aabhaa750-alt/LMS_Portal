import io
import os
import zipfile
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Course, Resource, UnitTopic, TaskAssignment, PersonalNote
from app.auth import get_current_user
from app.config import DB_PATH, UPLOADS_DIR, DATA_DIR
from app.seed_data import seed_mba_starter_data

router = APIRouter(prefix="/api/system", tags=["System & Settings"])


@router.post("/seed-demo")
def seed_demo_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = seed_mba_starter_data(db, current_user)
    return result


@router.get("/storage-info")
def get_storage_info(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Database size
    db_size = os.path.getsize(DB_PATH) if DB_PATH.exists() else 0

    # Uploads folder size & file count
    upload_files = list(UPLOADS_DIR.glob("*")) if UPLOADS_DIR.exists() else []
    total_uploads_size = sum(f.stat().st_size for f in upload_files if f.is_file())
    total_upload_files = len([f for f in upload_files if f.is_file()])

    # User specific counts
    user_courses = db.query(Course).filter(Course.user_id == current_user.id).count()
    user_resources = db.query(Resource).filter(Resource.user_id == current_user.id).count()
    user_notes = db.query(PersonalNote).filter(PersonalNote.user_id == current_user.id).count()
    user_tasks = db.query(TaskAssignment).filter(TaskAssignment.user_id == current_user.id).count()

    return {
        "db_size_bytes": db_size,
        "db_size_human": f"{db_size / 1024:.1f} KB" if db_size < 1024*1024 else f"{db_size / (1024*1024):.2f} MB",
        "uploads_size_bytes": total_uploads_size,
        "uploads_size_human": f"{total_uploads_size / 1024:.1f} KB" if total_uploads_size < 1024*1024 else f"{total_uploads_size / (1024*1024):.2f} MB",
        "upload_files_count": total_upload_files,
        "user_courses": user_courses,
        "user_resources": user_resources,
        "user_notes": user_notes,
        "user_tasks": user_tasks,
        "db_path": str(DB_PATH),
        "uploads_path": str(UPLOADS_DIR),
    }


@router.get("/backup")
def download_system_backup(
    current_user: User = Depends(get_current_user)
):
    """
    Creates an in-memory ZIP archive containing the SQLite database
    and all uploaded files in the uploads directory, enabling 1-click full offline backup.
    """
    zip_buffer = io.BytesIO()
    timestamp_str = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    zip_filename = f"mylearninghub_backup_{timestamp_str}.zip"

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        # Add SQLite database file
        if DB_PATH.exists():
            zip_file.write(DB_PATH, arcname=f"database/{DB_PATH.name}")

        # Add all files from UPLOADS_DIR
        if UPLOADS_DIR.exists():
            for file_path in UPLOADS_DIR.glob("*"):
                if file_path.is_file():
                    zip_file.write(file_path, arcname=f"uploads/{file_path.name}")

    zip_buffer.seek(0)

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{zip_filename}"'}
    )
