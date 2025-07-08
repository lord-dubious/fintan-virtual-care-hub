#!/usr/bin/env node

/**
 * Port Management Utility
 * Helps manage port conflicts and cleanup for the backend server
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const PORT = process.env.PORT || 3000;

async function checkPort(port) {
  try {
    const { stdout } = await execAsync(`lsof -ti:${port}`);
    const pids = stdout.trim().split('\n').filter(pid => pid);
    return pids;
  } catch (error) {
    return []; // No processes found
  }
}

async function killPort(port) {
  console.log(`🔍 Checking port ${port}...`);
  
  const pids = await checkPort(port);
  
  if (pids.length === 0) {
    console.log(`✅ Port ${port} is free`);
    return;
  }
  
  console.log(`⚠️ Found ${pids.length} process(es) using port ${port}:`);
  
  for (const pid of pids) {
    try {
      // Get process info
      const { stdout: processInfo } = await execAsync(`ps -p ${pid} -o pid,ppid,cmd --no-headers`).catch(() => ({ stdout: '' }));
      console.log(`   PID ${pid}: ${processInfo.trim()}`);
      
      // Kill the process
      await execAsync(`kill -9 ${pid}`);
      console.log(`💀 Killed process ${pid}`);
    } catch (error) {
      console.log(`❌ Failed to kill process ${pid}: ${error.message}`);
    }
  }
  
  // Wait and check again
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const remainingPids = await checkPort(port);
  if (remainingPids.length === 0) {
    console.log(`✅ Port ${port} is now free`);
  } else {
    console.log(`⚠️ ${remainingPids.length} process(es) still using port ${port}`);
  }
}

async function listPortProcesses(port) {
  console.log(`🔍 Processes using port ${port}:`);
  
  const pids = await checkPort(port);
  
  if (pids.length === 0) {
    console.log(`✅ No processes found using port ${port}`);
    return;
  }
  
  for (const pid of pids) {
    try {
      const { stdout: processInfo } = await execAsync(`ps -p ${pid} -o pid,ppid,user,cmd --no-headers`);
      console.log(`   ${processInfo.trim()}`);
    } catch (error) {
      console.log(`   PID ${pid}: <process info unavailable>`);
    }
  }
}

// Command line interface
const command = process.argv[2];
const port = process.argv[3] || PORT;

switch (command) {
  case 'kill':
    killPort(port);
    break;
  case 'check':
  case 'list':
    listPortProcesses(port);
    break;
  case 'help':
  default:
    console.log(`
🔧 Port Manager Utility

Usage:
  node scripts/port-manager.js <command> [port]

Commands:
  kill [port]    Kill all processes using the specified port (default: ${PORT})
  check [port]   List all processes using the specified port (default: ${PORT})
  list [port]    Same as check
  help           Show this help message

Examples:
  node scripts/port-manager.js kill 3000
  node scripts/port-manager.js check
  node scripts/port-manager.js list 8080

NPM Scripts:
  npm run kill-port      Kill processes on port 3000
  npm run clean-start    Kill port processes and start dev server
`);
    break;
}
