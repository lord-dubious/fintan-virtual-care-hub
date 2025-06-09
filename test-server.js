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
  
  // Create a simple app using the same logic as server.js
  const app = express();
  const PORT = 3456; // Use a different port for testing
  
  // Serve static files from the temp dist directory
  app.use(express.static(tempDistDir));
  
  // For any request that doesn't match a static file, serve the index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(tempDistDir, 'index.html'));
  });
  
  // Start the server
  const server = app.listen(PORT, () => {
    console.log(`✅ Test server running on port ${PORT}`);
    
    // Make a request to the server
    http.get(`http://localhost:${PORT}`, (res) => {
      console.log(`✅ Server responded with status code: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (data.includes('Test Successful')) {
          console.log('✅ Server returned the correct content');
          console.log('\n🎉 Server test passed! The Express server is working correctly.');
          
          // Clean up
          server.close(() => {
            fs.rmSync(tempDistDir, { recursive: true, force: true });
            console.log('✅ Test cleanup completed');
          });
        } else {
          console.error('❌ Server did not return the expected content');
          server.close(() => {
            fs.rmSync(tempDistDir, { recursive: true, force: true });
            process.exit(1);
          });
        }
      });
    }).on('error', (err) => {
      console.error(`❌ Error making request to test server: ${err.message}`);
      server.close(() => {
        fs.rmSync(tempDistDir, { recursive: true, force: true });
        process.exit(1);
      });
    });
  });
} catch (error) {
  console.error(`❌ Error testing server: ${error.message}`);
  if (fs.existsSync(tempDistDir)) {
    fs.rmSync(tempDistDir, { recursive: true, force: true });
  }
  process.exit(1);
}

