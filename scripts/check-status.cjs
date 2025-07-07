#!/usr/bin/env node

/**
 * Dynamic Service Status Checker
 * Reads ports from environment variables
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

// Simple .env parser
function loadEnv() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^#][^=]*?)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove comments from the end of the value
        value = value.split('#')[0].trim();
        // Remove quotes
        value = value.replace(/^["']|["']$/g, '');
        envVars[key] = value;
      }
    });

    return envVars;
  } catch (error) {
    return {};
  }
}

const envVars = loadEnv();

const execAsync = promisify(exec);

// Get ports from environment (prioritize .env file, then process.env)
const ACTUAL_FRONTEND_PORT = envVars.VITE_PORT || process.env.VITE_PORT || '10000';
const ACTUAL_BACKEND_PORT = envVars.PORT || process.env.PORT || '3000';

const SERVICES = {
  frontend: {
    name: 'Frontend (Vite)',
    port: ACTUAL_FRONTEND_PORT,
    url: `http://localhost:${ACTUAL_FRONTEND_PORT}`,
    healthCheck: `http://localhost:${ACTUAL_FRONTEND_PORT}`,
  },
  backend: {
    name: 'Backend (Express)',
    port: ACTUAL_BACKEND_PORT,
    url: `http://localhost:${ACTUAL_BACKEND_PORT}`,
    healthCheck: `http://localhost:${ACTUAL_BACKEND_PORT}/health`,
  }
};

async function checkService(service) {
  try {
    const { stdout, stderr } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" ${service.healthCheck}`, {
      timeout: 3000
    });
    
    const statusCode = stdout.trim();
    
    if (statusCode === '200') {
      return `✅ ${service.name}: ${service.url}`;
    } else if (statusCode === '000') {
      return `❌ ${service.name}: Not running (${service.url})`;
    } else {
      return `⚠️  ${service.name}: Responded with ${statusCode} (${service.url})`;
    }
  } catch (error) {
    return `❌ ${service.name}: Not running (${service.url})`;
  }
}

async function main() {
  const [frontendStatus, backendStatus] = await Promise.all([
    checkService(SERVICES.frontend),
    checkService(SERVICES.backend)
  ]);
  
  console.log(frontendStatus);
  console.log(backendStatus);
}

// Handle both direct execution and npm script usage
if (process.argv.length > 2) {
  const serviceType = process.argv[2];
  if (serviceType === 'frontend') {
    checkService(SERVICES.frontend).then(console.log);
  } else if (serviceType === 'backend') {
    checkService(SERVICES.backend).then(console.log);
  } else {
    main();
  }
} else {
  main();
}
