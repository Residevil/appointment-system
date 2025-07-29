# Railway Environment Variables Setup Script
# Run this script to set up all required environment variables in Railway

Write-Host "🚀 Setting up Railway environment variables..." -ForegroundColor Green

# Read from .env file if it exists
if (Test-Path ".env") {
    Write-Host "📖 Reading environment variables from .env file..." -ForegroundColor Yellow
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            $key = $matches[1]
            $value = $matches[2]
            Write-Host "Setting $key" -ForegroundColor Cyan
            railway variables set $key $value
        }
    }
} else {
    Write-Host "⚠️ No .env file found. Please set variables manually." -ForegroundColor Yellow
}

# Set required variables manually
Write-Host "🔧 Setting required environment variables..." -ForegroundColor Green

# MongoDB Configuration
railway variables set NODE_ENV production
railway variables set MONGO_USER "alexauieong"
railway variables set MONGO_PASSWORD "eiVeTZsyLKRhpdMt"
railway variables set MONGO_CLUSTER_URL "firstcluster.bvgfhda.mongodb.net"
railway variables set MONGO_DB_NAME "appointmentServiceDB"

# Email Configuration (you'll need to update these)
railway variables set EMAIL_USER "your-email@gmail.com"
railway variables set EMAIL_PASS "your-app-password"

# Frontend URL (update this with your actual frontend URL)
railway variables set FRONTEND_URL "https://your-frontend-domain.com"
railway variables set CORS_ORIGIN "https://your-frontend-domain.com"

Write-Host "✅ Environment variables set successfully!" -ForegroundColor Green
Write-Host "🔍 You can verify them with: railway variables" -ForegroundColor Cyan 