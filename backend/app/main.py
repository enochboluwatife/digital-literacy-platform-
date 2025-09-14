from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
from . import models, schemas
from .database import engine, SessionLocal
from .routers import auth, users, courses, quizzes, enrollments, modules
from .api import admin
import os

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Digital Literacy Platform API", version="1.0.0")

# CORS middleware configuration
def get_allowed_origins():
    """Get allowed origins from environment variable with fallback to defaults."""
    # Default allowed origins for development and production
    default_origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",  # Vite dev server
        "https://digital-literacy-platform.vercel.app",
        "https://digital-literacy-platform-git-main-enochs-projects-36982255.vercel.app",  # Specific Vercel deployment
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
        "https://digital-literacy-platform.onrender.com"
    ]
    
    # Get additional origins from environment variable
    frontend_urls = os.getenv("FRONTEND_URL", "")
    if frontend_urls:
        additional_origins = [url.strip() for url in frontend_urls.split(",") if url.strip()]
        return list(set(default_origins + additional_origins))
    return default_origins

# Configure CORS middleware with enhanced security
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_origin_regex=r"^https://.*\.vercel\.app$",  # Allow all Vercel preview deployments
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "Origin",
        "X-Requested-With",
        "X-CSRF-Token",
    ],
    expose_headers=["Content-Length", "X-Total-Count"],
    max_age=600,  # Cache preflight requests for 10 minutes
)

# Include routers with /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(courses.router, prefix="/api")
app.include_router(quizzes.router, prefix="/api")
app.include_router(enrollments.router, prefix="/api")
app.include_router(modules.router, prefix="/api")
app.include_router(admin.router)

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to the Digital Literacy Platform API"}

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy"}
