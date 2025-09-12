from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from pathlib import Path

# Import database and models
from .database import engine, Base, get_db
from .models import User, Course, Module, QuizQuestion, QuizOption, Enrollment, QuizAttempt

# Import routers
from .routers import auth, users, courses, quizzes, enrollments

# Create database tables
def create_tables():
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

# Initialize database tables
create_tables()

# Initialize FastAPI app
app = FastAPI(
    title="Digital Literacy Platform API",
    description="API for the Digital Literacy Platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(users.router, prefix="/api", tags=["Users"])
app.include_router(courses.router, prefix="/api", tags=["Courses"])
app.include_router(quizzes.router, prefix="/api", tags=["Quizzes"])
app.include_router(enrollments.router, prefix="/api", tags=["Enrollments"])

# Create static directory if it doesn't exist
static_dir = Path("static")
static_dir.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to the Digital Literacy Platform API",
        "docs": "/api/docs",
        "redoc": "/api/redoc"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok"}