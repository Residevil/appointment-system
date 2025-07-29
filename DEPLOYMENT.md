# 🚀 Deployment Guide - Appointment System

This guide covers deploying the Appointment System to various production environments.

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB Atlas cluster configured
- Email service credentials (Gmail App Password)
- Git repository set up

## 🔧 Environment Variables

Create a `.env` file in the backend directory with these variables:

```env
# MongoDB Configuration
MONGO_USER=your_mongodb_username
MONGO_PASSWORD=your_mongodb_password
MONGO_CLUSTER_URL=your_cluster_url.mongodb.net
MONGO_DB_NAME=your_database_name

# Server Configuration
PORT=5000
NODE_ENV=production

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com
CORS_ORIGIN=https://your-frontend-domain.com
```

## 🐳 Docker Deployment

### Local Docker
```bash
cd backend
docker build -t appointment-backend .
docker run -p 5000:5000 --env-file .env appointment-backend
```

### Docker Compose
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    env_file:
      - ./backend/.env
    environment:
      - NODE_ENV=production
```

Run: `docker-compose up -d`

## ☁️ Cloud Platform Deployments

### 1. Railway Deployment

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Initialize and deploy:**
   ```bash
   cd backend
   railway init
   railway up
   ```

4. **Set environment variables in Railway dashboard**

### 2. Render Deployment

1. **Connect your GitHub repository to Render**
2. **Create a new Web Service**
3. **Configure:**
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node
4. **Set environment variables in Render dashboard**

### 3. Heroku Deployment

1. **Install Heroku CLI:**
   ```bash
   # macOS
   brew install heroku/brew/heroku
   
   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login and create app:**
   ```bash
   heroku login
   heroku create your-appointment-backend
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGO_USER=your_username
   heroku config:set MONGO_PASSWORD=your_password
   heroku config:set MONGO_CLUSTER_URL=your_cluster_url
   heroku config:set MONGO_DB_NAME=your_database
   heroku config:set EMAIL_USER=your_email
   heroku config:set EMAIL_PASS=your_app_password
   heroku config:set FRONTEND_URL=https://your-frontend-domain.com
   ```

4. **Deploy:**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### 4. Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd backend
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard**

## 🔒 Security Considerations

### Production Checklist:
- [ ] Environment variables are set securely
- [ ] CORS is configured for your frontend domain
- [ ] Helmet security headers are enabled
- [ ] Error messages don't leak sensitive information
- [ ] MongoDB connection uses SSL
- [ ] Email credentials are secure

### SSL/HTTPS:
- Most cloud platforms provide SSL automatically
- For custom domains, ensure SSL certificates are configured

## 📊 Monitoring & Health Checks

### Health Check Endpoint:
```
GET /api/health
```

Response:
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

### Monitoring Setup:
1. **Uptime Monitoring:** Use services like UptimeRobot or Pingdom
2. **Error Tracking:** Integrate with Sentry or similar
3. **Logs:** Use platform-specific logging or external services

## 🔄 CI/CD Pipeline

### GitHub Actions Example:
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd backend
        npm ci
        
    - name: Build
      run: |
        cd backend
        npm run build
        
    - name: Deploy to Railway
      run: |
        cd backend
        railway up
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 🚨 Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed:**
   - Check network access in MongoDB Atlas
   - Verify connection string format
   - Ensure IP whitelist includes deployment platform

2. **Email Not Sending:**
   - Verify Gmail App Password is correct
   - Check 2-factor authentication is enabled
   - Ensure email credentials are set in environment

3. **CORS Errors:**
   - Verify FRONTEND_URL is set correctly
   - Check CORS_ORIGIN configuration
   - Ensure frontend domain is allowed

4. **Build Failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check TypeScript compilation errors

## 📈 Scaling Considerations

### For High Traffic:
- **Database:** Consider MongoDB Atlas M10+ clusters
- **Caching:** Implement Redis for session storage
- **CDN:** Use Cloudflare or similar for static assets
- **Load Balancing:** Consider multiple instances

### Performance Optimization:
- Enable gzip compression
- Implement request rate limiting
- Add database connection pooling
- Use PM2 for process management

## 🎯 Next Steps

1. **Deploy backend** using one of the methods above
2. **Update frontend** to use production API URL
3. **Deploy frontend** to Vercel, Netlify, or similar
4. **Test thoroughly** in production environment
5. **Set up monitoring** and alerts
6. **Configure backups** for MongoDB Atlas

---

**Need help?** Check the platform-specific documentation or create an issue in the repository. 