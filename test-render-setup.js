import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🧪 Testing Render deployment configuration...");

// Check if server.js exists and is valid
try {
  console.log("Verifying server.js...");
  if (!fs.existsSync(path.join(process.cwd(), 'server.js'))) {
    console.error('❌ Server file not found');
    process.exit(1);
  }
  
  // Check if server.js is valid JavaScript
  try {
    execSync('node --check server.js', { stdio: 'inherit' });
    console.log('✅ server.js is valid JavaScript');
  } catch (error) {
    console.error('❌ server.js contains syntax errors');
    process.exit(1);
  }
} catch (error) {
  console.error(`❌ Error checking server.js: ${error.message}`);
  process.exit(1);
}

// Check package.json configuration
try {
  console.log("Checking package.json configuration...");
  const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
  
  // Check build script
  if (!packageJson.scripts.build) {
    console.error('❌ Build script is missing');
    process.exit(1);
  }
  
  if (!packageJson.scripts.build.includes('prisma generate') || 
      !packageJson.scripts.build.includes('prisma migrate deploy') || 
      !packageJson.scripts.build.includes('vite build')) {
    console.error('❌ Build script is missing required commands');
    console.error('  Should include: prisma generate && prisma migrate deploy && vite build');
    process.exit(1);
  } else {
    console.log('✅ Build script is correctly configured');
  }
  
  // Check start script
  if (!packageJson.scripts.start || !packageJson.scripts.start.includes('server.js')) {
    console.error('❌ Start script is missing or incorrect');
    process.exit(1);
  } else {
    console.log('✅ Start script is correctly configured');
  }
  
  // Check dependencies
  if (!packageJson.dependencies.express) {
    console.error('❌ Express dependency is missing');
    process.exit(1);
  } else {
    console.log('✅ Express dependency is present');
  }
  
  if (!packageJson.dependencies.prisma) {
    console.error('❌ Prisma dependency is missing');
    process.exit(1);
  } else {
    console.log('✅ Prisma dependency is present');
  }
} catch (error) {
  console.error(`❌ Error checking package.json: ${error.message}`);
  process.exit(1);
}

// Check .env.example
try {
  console.log("Checking .env.example...");
  if (!fs.existsSync(path.join(process.cwd(), '.env.example'))) {
    console.error('❌ .env.example file not found');
    process.exit(1);
  }
  
  const envExample = fs.readFileSync(path.join(process.cwd(), '.env.example'), 'utf8');
  
  // Check for required environment variables
  const requiredVars = [
    'DATABASE_URL', 
    'DIRECT_URL', 
    'NODE_ENV', 
    'PORT', 
    'API_BASE_URL', 
    'FRONTEND_URL',
    'RUN_MIGRATIONS_ON_BUILD'
  ];
  
  const missingVars = [];
  for (const variable of requiredVars) {
    if (!envExample.includes(variable)) {
      missingVars.push(variable);
    }
  }
  
  if (missingVars.length > 0) {
    console.error(`❌ .env.example is missing required variables: ${missingVars.join(', ')}`);
    process.exit(1);
  } else {
    console.log('✅ .env.example contains all required variables');
  }
  
  // Check for production configuration
  if (!envExample.includes('production')) {
    console.error('❌ .env.example does not include production configuration');
    process.exit(1);
  } else {
    console.log('✅ .env.example includes production configuration');
  }
} catch (error) {
  console.error(`❌ Error checking .env.example: ${error.message}`);
  process.exit(1);
}

// Check deployment guide
try {
  console.log("Checking deployment guide...");
  const deploymentGuidePath = path.join(process.cwd(), 'docs', 'deployment-guide.md');
  
  if (!fs.existsSync(deploymentGuidePath)) {
    console.error('❌ Deployment guide not found');
    process.exit(1);
  }
  
  const deploymentGuide = fs.readFileSync(deploymentGuidePath, 'utf8');
  
  // Check for required sections
  const requiredSections = [
    'Deploying to Render',
    'Environment Variables',
    'Database',
    'Troubleshooting'
  ];
  
  const missingSections = [];
  for (const section of requiredSections) {
    if (!deploymentGuide.includes(section)) {
      missingSections.push(section);
    }
  }
  
  if (missingSections.length > 0) {
    console.error(`❌ Deployment guide is missing required sections: ${missingSections.join(', ')}`);
    process.exit(1);
  } else {
    console.log('✅ Deployment guide contains all required sections');
  }
} catch (error) {
  console.error(`❌ Error checking deployment guide: ${error.message}`);
  process.exit(1);
}

console.log("\n🎉 All tests passed! The application is ready for deployment to Render.");
console.log("The configuration includes:");
console.log("- ✅ Express server for serving the built application");
console.log("- ✅ Database migration during build process");
console.log("- ✅ Proper environment variable configuration");
console.log("- ✅ Comprehensive deployment documentation");

