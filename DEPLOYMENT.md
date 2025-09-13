# 🚀 Deployment Guide

## Backend Deployment (Render.com)

### 1. Create Render Account
- Go to [render.com](https://render.com)
- Sign up with GitHub

### 2. Deploy Backend
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Select the repository: `digital-literacy-platform-`

### 3. Configure Backend Service
```
Name: digital-literacy-backend
Environment: Python 3
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 4. Environment Variables
```
DATABASE_URL=sqlite:///./digital_literacy.db
SECRET_KEY=your-secret-key-change-this-in-production
```

### 5. Deploy
- Click "Create Web Service"
- Wait for deployment to complete
- Note the URL (e.g., `https://digital-literacy-backend.onrender.com`)

## Frontend Deployment (Vercel)

### 1. Create Vercel Account
- Go to [vercel.com](https://vercel.com)
- Sign up with GitHub

### 2. Deploy Frontend
- Click "New Project"
- Import your GitHub repository
- Select the repository: `digital-literacy-platform-`

### 3. Configure Frontend Project
```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

### 4. Environment Variables
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

### 5. Deploy
- Click "Deploy"
- Wait for deployment to complete
- Note the URL (e.g., `https://your-project.vercel.app`)

## Testing Deployment

### 1. Test Backend
```bash
curl https://your-backend-url.onrender.com/docs
```

### 2. Test Frontend
- Visit your Vercel URL
- Try logging in with:
  - Admin: `admin@example.com` / `admin123`
  - Student: `Enoch@gmail.com` / `student123`

## Troubleshooting

### Backend Issues
- Check Render logs for errors
- Ensure all dependencies are in requirements.txt
- Verify environment variables are set

### Frontend Issues
- Check Vercel build logs
- Ensure VITE_API_URL points to correct backend
- Verify all imports are correct

## Production Checklist

- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] Database initialized
- [ ] Test user accounts working
- [ ] All features tested

## URLs After Deployment

- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-backend.onrender.com`
- **API Docs**: `https://your-backend.onrender.com/docs`