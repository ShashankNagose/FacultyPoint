from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine, Base
from .models import Material, Assignment, Submission
from .routers import materials_router, assignments_router
from .settings import API_PREFIX

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploaded_files"
UPLOAD_DIR.mkdir(exist_ok=True)

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FacultyPoint API", description="Faculty Notes & Assignment Portal")

app.mount("/files", StaticFiles(directory=UPLOAD_DIR), name="files")

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(materials_router, prefix=API_PREFIX)
app.include_router(assignments_router, prefix=API_PREFIX)


@app.get("/")
def read_root():
    """Welcome endpoint"""
    return {
        "message": "Welcome to FacultyPoint API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
