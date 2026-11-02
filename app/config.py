from pathlib import Path
import os
import tempfile

BASE_DIR = Path(__file__).resolve().parent.parent

# Detect if running in a serverless environment with read-only root (Vercel, AWS Lambda)
IS_SERVERLESS = bool(
    os.getenv("VERCEL") or 
    os.getenv("AWS_LAMBDA_FUNCTION_NAME") or 
    os.getenv("LAMBDA_TASK_ROOT")
)

# Database Configuration: Support PostgreSQL (Neon, Supabase, RDS) or SQLite fallback
RAW_DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
if RAW_DATABASE_URL:
    if RAW_DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = RAW_DATABASE_URL.replace("postgres://", "postgresql://", 1)
    else:
        DATABASE_URL = RAW_DATABASE_URL
    DB_PATH = None
    IS_POSTGRES = True
    IS_SQLITE = False
else:
    # Use SQLite for local development or fallback
    IS_POSTGRES = False
    IS_SQLITE = True
    if IS_SERVERLESS:
        DATA_DIR = Path(tempfile.gettempdir()) / "mylearninghub"
    else:
        DATA_DIR = BASE_DIR / "data"
    
    DB_PATH = DATA_DIR / "lms.db"
    DATABASE_URL = f"sqlite:///{DB_PATH}"

# Configure data and uploads directories
if IS_SERVERLESS:
    DATA_DIR = Path(tempfile.gettempdir()) / "mylearninghub"
    UPLOADS_DIR = DATA_DIR / "uploads"
else:
    DATA_DIR = BASE_DIR / "data"
    UPLOADS_DIR = DATA_DIR / "uploads"

# Ensure directories exist safely (handling read-only filesystems)
try:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
except (OSError, PermissionError):
    DATA_DIR = Path(tempfile.gettempdir()) / "mylearninghub"
    UPLOADS_DIR = DATA_DIR / "uploads"
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    if IS_SQLITE:
        DB_PATH = DATA_DIR / "lms.db"
        DATABASE_URL = f"sqlite:///{DB_PATH}"


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
