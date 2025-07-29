# Railway Deployment Troubleshooting Guide

## 🚨 Current Issues & Solutions

### Issue 1: Build Log Streaming Failed
**Problem**: `Failed to retrieve build log`
**Solution**: 
- Use Railway Dashboard instead of CLI
- Check build logs in web interface
- Restart deployment from dashboard

### Issue 2: Docker Build Failures
**Problem**: npm ci fails during Docker build
**Solution**: 
- Use Railway's native Node.js build (no Dockerfile)
- Ensure all TypeScript dependencies are in `dependencies` not `devDependencies`

### Issue 3: Environment Variables Not Set
**Problem**: Service needs environment variables
**Solution**: Set via Railway Dashboard

## 🛠️ Step-by-Step Fix

### Step 1: Use Railway Dashboard
1. Go to https://railway.com/dashboard
2. Select project "annoying-crook"
3. Click "New Service" → "GitHub Repo"
4. Connect your GitHub repository
5. Set source directory to `backend`

### Step 2: Configure Environment Variables
In Railway Dashboard:
```
NODE_ENV=production
MONGO_USER=alexauieong
MONGO_PASSWORD=eiVeTZsyLKRhpdMt
MONGO_CLUSTER_URL=firstcluster.bvgfhda.mongodb.net
MONGO_DB_NAME=appointmentServiceDB
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=https://your-frontend-domain.com
CORS_ORIGIN=https://your-frontend-domain.com
```

### Step 3: Deploy
1. Railway will automatically detect it's a Node.js app
2. Build command: `npm install && npm run build`
3. Start command: `npm start`
4. Deploy and check logs

## 🔍 Debugging Commands

### Check Service Status
```bash
railway status
```

### View Logs
```bash
railway logs
```

### Set Environment Variables
```bash
railway variables --set "KEY=value"
```

### Force Redeploy
```bash
railway up --force
```

## 🎯 Alternative: Use Render.com
If Railway continues to have issues:

1. Go to https://render.com
2. Connect GitHub repository
3. Create new Web Service
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`
6. Add environment variables
7. Deploy

## 📊 Health Check
Once deployed, test:
```
GET https://your-railway-app.railway.app/api/health
```

Expected response:
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