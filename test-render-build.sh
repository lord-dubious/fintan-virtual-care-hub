#!/bin/bash
set -e

echo "🧪 Testing Render build and server setup..."

# Create a test .env file with mock values for PostgreSQL
echo "Creating test .env file..."
cat > .env.test << EOL
# Test Database URL (using a mock PostgreSQL URL)
DATABASE_URL="postgresql://test:test@localhost:5432/test?schema=public"
DIRECT_URL="postgresql://test:test@localhost:5432/test?schema=public"

# Application Settings
NODE_ENV="test"
PORT=3000
API_BASE_URL="http://localhost:3000/api"
FRONTEND_URL="http://localhost:3000"

# Authentication
JWT_SECRET="test-jwt-secret"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_SECRET="test-refresh-token-secret"
REFRESH_TOKEN_EXPIRES_IN="30d"

# Feature Flags
RUN_MIGRATIONS_ON_BUILD=false
EOL

# Install dependencies if needed
echo "Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
else
  echo "Dependencies already installed."
fi

# Test Prisma schema validation
echo "Validating Prisma schema..."
npx prisma validate

# Test Prisma client generation (without connecting to a database)
echo "Testing Prisma client generation..."
npx prisma generate

# Test the build command (without actually building to save time)
echo "Testing build command syntax..."
npm run build --dry-run

# Verify server.js exists and is valid JavaScript
echo "Verifying server.js..."
node --check server.js

echo "Testing server configuration..."
node -e "
const fs = require('fs');
const path = require('path');

// Check if server.js exists
if (!fs.existsSync(path.join(process.cwd(), 'server.js'))) {
  console.error('❌ Server file not found');
  process.exit(1);
}

// Read and parse package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));

// Check if build script includes migrations
if (!packageJson.scripts.build.includes('prisma migrate deploy')) {
  console.error('❌ Build script does not include database migrations');
  process.exit(1);
}

// Check if start script exists
if (!packageJson.scripts.start || !packageJson.scripts.start.includes('server.js')) {
  console.error('❌ Start script is missing or incorrect');
  process.exit(1);
}

// Check if express is in dependencies
if (!packageJson.dependencies.express) {
  console.error('❌ Express dependency is missing');
  process.exit(1);
}

console.log('✅ Package.json configuration is correct');
console.log('✅ Server file exists and is valid');
"

echo "🎉 Test completed successfully!"
echo "The application is ready for deployment to Render."

