#!/usr/bin/env node

/**
 * Database Migration Script
 * 
 * This script applies all Prisma migrations to the database and seeds it with initial data.
 * It's designed to be run in both development and production environments.
 * 
 * Usage:
 *   node scripts/apply-migrations.js
 * 
 * Environment variables:
 *   - DATABASE_URL: The connection string to the PostgreSQL database
 *   - DIRECT_URL: The direct connection string (without pgBouncer) for migrations
 *   - NODE_ENV: The environment (development, test, production)
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper function to log with colors
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Helper function to execute commands and log output
function execute(command, options = {}) {
  log(`\n> ${command}`, colors.cyan);
  try {
    const output = execSync(command, {
      stdio: 'inherit',
      ...options,
    });
    return { success: true, output };
  } catch (error) {
    log(`Error executing command: ${command}`, colors.red);
    log(error.message, colors.red);
    return { success: false, error };
  }
}

// Check if required environment variables are set
function checkEnvironment() {
  log('Checking environment variables...', colors.blue);
  
  const requiredVars = ['DATABASE_URL', 'DIRECT_URL'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    log(`Missing required environment variables: ${missingVars.join(', ')}`, colors.red);
    log('Please set these variables in your .env file or environment.', colors.yellow);
    process.exit(1);
  }
  
  log('Environment variables check passed.', colors.green);
}

// Apply database migrations
function applyMigrations() {
  log('\n=== Applying Database Migrations ===', colors.bright + colors.blue);
  
  // Check if migrations directory exists
  const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    log('No migrations directory found. Creating initial migration...', colors.yellow);
    const result = execute('npx prisma migrate dev --name init');
    if (!result.success) {
      log('Failed to create initial migration.', colors.red);
      process.exit(1);
    }
  } else {
    log('Migrations directory found. Applying migrations...', colors.blue);
    
    // In production, use migrate deploy
    if (process.env.NODE_ENV === 'production') {
      const result = execute('npx prisma migrate deploy');
      if (!result.success) {
        log('Failed to deploy migrations in production.', colors.red);
        process.exit(1);
      }
    } else {
      // In development, use migrate dev
      const result = execute('npx prisma migrate dev');
      if (!result.success) {
        log('Failed to apply migrations in development.', colors.red);
        process.exit(1);
      }
    }
  }
  
  log('Migrations applied successfully.', colors.green);
}

// Generate Prisma client
function generatePrismaClient() {
  log('\n=== Generating Prisma Client ===', colors.bright + colors.blue);
  
  const result = execute('npx prisma generate');
  if (!result.success) {
    log('Failed to generate Prisma client.', colors.red);
    process.exit(1);
  }
  
  log('Prisma client generated successfully.', colors.green);
}

// Seed the database
function seedDatabase() {
  log('\n=== Seeding Database ===', colors.bright + colors.blue);
  
  // Check if seed file exists
  const seedFile = path.join(process.cwd(), 'prisma', 'seed.js');
  const seedTsFile = path.join(process.cwd(), 'prisma', 'seed.ts');
  
  if (!fs.existsSync(seedFile) && !fs.existsSync(seedTsFile)) {
    log('No seed file found. Skipping database seeding.', colors.yellow);
    return;
  }
  
  // Run the seed command
  const result = execute('npx prisma db seed');
  if (!result.success) {
    log('Failed to seed database.', colors.red);
    log('This is not a critical error. Continuing...', colors.yellow);
  } else {
    log('Database seeded successfully.', colors.green);
  }
}

// Main function
function main() {
  log('=== Fintan Virtual Care Hub - Database Setup ===', colors.bright + colors.magenta);
  
  checkEnvironment();
  applyMigrations();
  generatePrismaClient();
  seedDatabase();
  
  log('\n=== Database Setup Complete ===', colors.bright + colors.green);
  log('Your database is now ready to use!', colors.green);
}

// Run the script
main();

