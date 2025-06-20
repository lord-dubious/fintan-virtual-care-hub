import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from '@/config';
import { checkDatabaseConnection, disconnectDatabase } from '@/config/database';
import logger, { requestLogger } from '@/config/logger';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';
import { rateLimiters } from '@/middleware/rateLimiter';

// Import routes (will be created)
// import authRoutes from '@/routes/auth';
// import userRoutes from '@/routes/users';
// import patientRoutes from '@/routes/patients';
// import providerRoutes from '@/routes/providers';
// import appointmentRoutes from '@/routes/appointments';
// import consultationRoutes from '@/routes/consultations';
// import paymentRoutes from '@/routes/payments';
// import adminRoutes from '@/routes/admin';
// import healthRoutes from '@/routes/health';

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: config.frontend.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (config.server.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => {
        requestLogger.info(message.trim());
      },
    },
  }));
}

// Rate limiting
app.use('/api', rateLimiters.api);

// Health check endpoint (before authentication)
app.get('/health', async (req, res) => {
  try {
    const dbHealthy = await checkDatabaseConnection();
    const uptime = process.uptime();
    
    const health = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      database: {
        status: dbHealthy ? 'healthy' : 'unhealthy',
      },
      environment: config.server.nodeEnv,
      version: process.env['npm_package_version'] || '1.0.0',
    };

    res.status(dbHealthy ? 200 : 503).json(health);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// Import routes
import authRoutes from '@/routes/authRoutes';
import userRoutes from '@/routes/userRoutes';
import appointmentRoutes from '@/routes/appointmentRoutes';
import consultationRoutes from '@/routes/consultationRoutes';
import paymentRoutes from '@/routes/paymentRoutes';
import onboardingRoutes from '@/routes/onboardingRoutes';
import adminRoutes from '@/routes/adminRoutes';
import schedulingRoutes from '@/routes/schedulingRoutes';

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/payments', rateLimiters.api, paymentRoutes);
app.use('/api/patients/onboarding', rateLimiters.api, onboardingRoutes);
app.use('/api/admin', rateLimiters.admin, adminRoutes);
app.use('/api/scheduling', schedulingRoutes);
// app.use('/api/patients', patientRoutes);
// app.use('/api/providers', providerRoutes);
// app.use('/api/health', healthRoutes);

// Temporary test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Dr. Fintan Virtual Care Hub Backend API is running!',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Declare server variable
let server: any;

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  try {
    // Close database connections
    await disconnectDatabase();

    // Close server
    if (server) {
      server.close(() => {
        logger.info('Server closed successfully');
        process.exit(0);
      });
    }

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
server = app.listen(config.server.port, async () => {
  logger.info(`🚀 Dr. Fintan Virtual Care Hub Backend API Server started`);
  logger.info(`📍 Environment: ${config.server.nodeEnv}`);
  logger.info(`🌐 Server running on port ${config.server.port}`);
  logger.info(`📊 API Base URL: ${config.server.apiBaseUrl}`);
  logger.info(`🔗 Frontend URL: ${config.frontend.url}`);
  
  // Check database connection
  const dbConnected = await checkDatabaseConnection();
  if (dbConnected) {
    logger.info('✅ Database connection established');
  } else {
    logger.error('❌ Database connection failed');
  }
  
  logger.info('🎯 Ready to serve requests!');
});

export default app;
