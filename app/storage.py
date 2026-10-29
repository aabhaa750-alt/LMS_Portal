import hashlib
import os
import uuid
from pathlib import Path
from typing import Tuple
from fastapi import UploadFile, HTTPException, status
from app.config import (
    UPLOADS_DIR,
    MAX_UPLOAD_SIZE_BYTES,
    ALLOWED_EXTENSIONS,
    EXTENSION_TYPE_MAP,
)


def validate_file(file: UploadFile) -> Tuple[str, str]:
    """Validates the uploaded file extension and returns (extension, resource_type)."""
    filename = file.filename or "unnamed_file"
    ext = Path(filename).suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        allowed_str = ", ".join(sorted(ALLOWED_EXTENSIONS))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {allowed_str}"
        )

    resource_type = EXTENSION_TYPE_MAP.get(ext, "Document")
    return ext, resource_type


async def save_uploaded_file(file: UploadFile) -> Tuple[str, int, str]:
    """
    Saves the uploaded file to UPLOADS_DIR using a UUID filename.
    Computes SHA-256 and validates file size.
    Returns: (stored_filename, file_size_bytes, sha256_hash)
    """
    ext, _ = validate_file(file)
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    target_path = UPLOADS_DIR / unique_filename

    hasher = hashlib.sha256()
    total_size = 0

    try:
        with open(target_path, "wb") as f:
            while chunk := await file.read(1024 * 64):  # 64KB chunks
                total_size += len(chunk)
                if total_size > MAX_UPLOAD_SIZE_BYTES:
                    # Clean up partial file
                    f.close()
                    if target_path.exists():
                        target_path.unlink()
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File exceeds maximum allowed size of {MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)}MB"
                    )
                hasher.update(chunk)
                f.write(chunk)
    except HTTPException:
        raise
    except Exception as e:
        if target_path.exists():
            target_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )

    sha256_hash = hasher.hexdigest()
    return unique_filename, total_size, sha256_hash


def get_safe_file_path(stored_filename: str) -> Path:
    """
    Validates that the file exists and is strictly inside UPLOADS_DIR,
    preventing any directory traversal attacks.
    """
    safe_filename = os.path.basename(stored_filename)
    full_path = (UPLOADS_DIR / safe_filename).resolve()
    uploads_dir_resolved = UPLOADS_DIR.resolve()

    if not str(full_path).startswith(str(uploads_dir_resolved)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: invalid file path"
        )

    if not full_path.exists() or not full_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource file not found on disk"
        )

    return full_path


def delete_stored_file(stored_filename: str) -> bool:
    """Safely deletes a file from disk if it exists."""
    try:
        safe_path = get_safe_file_path(stored_filename)
        if safe_path.exists():
            safe_path.unlink()
            return True
    except Exception:
        pass
    return False
