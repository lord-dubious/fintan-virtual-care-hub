# 🛑 Graceful Shutdown Implementation

## Overview

The Dr. Fintan Virtual Care Hub backend server implements comprehensive graceful shutdown handling to ensure data integrity and proper resource cleanup when the server is stopped.

## ✅ Features

### Signal Handling
- **SIGINT** (Ctrl+C) - Interactive interrupt
- **SIGTERM** - Termination request (Docker/PM2)
- **SIGHUP** - Terminal closed
- **SIGQUIT** - Quit signal

### Error Handling
- **Uncaught Exceptions** - Logs error details and attempts graceful shutdown
- **Unhandled Promise Rejections** - Logs rejection details and attempts graceful shutdown
- **Process Warnings** - Logs warnings for debugging

### Cleanup Process
1. **HTTP Server** - Stops accepting new connections and closes existing ones
2. **Socket.IO** - Disconnects all clients and closes WebSocket connections
3. **Database** - Closes Prisma database connections
4. **Timeout Protection** - Forces exit after 15 seconds if graceful shutdown hangs

## 🚀 Usage

### Development
```bash
# Start the server
npm run dev

# Stop gracefully with Ctrl+C
# The server will log the shutdown process
```

### Production (PM2)
```bash
# PM2 will send SIGTERM for graceful shutdown
pm2 stop server
pm2 restart server
```

### Docker
```bash
# Docker will send SIGTERM followed by SIGKILL
docker stop container_name
```

## 🧪 Testing

Run the test script to verify graceful shutdown:

```bash
node test-graceful-shutdown.js
```

## 📋 Shutdown Sequence

1. **Signal Received** - Server logs which signal triggered shutdown
2. **HTTP Server Close** - Stops accepting new connections
3. **Socket.IO Cleanup** - Disconnects all WebSocket clients
4. **Database Cleanup** - Closes all database connections
5. **Process Exit** - Clean exit with code 0

## 🔍 Logs Example

```
🛑 Received SIGINT. Starting graceful shutdown...
📊 Shutting down server...
✅ HTTP server closed successfully
🔌 Closing Socket.IO connections...
✅ Socket.IO connections closed
🗄️ Closing database connections...
✅ Database connections closed
🎉 Graceful shutdown completed successfully
```

## ⚠️ Important Notes

- **Timeout Protection**: Server will force exit after 15 seconds if graceful shutdown hangs
- **Error Recovery**: If graceful shutdown fails, server will still exit to prevent hanging
- **Resource Cleanup**: All database connections and Socket.IO connections are properly closed
- **Signal Logging**: All shutdown signals are logged with descriptive messages

## 🛠️ Configuration

The graceful shutdown behavior can be customized in `src/server.ts`:

- **Timeout Duration**: Currently set to 15 seconds
- **Signal Handlers**: Can add/remove signal types
- **Cleanup Order**: Can modify the sequence of cleanup operations
