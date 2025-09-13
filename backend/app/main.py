from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
from . import models, schemas
from .database import engine, SessionLocal
from .routers import auth, users, courses, quizzes, enrollments, modules
import os

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Digital Literacy Platform API", version="1.0.0")

# CORS middleware - allow production domains
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175"
]

# Add production frontend URL if available
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

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

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to the Digital Literacy Platform API"}

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy"}
