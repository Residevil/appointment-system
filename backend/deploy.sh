#!/bin/bash

# Deployment script for Appointment System Backend
# Usage: ./deploy.sh [platform]

set -e

PLATFORM=${1:-"local"}

echo "🚀 Deploying Appointment System Backend to $PLATFORM..."

# Build the application
echo "📦 Building application..."
npm run build

case $PLATFORM in
    "local")
        echo "🏠 Starting local development server..."
        npm run dev
        ;;
    "docker")
        echo "🐳 Building and running Docker container..."
        docker build -t appointment-backend .
        docker run -p 5000:5000 --env-file .env appointment-backend
        ;;
    "heroku")
        echo "☁️ Deploying to Heroku..."
        # Ensure Heroku CLI is installed
        if ! command -v heroku &> /dev/null; then
            echo "❌ Heroku CLI not found. Please install it first."
            exit 1
        fi
        git add .
        git commit -m "Deploy to production"
        git push heroku main
        ;;
    "railway")
        echo "🚂 Deploying to Railway..."
        # Ensure Railway CLI is installed
        if ! command -v railway &> /dev/null; then
            echo "❌ Railway CLI not found. Please install it first."
            exit 1
        fi
        railway up
        ;;
    "render")
        echo "🎨 Deploying to Render..."
        echo "Please deploy manually to Render.com"
        echo "1. Connect your GitHub repository"
        echo "2. Set environment variables"
        echo "3. Deploy"
        ;;
    *)
        echo "❌ Unknown platform: $PLATFORM"
        echo "Available platforms: local, docker, heroku, railway, render"
        exit 1
        ;;
esac

echo "✅ Deployment completed!" 