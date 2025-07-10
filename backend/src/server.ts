import { config } from "@/config";
import { checkDatabaseConnection, disconnectDatabase } from "@/config/database";
import logger from "@/config/logger";
import { initializeSocket } from "@/config/socket";
import { errorHandler, notFoundHandler } from "@/middleware/errorHandler";
import { rateLimiters } from "@/middleware/rateLimiter";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { createServer } from "http";
import net from "net";
import os from "os";

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
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "ws:", "wss:", "https:", "http:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "blob:"],
        frameSrc: ["'self'", "https:"],
        frameAncestors: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration - Allow all origins
app.use(
  cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "x-csrf-token",
    ],
    exposedHeaders: ["X-Total-Count", "X-Page-Count"],
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parsing middleware
app.use(cookieParser());

// Static file serving for uploads
app.use("/uploads", express.static("uploads"));

// Custom request logging with debug info
app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString().substring(11, 19); // HH:MM:SS

  // Log incoming request with useful debug info
  if (req.path !== "/health") {
    // Skip health check spam
    logger.info(`📥 [${timestamp}] ${req.method} ${req.path}`, {
      origin: req.get("Origin") || "no-origin",
      contentType: req.get("Content-Type") || "none",
      auth: req.get("Authorization") ? "Bearer ***" : "none",
      ip: req.ip,
    });
  }

  // Log response when finished
  res.on("finish", () => {
    if (req.path !== "/health") {
      // Skip health check spam
      const duration = Date.now() - start;
      const statusEmoji =
        res.statusCode >= 400 ? "❌" : res.statusCode >= 300 ? "⚠️" : "✅";

      logger.info(
        `📤 [${timestamp}] ${statusEmoji} ${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`
      );

      // Log errors with more detail
      if (res.statusCode >= 400) {
        logger.error(`🔍 Error details for ${req.method} ${req.path}:`, {
          status: res.statusCode,
          duration: `${duration}ms`,
          origin: req.get("Origin"),
          userAgent: req.get("User-Agent")?.substring(0, 100),
        });
      }
    }
  });

  next();
});

// Rate limiting
app.use("/api", rateLimiters.api);

// Health check endpoint (before authentication)
app.get("/health", async (req, res) => {
  try {
    const dbHealthy = await checkDatabaseConnection();
    const uptime = process.uptime();

    const health = {
      status: dbHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      database: {
        status: dbHealthy ? "healthy" : "unhealthy",
      },
      environment: config.server.nodeEnv,
      version: process.env["npm_package_version"] || "1.0.0",
    };

    res.status(dbHealthy ? 200 : 503).json(health);
  } catch (error) {
    logger.error("Health check failed:", error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Health check failed",
    });
  }
});

// Import routes
import authRoutes from "@/routes/authRoutes";
import patientRoutes from "@/routes/patientRoutes";
import userRoutes from "@/routes/userRoutes";
// import profileRoutes from './routes/profileRoutes';
import activityRoutes from "@/routes/activityRoutes";
import adminRoutes from "@/routes/adminRoutes";
import appointmentRoutes from "@/routes/appointmentRoutes";
import availabilityRoutes from "@/routes/availability";
import calcomRoutes from "@/routes/calcomRoutes";
import calendarRoutes from "@/routes/calendarRoutes";
import consultationRoutes from "@/routes/consultationRoutes";
import medicalRecordRoutes from "@/routes/medicalRecordRoutes";
import onboardingRoutes from "@/routes/onboardingRoutes";
import paymentRoutes from "@/routes/paymentRoutes";
import providerRoutes from "@/routes/providerRoutes";
import schedulingRoutes from "@/routes/schedulingRoutes";

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
// app.use('/api/profile', profileRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/payments", rateLimiters.api, paymentRoutes);
app.use("/api/patients/onboarding", rateLimiters.api, onboardingRoutes);
app.use("/api/admin", rateLimiters.admin, adminRoutes);
app.use("/api/scheduling", schedulingRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/calcom", calcomRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/patients/activities", activityRoutes);
app.use("/api/availability", availabilityRoutes);
// app.use('/api/patients', patientRoutes);
// app.use('/api/health', healthRoutes);

// Temporary test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Dr. Fintan Virtual Care Hub Backend API is running!",
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Create HTTP server and initialize Socket.IO
const httpServer = createServer(app);
const socketService = initializeSocket(httpServer);

// Declare server variable
let server: any;

// Port checking utility
const isPortInUse = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const testServer = net.createServer();

    testServer.listen(port, () => {
      testServer.close(() => {
        resolve(false); // Port is available
      });
    });

    testServer.on("error", () => {
      resolve(true); // Port is in use
    });
  });
};

// Network interface utility
const getNetworkInterfaces = () => {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];

  for (const name of Object.keys(interfaces)) {
    const nets = interfaces[name];
    if (nets) {
      for (const net of nets) {
        // Skip internal and non-IPv4 addresses
        if (net.family === "IPv4" && !net.internal) {
          addresses.push(`${net.address} (${name})`);
        }
      }
    }
  }

  return addresses;
};

// Kill processes using the port
const killPortProcesses = async (port: number): Promise<void> => {
  try {
    const { exec } = require("child_process");
    const util = require("util");
    const execAsync = util.promisify(exec);

    // Find processes using the port
    try {
      const { stdout } = await execAsync(`lsof -ti:${port}`);
      const pidList = stdout.trim().split("\n");
      const pids = pidList.filter((pid: string) => pid.trim() !== "");

      if (pids.length > 0) {
        logger.info(
          `🔍 Found ${pids.length} process(es) using port ${port}: ${pids.join(", ")}`
        );

        // Kill each process
        for (const pid of pids) {
          try {
            await execAsync(`kill -9 ${pid}`);
            logger.info(`💀 Killed process ${pid} using port ${port}`);
          } catch (error) {
            logger.warn(`⚠️ Could not kill process ${pid}: ${error}`);
          }
        }

        // Wait a moment for processes to die
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      // lsof command failed, port might be free
      logger.debug(`No processes found using port ${port}`);
    }
  } catch (error) {
    logger.error(`Error killing port processes: ${error}`);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`🛑 Received ${signal}. Starting graceful shutdown...`);

  // Set a timeout for forced shutdown
  const forceShutdownTimeout = setTimeout(() => {
    logger.error("⏰ Forced shutdown after 15 seconds timeout");
    process.exit(1);
  }, 15000);

  try {
    logger.info("📊 Shutting down server...");

    // Close HTTP server (stops accepting new connections)
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((err: Error | undefined) => {
          if (err) {
            logger.error("❌ Error closing HTTP server:", err);
            reject(err);
          } else {
            logger.info("✅ HTTP server closed successfully");
            resolve();
          }
        });
      });
    }

    // Close Socket.IO connections
    if (socketService) {
      logger.info("🔌 Closing Socket.IO connections...");
      socketService.close();
      logger.info("✅ Socket.IO connections closed");
    }

    // Close database connections
    logger.info("🗄️ Closing database connections...");
    await disconnectDatabase();
    logger.info("✅ Database connections closed");

    // Clear the force shutdown timeout
    clearTimeout(forceShutdownTimeout);

    logger.info("🎉 Graceful shutdown completed successfully");
    process.exit(0);
  } catch (error) {
    logger.error("❌ Error during graceful shutdown:", error);
    clearTimeout(forceShutdownTimeout);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on("SIGTERM", () => {
  logger.info("🔄 SIGTERM received (Docker/PM2 shutdown)");
  gracefulShutdown("SIGTERM");
});

process.on("SIGINT", () => {
  logger.info("⌨️ SIGINT received (Ctrl+C)");
  gracefulShutdown("SIGINT");
});

process.on("SIGHUP", () => {
  logger.info("🔄 SIGHUP received (terminal closed)");
  gracefulShutdown("SIGHUP");
});

process.on("SIGQUIT", () => {
  logger.info("🛑 SIGQUIT received (quit signal)");
  gracefulShutdown("SIGQUIT");
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("💥 Uncaught Exception:", {
    message: error.message,
    stack: error.stack,
    name: error.name,
  });

  // Try graceful shutdown, but force exit if it takes too long
  setTimeout(() => {
    logger.error("⏰ Force exit after uncaught exception");
    process.exit(1);
  }, 5000);

  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("🚫 Unhandled Promise Rejection:", {
    reason: reason,
    promise: promise,
    stack: reason instanceof Error ? reason.stack : "No stack trace",
  });

  // Try graceful shutdown, but force exit if it takes too long
  setTimeout(() => {
    logger.error("⏰ Force exit after unhandled rejection");
    process.exit(1);
  }, 5000);

  gracefulShutdown("UNHANDLED_REJECTION");
});

// Handle process warnings
process.on("warning", (warning) => {
  logger.warn("⚠️ Process Warning:", {
    name: warning.name,
    message: warning.message,
    stack: warning.stack,
  });
});

// Check and clean up port before starting
const startServer = async () => {
  const port = config.server.port;

  logger.info(`🚀 Starting server on port ${port}...`);

  // Start server with Socket.IO
  server = httpServer.listen(port, config.server.host, async () => {
    const networkInterfaces = getNetworkInterfaces();

    logger.info(`🚀 Dr. Fintan Virtual Care Hub Backend API Server started`);
    logger.info(`📍 Environment: ${config.server.nodeEnv}`);
    logger.info(`🌐 Server binding: ${config.server.host}:${port}`);
    logger.info(`📡 Port ${port} is now OPEN and accepting connections`);

    if (config.server.host === "0.0.0.0") {
      logger.info(`🔗 Server accessible on ALL network interfaces:`);
      logger.info(`   • localhost:${port} (local access)`);
      logger.info(`   • 127.0.0.1:${port} (loopback)`);

      // Only log network interfaces in development to avoid exposing internal IPs
      if (process.env.NODE_ENV === 'development' && networkInterfaces.length > 0) {
        logger.info(`   • Network interfaces available (development only)`);
        networkInterfaces.forEach((addr) => {
          logger.info(`   • ${addr.split(" ")[0]}:${port} (network access)`);
        });
      } else if (process.env.NODE_ENV !== 'development') {
        logger.info(`   • Additional network interfaces available (hidden in production)`);
      }
    } else {
      logger.info(`🔗 Server accessible on: ${config.server.host}:${port}`);
    }

    logger.info(`🎯 External Host: ${config.server.backendHost}`);
    logger.info(`📊 API Base URL: ${config.server.apiBaseUrl}`);
    logger.info(`🎯 Frontend URL: ${config.frontend.url}`);
    logger.info(`🔌 Socket.IO enabled for real-time communication`);

    // Check database connection
    const dbConnected = await checkDatabaseConnection();
    if (dbConnected) {
      logger.info("✅ Database connection established");
    } else {
      logger.error("❌ Database connection failed");
    }

    logger.info("🎯 Ready to serve requests!");
    logger.info("💡 Press Ctrl+C to gracefully shutdown the server");
  });

  // Handle server startup errors
  server.on("error", (error: any) => {
    if (error.code === "EADDRINUSE") {
      logger.error(
        `❌ Port ${port} is already in use. Another process might be running.`
      );
      logger.info(
        "💡 Try running: npm run kill-port or manually kill the process"
      );
      process.exit(1);
    } else {
      logger.error("❌ Server startup error:", error);
      process.exit(1);
    }
  });
};

// Start the server
startServer().catch((error) => {
  logger.error("❌ Failed to start server:", error);
  process.exit(1);
});

export default app;
