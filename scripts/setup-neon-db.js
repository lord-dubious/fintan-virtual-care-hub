/**
 * Neon Database Setup Script
 * 
 * This script helps initialize the Neon database with the pgvector extension
 * and performs initial setup tasks.
 */

const { Client } = require('pg');
require('dotenv').config();

async function setupNeonDatabase() {
  // Use the DIRECT_URL for schema operations
  const connectionString = process.env.DIRECT_URL;
  
  if (!connectionString) {
    console.error('Error: DIRECT_URL environment variable is not set');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
  });

  try {
    console.log('Connecting to Neon database...');
    await client.connect();
    console.log('Connected successfully!');

    // Check if pgvector extension is available
    console.log('Checking pgvector extension...');
    const extensionResult = await client.query(
      "SELECT * FROM pg_extension WHERE extname = 'vector'"
    );

    if (extensionResult.rows.length === 0) {
      console.log('Creating pgvector extension...');
      await client.query('CREATE EXTENSION IF NOT EXISTS vector');
      console.log('pgvector extension created successfully!');
    } else {
      console.log('pgvector extension is already installed.');
    }

    // Additional setup tasks can be added here

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await client.end();
  }
}

setupNeonDatabase().catch(console.error);

