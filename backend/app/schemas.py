from pydantic import BaseModel, Field
from typing import List, Optional, Union
from enum import Enum
from datetime import datetime

class UserRole(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str
    first_name: str
    last_name: str
    institution: Optional[str] = None
    role: UserRole = UserRole.STUDENT

class UserOut(UserBase):
    id: int
    first_name: str
    last_name: str
    institution: Optional[str] = None
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    institution: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

# Course related schemas
class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    video_url: Optional[str] = None
    content_type: str = "text"  # text, video, mixed
    is_published: bool = False

class CourseCreate(CourseBase):
    pass

class CourseUpdate(CourseBase):
    title: Optional[str] = None
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    video_url: Optional[str] = None
    content_type: Optional[str] = None
    is_published: Optional[bool] = None

class CourseOut(CourseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    modules_count: Optional[int] = 0
    enrolled_users_count: Optional[int] = 0

    class Config:
        from_attributes = True

# Module related schemas
class ModuleBase(BaseModel):
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    content_type: str = "text"  # text, video, quiz, etc.
    duration: int = 0  # in minutes
    order_index: int = 0
    is_published: bool = True

class ModuleCreate(BaseModel):
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    content_type: str = "text"
    duration: int = 0
    order_index: int = 0
    is_published: bool = True

class ModuleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    content_type: Optional[str] = None
    duration: Optional[int] = None
    order_index: Optional[int] = None
    is_published: Optional[bool] = None

class ModuleOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    content_type: str = "text"
    duration: int = 0
    order_index: int = 0
    is_published: bool = True
    course_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Quiz related schemas
class QuizOptionBase(BaseModel):
    option_text: str
    is_correct: bool = False
    question_id: int

class QuizOptionCreate(QuizOptionBase):
    pass

class QuizOptionOut(QuizOptionBase):
    id: int

    class Config:
        from_attributes = True

class QuizQuestionBase(BaseModel):
    question: str
    module_id: int
    points: int = 1

class QuizQuestionCreate(QuizQuestionBase):
    options: List[QuizOptionCreate]

class QuizQuestionOut(QuizQuestionBase):
    id: int
    options: List[QuizOptionOut] = []
    created_at: datetime

    class Config:
        from_attributes = True

class QuizAnswer(BaseModel):
    question_id: int
    selected_option_id: int

class QuizSubmission(BaseModel):
    answers: List[QuizAnswer]

class QuizResult(BaseModel):
    score: float
    total_questions: int
    correct_answers: int
    passed: bool
    feedback: Optional[str] = None

# Enrollment related schemas
class EnrollmentBase(BaseModel):
    user_id: int
    course_id: int
    completed: bool = False
    progress: int = 0  # 0-100

class EnrollmentCreate(BaseModel):
    course_id: int

class EnrollmentUpdate(BaseModel):
    completed: Optional[bool] = None
    progress: Optional[int] = None

class EnrollmentOut(EnrollmentBase):
    id: int
    enrolled_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Progress tracking
class UserProgress(BaseModel):
    course_id: int
    progress: int
    completed_modules: int
    total_modules: int
    last_accessed: Optional[datetime] = None
    next_module_id: Optional[int] = None

# Authentication
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    sub: Optional[str] = None  # Will store the email as subject
    email: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None  # Store role as string for JWT compatibility
    
    class Config:
        from_attributes = True

# Response models
class UserProgressOut(BaseModel):
    """Schema for user progress response"""
    total_courses: int = 0
    completed_courses: int = 0
    in_progress_courses: int = 0
    average_progress: float = 0.0
    enrollments: List[EnrollmentOut] = []
    
    class Config:
        from_attributes = True

class ModuleWithContent(ModuleOut):
    quiz_questions: List[QuizQuestionOut] = []
    
    class Config:
        from_attributes = True

class CourseWithModules(CourseOut):
    modules: List[ModuleOut] = []
    
    class Config:
        from_attributes = True

# Search and filter
class SearchQuery(BaseModel):
    query: str
    limit: int = 10
    offset: int = 0

# File upload
class FileUploadResponse(BaseModel):
    filename: str
    content_type: str
    size: int
    url: str
