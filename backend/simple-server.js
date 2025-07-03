require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is healthy' });
});

// Social auth config endpoints
app.get('/api/auth/social/config/:provider', (req, res) => {
  const { provider } = req.params;
  
  const configs = {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      enabled: !!process.env.GOOGLE_CLIENT_ID,
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID,
      enabled: !!process.env.APPLE_CLIENT_ID,
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID,
      enabled: !!process.env.MICROSOFT_CLIENT_ID,
    },
  };

  const config = configs[provider];
  
  if (!config) {
    return res.status(404).json({
      success: false,
      error: 'Provider not found',
    });
  }

  res.json({
    success: true,
    data: config,
  });
});

// Mock social auth endpoint
app.post('/api/auth/social', (req, res) => {
  const { provider, accessToken } = req.body;
  
  if (!provider || !accessToken) {
    return res.status(400).json({
      success: false,
      error: 'Provider and access token are required',
    });
  }

  // Mock successful authentication
  res.json({
    success: true,
    data: {
      user: {
        id: 'mock-user-id',
        email: `user@${provider}.com`,
        name: `${provider} User`,
        role: 'PATIENT'
      },
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
      isNewUser: false
    },
    message: 'Social authentication successful'
  });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`📊 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log('🎯 Ready to serve requests!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
