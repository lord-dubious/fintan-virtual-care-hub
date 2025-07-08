#!/bin/sh
set -e

# Fintan Virtual Care Hub - Docker Entrypoint Script

echo "🚀 Starting Fintan Virtual Care Hub..."

# Function to wait for database
wait_for_db() {
    echo "⏳ Waiting for database to be ready..."
    
    # Extract database connection details from DATABASE_URL
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    
    if [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ]; then
        echo "⚠️  Could not parse database connection details from DATABASE_URL"
        echo "   Using default values: localhost:5432"
        DB_HOST="localhost"
        DB_PORT="5432"
    fi
    
    echo "   Checking connection to $DB_HOST:$DB_PORT..."
    
    # Wait for database to be ready
    timeout=60
    while ! nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
        timeout=$((timeout - 1))
        if [ $timeout -eq 0 ]; then
            echo "❌ Database connection timeout"
            exit 1
        fi
        echo "   Database not ready, waiting... ($timeout seconds remaining)"
        sleep 1
    done
    
    echo "✅ Database is ready!"
}

# Function to run database migrations
run_migrations() {
    echo "🔄 Running database migrations..."
    cd /app/backend
    
    # Check if database exists and is accessible
    if npx prisma db push --accept-data-loss 2>/dev/null; then
        echo "✅ Database schema updated successfully"
    else
        echo "⚠️  Database schema update failed, trying migration..."
        if npx prisma migrate deploy; then
            echo "✅ Database migrations completed successfully"
        else
            echo "❌ Database migrations failed"
            exit 1
        fi
    fi
    
    # Generate Prisma client (in case of schema changes)
    npx prisma generate
    echo "✅ Prisma client generated"
}

# Function to seed database (optional)
seed_database() {
    if [ "$SEED_DATABASE" = "true" ]; then
        echo "🌱 Seeding database..."
        cd /app/backend
        if npx prisma db seed; then
            echo "✅ Database seeded successfully"
        else
            echo "⚠️  Database seeding failed (this might be expected if data already exists)"
        fi
    fi
}

# Function to start the backend server
start_backend() {
    echo "🖥️  Starting backend server..."
    cd /app/backend
    
    # Start backend in background
    node dist/server.js &
    BACKEND_PID=$!
    
    echo "✅ Backend server started (PID: $BACKEND_PID)"
    echo "   Backend running on port ${BACKEND_PORT:-10000}"
}

# Function to start the frontend server
start_frontend() {
    echo "🌐 Starting frontend server..."
    
    # Install a simple static file server
    npm install -g serve
    
    # Start frontend in background
    cd /app/frontend
    serve -s dist -l ${FRONTEND_PORT:-3000} &
    FRONTEND_PID=$!
    
    echo "✅ Frontend server started (PID: $FRONTEND_PID)"
    echo "   Frontend running on port ${FRONTEND_PORT:-3000}"
}

# Function to handle graceful shutdown
graceful_shutdown() {
    echo "🛑 Received shutdown signal, gracefully stopping services..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        echo "   Stopping backend server..."
        kill -TERM $BACKEND_PID 2>/dev/null || true
        wait $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "   Stopping frontend server..."
        kill -TERM $FRONTEND_PID 2>/dev/null || true
        wait $FRONTEND_PID 2>/dev/null || true
    fi
    
    echo "✅ Graceful shutdown completed"
    exit 0
}

# Function to check health
health_check() {
    echo "🏥 Running health checks..."
    
    # Check backend health
    if curl -f http://localhost:${BACKEND_PORT:-10000}/health >/dev/null 2>&1; then
        echo "✅ Backend health check passed"
    else
        echo "❌ Backend health check failed"
        return 1
    fi
    
    # Check frontend availability
    if curl -f http://localhost:${FRONTEND_PORT:-3000} >/dev/null 2>&1; then
        echo "✅ Frontend health check passed"
    else
        echo "❌ Frontend health check failed"
        return 1
    fi
    
    echo "✅ All health checks passed"
    return 0
}

# Set up signal handlers for graceful shutdown
trap graceful_shutdown SIGTERM SIGINT

# Main execution
main() {
    echo "🔧 Environment: ${NODE_ENV:-development}"
    echo "🔧 App Version: ${APP_VERSION:-unknown}"
    
    # Wait for external dependencies
    wait_for_db
    
    # Run database setup
    run_migrations
    seed_database
    
    # Start services
    start_backend
    sleep 5  # Give backend time to start
    start_frontend
    
    # Wait a moment for services to start
    sleep 10
    
    # Run initial health check
    if health_check; then
        echo "🎉 Fintan Virtual Care Hub started successfully!"
        echo ""
        echo "📊 Service Status:"
        echo "   Frontend: http://localhost:${FRONTEND_PORT:-3000}"
        echo "   Backend:  http://localhost:${BACKEND_PORT:-10000}"
        echo "   Health:   http://localhost:${BACKEND_PORT:-10000}/health"
        echo ""
    else
        echo "❌ Health check failed during startup"
        graceful_shutdown
        exit 1
    fi
    
    # Keep the script running and monitor processes
    while true; do
        # Check if backend is still running
        if ! kill -0 $BACKEND_PID 2>/dev/null; then
            echo "❌ Backend process died, restarting..."
            start_backend
        fi
        
        # Check if frontend is still running
        if ! kill -0 $FRONTEND_PID 2>/dev/null; then
            echo "❌ Frontend process died, restarting..."
            start_frontend
        fi
        
        # Run periodic health checks
        if [ $(($(date +%s) % 300)) -eq 0 ]; then  # Every 5 minutes
            if ! health_check; then
                echo "⚠️  Health check failed, but continuing..."
            fi
        fi
        
        sleep 30
    done
}

# Run main function
main "$@"
