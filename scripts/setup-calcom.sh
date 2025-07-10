#!/bin/bash

# Cal.com Setup Script for Fintan Virtual Care Hub
# This script helps set up Cal.com self-hosted integration

set -e

echo "🚀 Setting up Cal.com integration for Fintan Virtual Care Hub"
echo "============================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_step "Checking requirements..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    if ! command -v openssl &> /dev/null; then
        print_error "OpenSSL is not installed. Please install OpenSSL first."
        exit 1
    fi
    
    print_status "All requirements are met!"
}

# Generate secure secrets
generate_secrets() {
    print_step "Generating secure secrets..."
    
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    ENCRYPTION_KEY=$(openssl rand -base64 32)
    WEBHOOK_SECRET=$(openssl rand -base64 32)
    DATABASE_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
    
    print_status "Secrets generated successfully!"
}

# Create environment file
create_env_file() {
    print_step "Creating Cal.com environment file..."
    
    if [ -f ".env.calcom" ]; then
        print_warning ".env.calcom already exists. Creating backup..."
        cp .env.calcom .env.calcom.backup.$(date +%Y%m%d_%H%M%S)
    fi
    
    # Get user input for configuration
    echo ""
    echo "Please provide the following configuration details:"
    echo ""
    
    read -p "Enter your domain for Cal.com (e.g., localhost:3001): " CALCOM_DOMAIN
    CALCOM_DOMAIN=${CALCOM_DOMAIN:-localhost:3001}
    
    read -p "Enter your main app domain (e.g., localhost:3000): " MAIN_APP_DOMAIN
    MAIN_APP_DOMAIN=${MAIN_APP_DOMAIN:-localhost:3000}
    
    read -p "Enter your email for notifications (e.g., admin@yourdomain.com): " ADMIN_EMAIL
    ADMIN_EMAIL=${ADMIN_EMAIL:-admin@yourdomain.com}
    
    # Check if Daily.co credentials exist in main .env
    DAILY_API_KEY=""
    if [ -f ".env" ]; then
        DAILY_API_KEY=$(grep "DAILY_API_KEY=" .env | cut -d '=' -f2 | tr -d '"')
    fi
    
    if [ -z "$DAILY_API_KEY" ]; then
        read -p "Enter your Daily.co API key (optional): " DAILY_API_KEY
    else
        print_status "Found existing Daily.co API key in .env file"
    fi
    
    # Create the environment file
    cat > .env.calcom << EOF
# Cal.com Self-Hosted Configuration
# Generated on $(date)

# ==============================================
# REQUIRED: Database Configuration
# ==============================================
CALCOM_DATABASE_PASSWORD=${DATABASE_PASSWORD}
DATABASE_URL=postgresql://calcom:${DATABASE_PASSWORD}@localhost:5433/calcom

# ==============================================
# REQUIRED: Security Keys
# ==============================================
CALCOM_NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
CALCOM_ENCRYPTION_KEY=${ENCRYPTION_KEY}

# ==============================================
# REQUIRED: Application URLs
# ==============================================
CALCOM_WEBAPP_URL=http://${CALCOM_DOMAIN}
MAIN_APP_URL=http://${MAIN_APP_DOMAIN}

# ==============================================
# Daily.co Integration
# ==============================================
DAILY_API_KEY=${DAILY_API_KEY}
DAILY_SCALE_PLAN=false

# ==============================================
# Cal.com API Configuration
# ==============================================
# These will be configured after Cal.com setup
CALCOM_CLIENT_ID=
CALCOM_CLIENT_SECRET=
CALCOM_API_KEY=

# ==============================================
# Email Configuration
# ==============================================
CALCOM_EMAIL_FROM=${ADMIN_EMAIL}
CALCOM_EMAIL_HOST=
CALCOM_EMAIL_PORT=587
CALCOM_EMAIL_USER=
CALCOM_EMAIL_PASSWORD=

# ==============================================
# Integration Settings
# ==============================================
TIMEZONE=UTC
DEFAULT_PROVIDER_NAME=Doctor Fintan Ekochin
DEFAULT_PROVIDER_EMAIL=${ADMIN_EMAIL}

# ==============================================
# Development Settings
# ==============================================
NODE_ENV=development
CALCOM_DEBUG=true

# ==============================================
# Webhook Configuration
# ==============================================
WEBHOOK_ENDPOINT=http://host.docker.internal:3000/api/calcom/webhooks
WEBHOOK_SECRET=${WEBHOOK_SECRET}

# ==============================================
# Redis Configuration
# ==============================================
REDIS_URL=redis://localhost:6380
EOF
    
    print_status "Environment file created: .env.calcom"
}

# Start Cal.com services
start_calcom() {
    print_step "Starting Cal.com services..."
    
    # Load environment variables
    export $(cat .env.calcom | grep -v '^#' | xargs)
    
    # Start the services
    docker-compose -f docker-compose.calcom.yml up -d
    
    print_status "Cal.com services started!"
    print_status "Cal.com will be available at: http://${CALCOM_DOMAIN:-localhost:3001}"
    print_warning "Please wait a few minutes for the services to fully initialize."
}

# Run database migrations
run_migrations() {
    print_step "Running database migrations..."
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 30
    
    # Run Prisma migrations for main app
    if [ -f "backend/prisma/schema.prisma" ]; then
        cd backend
        npx prisma migrate dev --name add_calcom_integration
        cd ..
        print_status "Database migrations completed!"
    else
        print_warning "Prisma schema not found. Please run migrations manually."
    fi
}

# Display next steps
show_next_steps() {
    echo ""
    echo "🎉 Cal.com setup completed!"
    echo "=========================="
    echo ""
    echo "Next steps:"
    echo ""
    echo "1. Wait for Cal.com to fully initialize (2-3 minutes)"
    echo "2. Visit http://${CALCOM_DOMAIN:-localhost:3001} to complete Cal.com setup"
    echo "3. Create an admin user in Cal.com"
    echo "4. Set up OAuth client in Cal.com settings"
    echo "5. Update .env.calcom with OAuth credentials"
    echo "6. Configure webhooks in Cal.com"
    echo "7. Test the integration"
    echo ""
    echo "Useful commands:"
    echo "  - View logs: docker-compose -f docker-compose.calcom.yml logs -f"
    echo "  - Stop services: docker-compose -f docker-compose.calcom.yml down"
    echo "  - Restart services: docker-compose -f docker-compose.calcom.yml restart"
    echo ""
    echo "Configuration files:"
    echo "  - Cal.com environment: .env.calcom"
    echo "  - Docker compose: docker-compose.calcom.yml"
    echo ""
    print_warning "Remember to update your main application's .env file with Cal.com configuration!"
}

# Main execution
main() {
    echo ""
    check_requirements
    echo ""
    generate_secrets
    echo ""
    create_env_file
    echo ""
    start_calcom
    echo ""
    run_migrations
    echo ""
    show_next_steps
}

# Run the main function
main
