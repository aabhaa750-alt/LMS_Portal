from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
DB_PATH = DATA_DIR / "lms.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

SECRET_KEY = os.getenv("LMS_SECRET_KEY", "mylearninghub-secure-session-key-2026-prod")
SESSION_COOKIE_NAME = "mylearninghub_session"
SESSION_MAX_AGE = 60 * 60 * 24 * 30  # 30 days

# Max file size: 50 MB
MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".ppt",
    ".pptx",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".txt",
    ".csv",
    ".png",
    ".jpg",
    ".jpeg",
}

EXTENSION_TYPE_MAP = {
    ".pdf": "PDF",
    ".ppt": "Presentation",
    ".pptx": "Presentation",
    ".doc": "Document",
    ".docx": "Document",
    ".xls": "Spreadsheet",
    ".xlsx": "Spreadsheet",
    ".txt": "Text",
    ".csv": "Spreadsheet",
    ".png": "Image",
    ".jpg": "Image",
    ".jpeg": "Image",
}
