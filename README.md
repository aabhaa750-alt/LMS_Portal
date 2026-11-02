# My Learning Hub — AI-Powered MBA Learning Platform

**My Learning Hub – MBA Edition** is a modern, high-performance personal Learning Management System (LMS) and AI study platform designed specifically for MBA students to organize, master, and revise semester-wise educational resources, lecture presentations, PDFs, class notes, assignments, and exam preparation materials from a unified, distraction-free environment.

---

## 🚀 Key Features

### 1. Executive Bento Grid Dashboard
- **Dynamic Time-Based Greeting**: Morning, afternoon, evening, and late-night contextual greetings with adaptive study prompts.
- **Your Study Plan for Today**: Intelligent daily recommendations based on active courses, deadlines, and incomplete syllabus topics with interactive completion tracking.
- **Continue Where You Left Off**: 1-click resume card recalling the exact slide/page and deck last accessed.
- **Weekly Study Target**: High-contrast progress bar tracking topic completions against weekly goals.
- **Curriculum Mastery Ring**: Animated SVG donut meter reflecting syllabus topic completions.
- **MBA in the Real World**: Editorial briefing with corporate case insights and 1-click AI exploration prompts.

### 2. AI Study Assistant & Intelligence Engine
- **Deck-Grounded Concept Explainer**: 5-part structured conceptual breakdown:
  1. Plain-English intuition
  2. Formal MBA business definition
  3. Real-world corporate example
  4. Strategic framework application
  5. Common pitfalls and exam tips
- **Presentation-to-Notes Synthesis**: Generates clean, structured study notes with executive summaries, core takeaways, and frameworks directly from uploaded slide decks.
- **Interactive Multi-Turn AI Chat**: Context-aware chat grounded in your classroom materials with exact slide/page citations.
- **Hybrid Intelligence**: Works 100% offline using the built-in slide-grounded search engine, with optional OpenAI GPT-4o-mini integration.

### 3. Hierarchical Course & Syllabus Studio
- **Full Hierarchy**: `Academic Year → Semester → Course/Subject → Units/Topics → Learning Resources`.
- **Topic Mastery Tracking**: Cycle topic status through `Not Started`, `In Progress`, and `Completed`.
- **Starter MBA Curriculum**: 1-click seeder for core subjects (Managerial Economics, Financial Accounting, Marketing Management, Product Management, and Business Analytics).

### 4. Centralized Learning Resource Library
- **Multi-Format Support**: PPT/PPTX, PDF, DOC/DOCX, XLS/XLSX, TXT, CSV, PNG, JPG/JPEG (up to 50MB per file).
- **Dual Views**: Instant toggle between Grid View and List View.
- **Quick AI Actions**: Direct access to "Ask AI", "Synthesize Notes", and chunk inspection for any file.

### 5. Dedicated PDF Reader & Study Workspace
- Integrated document reader with page controls, zoom, bookmarking, and completion toggles.
- **Linked Document Notes Drawer**: Take revision notes and capture formulas side-by-side while studying.

### 6. Personal Study Notes Module
- Notion-grade split-pane notebook with full-text search and subject filtering.
- Formatting helper toolbar with Markdown support for headings, bold, lists, and code blocks.

### 7. Assignments & Academic Deadlines
- Group projects, case analyses, midterm exams, and quizzes with priority tags (`High`, `Medium`, `Low`).
- Dual views: **Grouped List View** (with urgent/overdue alerts) and **Monthly Calendar Grid**.

### 8. Security, Privacy & Local Persistence
- Session-based authentication with `HttpOnly` cookies and bcrypt password hashing.
- Strict multi-user data isolation.
- Persistent local SQLite storage (`data/lms.db`).
- **1-Click Full Backup & Recovery**: Download timestamped `.zip` archives containing the SQLite database and uploaded materials.

---

## 🛠️ Technology Stack

- **Backend**: Python 3.9+, FastAPI, Uvicorn, SQLAlchemy 2.0, Pydantic v2
- **Database**: SQLite (ACID-compliant local storage with foreign key constraints)
- **AI & Document Processing**: `python-pptx`, `pypdf`, `beautifulsoup4`, optional `openai` SDK
- **Frontend**: HTML5, Vanilla JavaScript (ES6+ modular architecture), Tailwind CSS, Plus Jakarta Sans, Newsreader serif, JetBrains Mono
- **File Storage**: Local persistent filesystem (`data/uploads/`) with UUID naming and path traversal protection

---

## 📂 Directory Structure

```
my-learning-hub/
├── app/
│   ├── __init__.py
│   ├── config.py             # Configuration, directories, constants, file limits
│   ├── database.py           # SQLite connection, sessionmaker, schema migrations
│   ├── models.py             # SQLAlchemy models (User, Course, Resource, etc.)
│   ├── schemas.py            # Pydantic request/response schemas
│   ├── auth.py               # Password hashing (bcrypt) and session cookie handling
│   ├── storage.py            # File persistence, UUID filenames, SHA-256 checks
│   ├── ai_extractor.py       # Slide text extractor for PPTX, PDF, TXT, CSV
│   ├── ai_service.py         # Grounded AI synthesis, chat, and OpenAI integration
│   ├── seed_data.py          # Starter MBA curriculum seeder
│   ├── main.py               # FastAPI application, static mounting, SPA router
│   └── routers/
│       ├── auth.py           # Authentication (/api/auth)
│       ├── dashboard.py      # Dashboard analytics & study plan (/api/dashboard)
│       ├── courses.py        # Course & syllabus management (/api/courses)
│       ├── resources.py      # File uploads & metadata (/api/resources)
│       ├── ai.py             # AI Study Assistant & concept explainer (/api/ai)
│       ├── notes.py          # Study notes editor (/api/notes)
│       ├── bookmarks.py      # Bookmarks (/api/bookmarks)
│       ├── progress.py       # Progress tracker & weekly goals (/api/progress)
│       ├── tasks.py          # Assignments & calendar (/api/tasks)
│       └── system.py         # System backup & storage stats (/api/system)
├── data/
│   ├── lms.db                # SQLite database (kept local, excluded from git)
│   └── uploads/              # Uploaded documents (kept local, excluded from git)
│       └── .gitkeep
├── static/
│   ├── css/
│   │   └── styles.css        # Design tokens, bento surfaces, animations
│   ├── js/
│   │   ├── api.js            # Frontend API client
│   │   ├── components.js     # Icons, formatters, toasts, modals
│   │   ├── app.js            # Router, state, search, modal controller
│   │   └── views/
│   │       ├── auth.js       # Login & Register views
│   │       ├── dashboard.js  # Bento Grid Dashboard
│   │       ├── ai_assistant.js# AI Study Assistant view
│   │       ├── courses.js    # Course & curriculum studio
│   │       ├── library.js    # Resource library
│   │       ├── reader.js     # PDF reader & workspace
│   │       ├── notes.js      # Study notes editor
│   │       ├── bookmarks.js  # Bookmarks cabinet
│   │       ├── progress.js   # Study progress analytics
│   │       ├── tasks.js      # Assignments & calendar view
│   │       ├── profile.js    # Student profile
│   │       └── settings.js   # Settings, storage & AI config
│   └── index.html            # Application shell
├── tests/
│   ├── test_core_flows.py    # Integration tests for core LMS flows
│   ├── test_ai_features.py   # AI Assistant & concept explainer tests
│   ├── test_dashboard_enhancements.py # Study plan & continue learning tests
│   └── test_persistence.py   # Database & filesystem persistence tests
├── .env.example              # Example environment configuration
├── .gitignore                # Excludes DB, uploads, venv, and cache
├── requirements.txt          # Python dependencies
├── run.py                    # Server startup script
└── README.md                 # Project documentation
```

---

## ⚡ Quick Start Instructions

### 1. Prerequisites
- Python 3.9 or higher
- Git

### 2. Clone and Setup
```bash
# Clone the repository
git clone https://github.com/aabhaa750-alt/LMS_Portal.git
cd LMS_Portal

# Create virtual environment
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Start the Server
```bash
python run.py
```
Open your browser and navigate to:
```
http://127.0.0.1:8000
```

### 4. Running the Test Suite
```bash
PYTHONPATH=. ./venv/bin/pytest tests/ -v
```

---

## 📦 Data Backup & Local Restore

- **1-Click Backup**: Open **Settings & Data** in the web app and click **"Download Full Backup (.zip)"**.
- **Restore**: Extract the backup ZIP file:
  - Copy `database/lms.db` into `data/lms.db`
  - Copy all files from `uploads/` into `data/uploads/`
  - Restart the application (`python run.py`). All courses, notes, and study progress are immediately restored.
