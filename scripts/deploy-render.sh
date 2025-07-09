#!/bin/bash

# Render Deployment Script for Fintan Virtual Care Hub
# This script handles the deployment process for Render.com

set -e  # Exit on any error

echo "🚀 Starting Render deployment for Fintan Virtual Care Hub..."

# Check if we're deploying frontend or backend
if [ "$1" = "frontend" ]; then
    echo "📦 Building Frontend..."
    npm install
    npm run build:frontend
    echo "✅ Frontend build complete"
    
elif [ "$1" = "backend" ]; then
    echo "📦 Building Backend..."
    cd backend
    npm install
    npm run build
    echo "✅ Backend build complete"
    
else
    echo "📦 Building Full Stack Application..."
    
    # Install root dependencies
    echo "📥 Installing root dependencies..."
    npm install
    
    # Build frontend
    echo "🎨 Building frontend..."
    npm run build:frontend
    
    # Build backend
    echo "⚙️ Building backend..."
    cd backend
    npm install
    npm run build
    cd ..
    
    echo "✅ Full stack build complete"
fi

echo "🎉 Deployment preparation complete!"
echo "💡 Make sure to set your environment variables in Render dashboard"
