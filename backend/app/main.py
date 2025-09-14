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

# CORS middleware - allow production domains
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:5173",
    "https://digital-literacy-platform.vercel.app",
    "https://digital-literacy-platform.onrender.com"
]

# Add frontend URL from environment if it exists
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    if "," in frontend_url:
        allowed_origins.extend([url.strip() for url in frontend_url.split(",")])
    else:
        allowed_origins.append(frontend_url.strip())

# For production, use the allowed_origins list which includes the Vercel URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
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
