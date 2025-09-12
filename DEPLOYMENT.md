# Deployment Guide

## Backend Deployment (Render)

### Prerequisites
1. Create a Render account at https://render.com
2. Connect your GitHub repository to Render

### Steps
1. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - Select the `backend` folder as the root directory
   - Use the following settings:
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
     - **Environment**: Python 3

2. **Set Environment Variables**
   ```
   DATABASE_URL=postgresql://username:password@hostname:port/database
   SECRET_KEY=your-secret-key-here
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ALGORITHM=HS256
   FRONTEND_URL=https://your-frontend-domain.netlify.app
   ```

3. **Database Setup**
   - Create a PostgreSQL database on Render
   - Copy the database URL to the `DATABASE_URL` environment variable
   - The app will automatically create tables on startup

### Files Created for Deployment
- `render.yaml` - Render configuration
- `Dockerfile` - Container configuration
- Updated `main.py` with production CORS settings

## Frontend Deployment (Netlify/Vercel)

### Option 1: Netlify
1. **Build the project locally**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Deploy to Netlify**
   - Drag and drop the `dist` folder to Netlify
   - Or connect your GitHub repository
   - Use build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`

3. **Configure redirects**
   - The `netlify.toml` file is already configured
   - API calls will proxy to your Render backend

### Option 2: Vercel
1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Configure**
   - The `vercel.json` file is already configured
   - Update the backend URL in `vercel.json` once your Render service is deployed

### Files Created for Deployment
- `netlify.toml` - Netlify configuration with redirects
- `vercel.json` - Vercel configuration with rewrites
- Updated `.env.example` with production settings

## Manual Deployment Steps

### Backend (Render)
1. Push your code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repo, select backend folder
4. Set environment variables as listed above
5. Deploy

### Frontend (Netlify)
1. Build locally: `npm run build`
2. Deploy dist folder to Netlify
3. Update backend URL in environment variables
4. Test the deployed application

## Post-Deployment
1. Update CORS settings in backend with your frontend URL
2. Test all authentication flows
3. Verify API endpoints are working
4. Test course creation and video playback
5. Check progress tracking functionality

## Environment Variables Summary

### Backend (.env)
```
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALGORITHM=HS256
FRONTEND_URL=https://your-frontend-domain.netlify.app
```

### Frontend (.env)
```
VITE_API_URL=/api
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false
```

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure frontend URL is added to backend CORS settings
2. **API Not Found**: Check proxy configuration in netlify.toml/vercel.json
3. **Database Connection**: Verify DATABASE_URL format and credentials
4. **Build Failures**: Check Node.js version (use Node 18+)

### Health Checks
- Backend: `https://your-backend.onrender.com/health`
- Frontend: Should load the login page
- API: Test login with curl or Postman
