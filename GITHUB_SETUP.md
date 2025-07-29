# 🚀 GitHub Setup & Railway Deployment Guide

## Step 1: Create GitHub Repository

1. **Go to GitHub**: https://github.com
2. **Sign in** with your account (alexauieong@gmail.com)
3. **Click "New repository"**
4. **Repository name**: `appointment-system`
5. **Description**: `Full-stack appointment booking system with React frontend and Node.js backend`
6. **Make it Public** (for free Railway deployment)
7. **Don't initialize** with README, .gitignore, or license
8. **Click "Create repository"**

## Step 2: Push Your Code to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# In your project directory (C:\Users\alexa\appointment-system)
git add .
git commit -m "Initial commit: Appointment System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/appointment-system.git
git push -u origin main
```

## Step 3: Deploy to Railway

1. **Go to Railway Dashboard**: https://railway.com/dashboard
2. **Select your project**: "annoying-crook"
3. **Click "New Service"** → **"GitHub Repo"**
4. **Connect your GitHub account** (if not already connected)
5. **Select your repository**: `appointment-system`
6. **Set source directory** to `backend`
7. **Click "Deploy"**

## Step 4: Configure Environment Variables

In Railway Dashboard, go to your service's **Variables** tab and add:

```
NODE_ENV=production
MONGO_USER=alexauieong
MONGO_PASSWORD=eiVeTZsyLKRhpdMt
MONGO_CLUSTER_URL=firstcluster.bvgfhda.mongodb.net
MONGO_DB_NAME=appointmentServiceDB
EMAIL_USER=alexauieong@gmail.com
EMAIL_PASS=your-gmail-app-password
FRONTEND_URL=https://your-frontend-domain.com
CORS_ORIGIN=https://your-frontend-domain.com
```

## Step 5: Test Your Deployment

Once deployed, Railway will give you a URL like:
`https://your-app-name.railway.app`

Test these endpoints:
- **Health Check**: `GET https://your-app-name.railway.app/api/health`
- **Root**: `GET https://your-app-name.railway.app/`

## Expected Success Response

```json
{
  "status": "OK",
  "message": "Appointment System API is running",
  "timestamp": "2025-07-29T02:00:00.000Z",
  "database": "Connected",
  "version": "1.0.0",
  "environment": "production"
}
```

## 🎯 Next Steps

1. **Update frontend** to use the Railway URL
2. **Deploy frontend** to Vercel/Netlify
3. **Test full application** in production
4. **Set up custom domain** (optional)

---

**Need help?** Let me know if you encounter any issues during these steps! 