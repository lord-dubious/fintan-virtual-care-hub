#!/bin/bash

echo "🚀 Simple Fintan Setup with Neon DB"
echo "==================================="

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd backend && npm install && cd ..

# Setup database
echo "🗄️ Setting up database..."
cd backend
npx prisma generate
npx prisma db push
cd ..

echo "✅ Setup complete!"
echo ""
echo "🎯 To start the app:"
echo "1. Backend:  cd backend && npm run dev"
echo "2. Frontend: npm run dev"
echo "3. Cal.com:  ./start-calcom.sh (optional)"
echo ""
echo "🌐 URLs:"
echo "- Frontend: http://localhost:3001"
echo "- Backend:  http://localhost:3000"
echo "- Cal.com:  http://localhost:3002 (after running start-calcom.sh)"
echo ""
echo "📝 Your Neon database is configured and ready!"
echo "🗓️  Cal.com will share the same Neon database when started"
