# My Learning Hub — Personal LMS for MBA Studies

**My Learning Hub** is a modern, fully functional, personal Learning Management System (LMS) designed specifically for an MBA student to manage, organize, access, and revise semester-wise educational resources, lecture presentations, PDFs, class notes, assignments, projects, and exam preparation materials from a unified, distraction-free platform.

---

## Key Features

1. **Academic Dashboard**:
   - Live database-calculated metrics: Active Courses, Study Resources, Topics Mastered, and Overall Learning Progress.
   - Weekly study goal tracker with target topics and hours.
   - Recently Added Resources, Recently Accessed Materials (logged via Access History), and Bookmarked quick shelf.
   - Upcoming deadlines and urgent/overdue assignment countdown alerts.
   - One-click quick action modals: Add Course, Upload Resource, Create Note, Add Task.

2. **Hierarchical Course & Syllabus Management**:
   - Full hierarchy: **Academic Year &rarr; Semester &rarr; Course / Subject &rarr; Unit / Topic &rarr; Learning Resources**.
   - Create, edit, and delete courses with customizable color accents, codes, descriptions, and instructors.
   - Add syllabus units and study topics under each course.
   - Interactive topic completion status cycling: `Not Started` &rarr; `In Progress` &rarr; `Completed`.
   - Course-level topic mastery progress bars.
   - Optional 1-click **Starter MBA Subjects** seeder (Managerial Economics, Financial Accounting, Marketing Management, Product Management, Statistics & Business Analytics).

3. **Centralized Learning Resource Library**:
   - Multi-format support: **PDF, PPT/PPTX, DOC/DOCX, XLS/XLSX, TXT, CSV, PNG, JPG/JPEG** (up to 50MB per file).
   - Dynamic upload modal with drag-and-drop, course selection, optional syllabus topic linking, tags, and description.
   - Live upload progress bar and accidental duplicate upload detection.
   - Filter by course, syllabus topic, format, date, and keyword search.
   - Sort by newest, oldest, name (A-Z / Z-A), and file size.
   - Instant Grid View and List View toggle.
   - Rename resource titles without changing disk files.
   - Safe download endpoints with original filename headers.

4. **Dedicated PDF Reader & Study Workspace**:
   - In-app document viewer with clean toolbar.
   - Integrated page controls, zoom in/out, download button, bookmark toggle, and completion toggle.
   - **Linked Document Notes Drawer**: Take personal notes, framework summaries, or formulas side-by-side while studying any document.
   - Inline previews for images, plain text, and CSV files, with dedicated guidance cards for Office documents.

5. **Personal Study Notes Module**:
   - Two-column notes explorer with instant live search and course filtering.
   - Formatted markdown helper toolbar: Headings (H2, H3), Bold, Italic, Bullet lists, Numbered lists, and Code blocks.
   - Create standalone notes or link notes to courses, syllabus topics, and specific resources.

6. **Assignments & Academic Deadlines**:
   - Add assignments, group projects, exams, quizzes, case readings, and revisions.
   - Priority levels: `High`, `Medium`, `Low`.
   - Status tracking: `To Do`, `In Progress`, `Completed`.
   - Dual view modes: **Grouped List View** (with prominent Overdue warnings) and **Monthly Calendar Grid View**.

7. **Study Progress & Weekly Goals**:
   - Tracks actual syllabus topic completion, completely independent of file upload counts.
   - Course-by-course accordion breakdown with topic status dropdowns.
   - Weekly study goal setter with topic and hours targets.

8. **Security, Privacy & Data Backup**:
   - Secure session-based authentication with `HttpOnly`, `SameSite=lax` cookies and bcrypt password hashing.
   - Strict multi-user data isolation (each user can only view, edit, or delete their own courses, notes, and files).
   - Local persistent SQLite storage and UUID-based file naming with path traversal protection.
   - **1-Click Full System Backup**: Download an on-the-fly timestamped `.zip` archive containing the SQLite database (`lms.db`) and the complete uploads directory.

---

## Technology Stack

- **Backend**: Python 3.9+, FastAPI, Uvicorn, SQLAlchemy 2.0, Pydantic v2.
- **Database**: SQLite (ACID-compliant local storage).
- **Security**: Bcrypt, PyJWT, cryptographically generated session tokens.
- **File Storage**: Local persistent filesystem (`data/uploads/`) with SHA-256 integrity validation and traversal protection.
- **Frontend**: HTML5, Vanilla JavaScript (ES6+ modular architecture), Tailwind CSS (responsive light theme with restrained blue accents), and SVG icons.

---

## Directory Structure

```
my-learning-hub/
├── app/
│   ├── __init__.py
│   ├── config.py             # Configuration, directories, constants, file limits
│   ├── database.py           # SQLite connection, sessionmaker, base model
│   ├── models.py             # SQLAlchemy models (User, Course, UnitTopic, Resource, etc.)
│   ├── schemas.py            # Pydantic request/response schemas with ConfigDict
│   ├── auth.py               # Password hashing (bcrypt) and session cookie handling
│   ├── storage.py            # Safe file storage, UUID filenames, SHA256 checks
│   ├── seed_data.py          # Starter MBA curriculum seeder
│   ├── main.py               # FastAPI application, static mounting, SPA router
│   └── routers/
│       ├── __init__.py
│       ├── auth.py           # /api/auth (register, login, logout, profile)
│       ├── dashboard.py      # /api/dashboard (stats, recent items, deadlines)
│       ├── courses.py        # /api/courses (CRUD, syllabus units/topics)
│       ├── resources.py      # /api/resources (upload, download, view, delete)
│       ├── notes.py          # /api/notes (CRUD, search, resource linking)
│       ├── bookmarks.py      # /api/bookmarks (toggle, list, filter)
│       ├── progress.py       # /api/progress (topic status, weekly goals)
│       ├── tasks.py          # /api/tasks (deadlines, list & calendar)
│       └── system.py         # /api/system (backup zip download, storage stats)
├── data/                     # Persistent local storage
│   ├── lms.db                # SQLite database file
│   └── uploads/              # Local uploaded documents (UUID stored)
├── static/
│   ├── css/
│   │   └── styles.css        # Custom scrollbars, animations, typography
│   ├── js/
│   │   ├── api.js            # API client wrapper
│   │   ├── components.js     # Icons, formatters, toasts, confirm modals
│   │   ├── app.js            # Router, state, search modal, modal controller
│   │   └── views/
│   │       ├── auth.js       # Login & Register views
│   │       ├── dashboard.js  # Main dashboard view
│   │       ├── courses.js    # Course & curriculum hierarchy view
│   │       ├── library.js    # Resource library (grid/list, filters)
│   │       ├── reader.js     # PDF reader & study workspace with linked notes
│   │       ├── notes.js      # Personal notes editor & explorer
│   │       ├── bookmarks.js  # Bookmarks view
│   │       ├── progress.js   # Study progress tracker
│   │       ├── tasks.js      # Assignments & calendar view
│   │       ├── profile.js    # Personal student profile
│   │       └── settings.js   # Settings & backup management
│   └── index.html            # Single Page Application shell
├── tests/
│   ├── test_core_flows.py    # Integration tests for all core LMS flows
│   └── test_persistence.py   # Database and filesystem restart persistence tests
├── requirements.txt          # Python dependencies
├── run.py                    # Server startup script
└── README.md                 # Documentation
```

---

## Setup & Running Instructions

### 1. Prerequisites
- macOS, Linux, or Windows with Python 3.9 or higher installed.

### 2. Environment Setup & Dependency Installation
Navigate to the project root directory and create a virtual environment:

```bash
cd /Users/aabhaagrawal/.gemini/antigravity/scratch/my-learning-hub

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install httpx pytest   # Optional: for running the test suite
```

### 3. Run the Application
Start the server using `run.py` or `uvicorn`:

```bash
# Using run.py
python run.py

# Or directly with uvicorn
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Open your browser and navigate to:
```
http://127.0.0.1:8000
```

### 4. Running the Automated Test Suite
To verify all user flows, database persistence, and security controls:

```bash
PYTHONPATH=. ./venv/bin/pytest tests/ -v
```

---

## API Documentation & Endpoints

When the server is running, interactive OpenAPI documentation is automatically available at:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### Summary of REST Endpoints:

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | Register new user and start session |
| | `POST` | `/api/auth/login` | Login with email and password |
| | `POST` | `/api/auth/logout` | Invalidate session and clear cookie |
| | `GET` | `/api/auth/me` | Fetch authenticated user profile |
| | `PUT` | `/api/auth/profile` | Update name, degree, year, and semester |
| | `PUT` | `/api/auth/password` | Change password with verification |
| **Dashboard** | `GET` | `/api/dashboard` | Real-time counts, progress %, and deadlines |
| **Courses** | `GET` | `/api/courses` | List courses with topic & resource counts |
| | `POST` | `/api/courses` | Create new course/subject |
| | `GET` | `/api/courses/{id}` | Course detail with full syllabus topics |
| | `PUT` | `/api/courses/{id}` | Update course details |
| | `DELETE`| `/api/courses/{id}` | Delete course and associated files |
| | `POST` | `/api/courses/{id}/units` | Add syllabus unit and topic |
| | `PATCH`| `/api/courses/units/{id}/status` | Update topic status (Not Started/In Progress/Completed) |
| | `DELETE`| `/api/courses/units/{id}` | Delete topic |
| **Resources** | `POST` | `/api/resources/upload` | Upload file with duplicate check & metadata |
| | `GET` | `/api/resources` | Filter resources (course, type, search, sort) |
| | `GET` | `/api/resources/{id}` | Resource metadata |
| | `PUT` | `/api/resources/{id}` | Update title, course, topic, tags |
| | `DELETE`| `/api/resources/{id}` | Delete record and disk file |
| | `GET` | `/api/resources/{id}/download` | Safe download with original filename |
| | `GET` | `/api/resources/{id}/view` | In-browser preview stream + access logging |
| | `POST` | `/api/resources/{id}/toggle-complete` | Toggle completion status |
| **Notes** | `GET` | `/api/notes` | List and search notes |
| | `POST` | `/api/notes` | Create note linked to course/resource |
| | `GET` | `/api/notes/{id}` | Get note details |
| | `PUT` | `/api/notes/{id}` | Update note content and tags |
| | `DELETE`| `/api/notes/{id}` | Delete note |
| **Bookmarks** | `GET` | `/api/bookmarks` | List all bookmarked materials |
| | `POST` | `/api/bookmarks/{id}` | Toggle bookmark status |
| **Progress** | `GET` | `/api/progress` | Syllabus mastery %, breakdown, weekly goal |
| | `POST` | `/api/progress/goal` | Save weekly study target |
| **Tasks** | `GET` | `/api/tasks` | List tasks (overdue, priority, course filters) |
| | `POST` | `/api/tasks` | Create task / assignment |
| | `PUT` | `/api/tasks/{id}` | Update task details |
| | `PATCH`| `/api/tasks/{id}/status` | Cycle task status (To Do/In Progress/Completed) |
| | `DELETE`| `/api/tasks/{id}` | Delete task |
| **System** | `GET` | `/api/system/storage-info` | Real database size, uploads folder stats |
| | `GET` | `/api/system/backup` | Stream full `.zip` backup archive |
| | `POST` | `/api/system/seed-demo` | Seed starter core MBA courses |

---

## Data Backup and Recovery Procedure

### How to Create a Backup
1. **Via UI**: Navigate to the **Settings & Backup** page and click **"Download Full Backup (.zip)"**.
2. **Via Endpoint**: Send a GET request to `/api/system/backup` while authenticated.
3. **Manual Backup**: Copy the `data/` folder:
   - Database: `data/lms.db`
   - Uploaded Files: `data/uploads/*`

### How to Restore from a Backup
1. Unzip the downloaded `.zip` file.
2. Replace `data/lms.db` with the file inside `database/lms.db`.
3. Copy all files from the `uploads/` folder into `data/uploads/`.
4. Start the application with `python run.py`. All courses, files, bookmarks, notes, and study progress will be immediately available.
