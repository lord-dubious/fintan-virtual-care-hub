#!/bin/bash

echo "🗓️  Starting Cal.com with your Neon database"
echo "============================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please run ./setup-simple.sh first."
    exit 1
fi

echo "📦 Starting Cal.com container..."
docker-compose -f docker-compose.calcom.yml up -d

echo "⏳ Waiting for Cal.com to start..."
sleep 10

# Check if Cal.com is running
if curl -f http://localhost:3002 > /dev/null 2>&1; then
    echo "✅ Cal.com is running!"
    echo ""
    echo "🌐 Access Cal.com at: http://localhost:3002"
    echo ""
    echo "📝 Setup Instructions:"
    echo "1. Go to http://localhost:3002"
    echo "2. Create your admin account"
    echo "3. Set up your event types"
    echo "4. Configure Daily.co integration (already configured)"
    echo ""
    echo "🔗 Your Fintan app will integrate with Cal.com automatically"
    echo "   - Frontend: http://localhost:3001"
    echo "   - Backend: http://localhost:3000"
    echo "   - Cal.com: http://localhost:3002"
    echo ""
    echo "🗄️  Database: Both apps share your Neon PostgreSQL database"
else
    echo "⚠️  Cal.com might still be starting. Check with:"
    echo "   docker-compose -f docker-compose.calcom.yml logs -f"
fi
