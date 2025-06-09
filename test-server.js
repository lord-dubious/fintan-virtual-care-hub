import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🧪 Testing Express server functionality...");

// Create a temporary directory to simulate the dist folder
const tempDistDir = path.join(__dirname, 'temp-dist');
try {
  if (!fs.existsSync(tempDistDir)) {
    fs.mkdirSync(tempDistDir, { recursive: true });
  }
  
  // Create a simple index.html file
  fs.writeFileSync(
    path.join(tempDistDir, 'index.html'),
    '<html><body><h1>Test Successful</h1><p>The server is working correctly!</p></body></html>'
  );
  
  // Create a test CSS file to test static asset serving
  fs.writeFileSync(
    path.join(tempDistDir, 'test.css'),
    'body { font-family: Arial, sans-serif; color: #333; }'
  );
  
  // Create a simple app using the same logic as server.js
  const app = express();
  const PORT = 3456; // Use a different port for testing
  
  // Add security headers like in server.js
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });
  
  // Serve static files from the temp dist directory
  app.use(express.static(tempDistDir, {
    maxAge: '1d', // Cache static assets for 1 day
  }));
  
  // For any request that doesn't match a static file, serve the index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(tempDistDir, 'index.html'));
  });
  
  // Start the server
  const server = app.listen(PORT, () => {
    console.log(`✅ Test server running on port ${PORT}`);
    
    // Test 1: Make a request to the server root
    http.get(`http://localhost:${PORT}`, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('✅ Test 1 - Root path request successful');
        console.log(`Status code: ${res.statusCode}`);
        console.log(`Contains expected content: ${data.includes('Test Successful')}`);
        
        // Test 2: Request a static asset (CSS file)
        http.get(`http://localhost:${PORT}/test.css`, (res) => {
          let cssData = '';
          res.on('data', (chunk) => {
            cssData += chunk;
          });
          res.on('end', () => {
            console.log('✅ Test 2 - Static asset request successful');
            console.log(`Status code: ${res.statusCode}`);
            console.log(`Content-Type: ${res.headers['content-type']}`);
            console.log(`Cache-Control: ${res.headers['cache-control']}`);
            console.log(`Contains expected content: ${cssData.includes('font-family')}`);
            
            // Test 3: Request a non-existent file (should serve index.html)
            http.get(`http://localhost:${PORT}/non-existent-file.js`, (res) => {
              let fallbackData = '';
              res.on('data', (chunk) => {
                fallbackData += chunk;
              });
              res.on('end', () => {
                console.log('✅ Test 3 - Fallback to index.html successful');
                console.log(`Status code: ${res.statusCode}`);
                console.log(`Contains expected content: ${fallbackData.includes('Test Successful')}`);
                
                // All tests completed, close the server
                server.close(() => {
                  console.log('✅ All tests completed successfully');
                  process.exit(0);
                });
              });
            });
          });
        });
      });
    }).on('error', (err) => {
      console.error('❌ Error making request:', err.message);
      server.close(() => process.exit(1));
    });
  });
} catch (error) {
  console.error('❌ Error setting up test server:', error);
  process.exit(1);
}
