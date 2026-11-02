from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.config import BASE_DIR
from app.database import engine, Base, ensure_schema_compatibility
from app.routers import (
    auth,
    courses,
    resources,
    dashboard,
    notes,
    bookmarks,
    progress,
    tasks,
    system,
    ai,
)

# Initialize database tables and ensure schema additions
Base.metadata.create_all(bind=engine)
ensure_schema_compatibility()

app = FastAPI(
    title="My Learning Hub — Personal LMS",
    description="A modern, high-performance personal Learning Management System for MBA and academic revision.",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(courses.router)
app.include_router(resources.router)
app.include_router(notes.router)
app.include_router(bookmarks.router)
app.include_router(progress.router)
app.include_router(tasks.router)
app.include_router(system.router)
app.include_router(ai.router)

# Mount static files
static_dir = BASE_DIR / "static"
static_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "My Learning Hub API", "version": "1.0.0"}


# SPA Fallback - serve index.html for all frontend routes
@app.get("/{full_path:path}")
async def serve_spa(request: Request, full_path: str):
    # Don't hijack API routes
    if full_path.startswith("api/"):
        return JSONResponse(status_code=404, content={"detail": "API endpoint not found"})

    # Check if a static file exists directly
    potential_static = static_dir / full_path
    if full_path and potential_static.is_file():
        return FileResponse(potential_static)

    # Return SPA index.html
    index_file = static_dir / "index.html"
    if index_file.exists():
        return FileResponse(index_file)

    return JSONResponse(status_code=404, content={"detail": "Index page not found"})
