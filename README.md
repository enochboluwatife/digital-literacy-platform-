# Digital Literacy Platform

A comprehensive digital literacy learning platform designed for Nigerian higher institution students, providing accessible and interactive learning modules to enhance digital skills and competency.

## 🎯 Project Overview

This platform addresses the digital literacy gap among Nigerian university students by providing structured learning modules covering essential digital skills including computer basics, internet usage, digital communication, and online safety.

## ✨ Features Implemented

### 1. **User Authentication & Authorization**
- ✅ Student registration and login system
- ✅ Role-based access control (Student, Teacher, Admin)
- ✅ Secure JWT-based authentication
- ✅ Password hashing and validation

### 2. **Course Management System**
- ✅ Course listing and browsing
- ✅ Course content viewing (text-based modules)
- ✅ Course enrollment system
- ✅ Progress tracking infrastructure

### 3. **Assessment & Quiz System**
- ✅ Quiz creation and management (backend ready)
- ✅ Multiple choice questions support
- ✅ Progress tracking and scoring
- ✅ Student performance analytics

### 4. **Admin Dashboard**
- ✅ Complete admin panel for content management
- ✅ User management (view, create, delete users)
- ✅ Course management (create, edit, publish courses)
- ✅ Analytics dashboard with key metrics

### 5. **Teacher Portal** (Bonus Feature)
- ✅ Teacher-specific dashboard
- ✅ Course creation and editing tools
- ✅ Student progress monitoring
- ✅ Content management interface

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **React Router v6** - Client-side routing with data router API
- **Chakra UI** - Modern, accessible component library
- **Axios** - HTTP client for API communication
- **Vite** - Fast build tool and development server

### Backend
- **FastAPI** - High-performance Python web framework
- **SQLAlchemy** - Python SQL toolkit and ORM
- **Alembic** - Database migration tool
- **Pydantic** - Data validation using Python type annotations
- **JWT** - JSON Web Tokens for authentication
- **Passlib** - Password hashing library

### Database
- **SQLite** - Development database (easily portable)
- **PostgreSQL** - Production-ready option

### Development Tools
- **Uvicorn** - ASGI server for FastAPI
- **React Error Boundary** - Error handling in React
- **ESLint & Prettier** - Code formatting and linting

## Prerequisites

- Node.js (v16 or later)
- Python (v3.8 or later)
- pip (Python package manager)
- npm or yarn

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v16 or later)
- Python (v3.8 or later)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd digital-literacy-platform
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173` (or next available port)

### 4. Test Users
The system comes with pre-configured test users:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | admin123 |
| Teacher | teacher@test.com | teacher123 |
| Student | student@test.com | student123 |

## 📁 Project Structure

```
digital-literacy-platform/
├── backend/
│   ├── app/
│   │   ├── routers/          # API route handlers
│   │   ├── models.py         # Database models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── auth.py          # Authentication logic
│   │   ├── database.py      # Database configuration
│   │   └── main.py          # FastAPI application
│   ├── alembic/             # Database migrations
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── routes/         # Routing configuration
│   │   ├── services/       # API service layer
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json        # Node.js dependencies
└── README.md
```

## 🔧 Environment Configuration

### Backend Environment Variables
Create `.env` file in `/backend`:
```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./digital_literacy.db
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend Environment Variables
Create `.env` file in `/frontend`:
```env
VITE_API_URL=/api
```

## 📚 API Documentation

Once the backend server is running, access the interactive API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🎯 Assessment Requirements Coverage

### ✅ **Platform Features**
- [x] Student registration and login system
- [x] Course listing page for browsing digital literacy modules
- [x] Course content view (text-based learning material)
- [x] Basic quiz/assessment feature with progress tracking
- [x] **BONUS**: Admin dashboard for content management
- [x] **BONUS**: Teacher portal for course creation

### ✅ **Technical Requirements**
- [x] **Frontend**: Modern React with Vite, Chakra UI
- [x] **Backend**: FastAPI (Python) with full REST API
- [x] **Database**: SQLite with SQLAlchemy ORM
- [x] **Integration**: Smooth REST API communication
- [x] **UI/UX**: Clean, intuitive, mobile-friendly design

### ✅ **Additional Features Implemented**
- [x] Role-based authentication (Student, Teacher, Admin)
- [x] JWT-based security
- [x] Error boundaries and proper error handling
- [x] Responsive design with modern UI components
- [x] Progress tracking infrastructure
- [x] Analytics dashboard

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy the 'dist' folder to your hosting service
```

### Backend (Render/Heroku)
```bash
# Update requirements.txt if needed
pip freeze > requirements.txt

# For Render: Create web service with:
# Build Command: pip install -r requirements.txt
# Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## 🔮 Future Enhancements

Given more time, the following improvements could be implemented:

### Short-term (1-2 weeks)
- Video content support for courses
- Real-time quiz taking interface
- Email notifications for course completion
- Mobile app using React Native
- File upload for course materials

### Medium-term (1-2 months)
- Advanced analytics and reporting
- Discussion forums for courses
- Certificate generation
- Offline content support
- Multi-language support (English, Hausa, Yoruba, Igbo)

### Long-term (3+ months)
- AI-powered learning recommendations
- Integration with university systems
- Advanced assessment types (coding challenges, projects)
- Peer-to-peer learning features
- Mobile-first PWA implementation

## 📞 Contact & Support

For questions about this implementation or the assessment:
- **GitHub**: [Repository Link]
- **Email**: [Your Email]
- **LinkedIn**: [Your Profile]

## 📄 License

This project is developed as part of a technical assessment and is available under the MIT License.
