#!/bin/bash

# Production Database Migration Script
# Fintan Virtual Care Hub

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"
BACKUP_DIR="/var/backups/fintan"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if we're in the right directory
    if [ ! -f "$BACKEND_DIR/package.json" ]; then
        log_error "Backend directory not found. Please run this script from the project root."
        exit 1
    fi
    
    # Check if Prisma is available
    if ! command -v npx &> /dev/null; then
        log_error "npx is not available. Please install Node.js and npm."
        exit 1
    fi
    
    # Check if database URL is set
    if [ -z "$DATABASE_URL" ]; then
        log_error "DATABASE_URL environment variable is not set."
        exit 1
    fi
    
    # Check database connectivity
    log_info "Testing database connectivity..."
    cd "$BACKEND_DIR"
    if ! npx prisma db execute --stdin <<< "SELECT 1;" &> /dev/null; then
        log_error "Cannot connect to database. Please check your DATABASE_URL."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Create backup
create_backup() {
    log_info "Creating database backup..."
    
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    # Extract database details from DATABASE_URL
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
    
    BACKUP_FILE="$BACKUP_DIR/fintan_backup_$TIMESTAMP.sql"
    
    log_info "Backing up database to: $BACKUP_FILE"
    
    # Create backup using pg_dump
    if PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --verbose \
        --no-owner \
        --no-privileges \
        > "$BACKUP_FILE"; then
        log_success "Database backup created successfully"
        
        # Compress backup
        gzip "$BACKUP_FILE"
        log_success "Backup compressed: ${BACKUP_FILE}.gz"
    else
        log_error "Database backup failed"
        exit 1
    fi
}

# Check migration status
check_migration_status() {
    log_info "Checking current migration status..."
    
    cd "$BACKEND_DIR"
    
    # Get migration status
    if npx prisma migrate status; then
        log_success "Migration status check completed"
    else
        log_warning "Migration status check failed or migrations are pending"
    fi
}

# Run migrations
run_migrations() {
    log_info "Running database migrations..."
    
    cd "$BACKEND_DIR"
    
    # Deploy migrations
    if npx prisma migrate deploy; then
        log_success "Database migrations completed successfully"
    else
        log_error "Database migrations failed"
        log_info "Attempting to restore from backup..."
        restore_backup
        exit 1
    fi
    
    # Generate Prisma client
    log_info "Generating Prisma client..."
    if npx prisma generate; then
        log_success "Prisma client generated successfully"
    else
        log_error "Prisma client generation failed"
        exit 1
    fi
}

# Restore backup (in case of failure)
restore_backup() {
    log_warning "Restoring database from backup..."
    
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/fintan_backup_*.sql.gz 2>/dev/null | head -n1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        log_error "No backup found for restoration"
        return 1
    fi
    
    log_info "Restoring from: $LATEST_BACKUP"
    
    # Extract database details
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
    
    # Restore backup
    if gunzip -c "$LATEST_BACKUP" | PGPASSWORD="$POSTGRES_PASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME"; then
        log_success "Database restored from backup"
    else
        log_error "Database restoration failed"
        return 1
    fi
}

# Validate migration
validate_migration() {
    log_info "Validating migration..."
    
    cd "$BACKEND_DIR"
    
    # Check if database schema matches Prisma schema
    if npx prisma db pull --print | diff - prisma/schema.prisma > /dev/null; then
        log_success "Database schema validation passed"
    else
        log_warning "Database schema differs from Prisma schema"
        log_info "This might be expected if you have custom database changes"
    fi
    
    # Run a simple query to test connectivity
    if npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"User\";" &> /dev/null; then
        log_success "Database connectivity test passed"
    else
        log_error "Database connectivity test failed"
        exit 1
    fi
}

# Cleanup old backups
cleanup_backups() {
    log_info "Cleaning up old backups..."
    
    # Keep only the last 10 backups
    if [ -d "$BACKUP_DIR" ]; then
        find "$BACKUP_DIR" -name "fintan_backup_*.sql.gz" -type f | \
        sort -r | \
        tail -n +11 | \
        xargs -r rm -f
        
        log_success "Old backups cleaned up"
    fi
}

# Main migration process
main() {
    log_info "Starting production database migration..."
    log_info "Timestamp: $TIMESTAMP"
    
    # Check if this is a dry run
    if [ "$1" = "--dry-run" ]; then
        log_info "DRY RUN MODE - No changes will be made"
        check_prerequisites
        check_migration_status
        log_info "Dry run completed successfully"
        exit 0
    fi
    
    # Confirm production migration
    if [ "$NODE_ENV" = "production" ] && [ "$1" != "--force" ]; then
        echo -e "${YELLOW}WARNING: You are about to run migrations in PRODUCTION environment.${NC}"
        echo -e "${YELLOW}This operation can be destructive and may cause downtime.${NC}"
        echo ""
        read -p "Are you sure you want to continue? (yes/no): " -r
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            log_info "Migration cancelled by user"
            exit 0
        fi
    fi
    
    # Execute migration steps
    check_prerequisites
    create_backup
    check_migration_status
    run_migrations
    validate_migration
    cleanup_backups
    
    log_success "Production database migration completed successfully!"
    log_info "Backup created: $BACKUP_DIR/fintan_backup_$TIMESTAMP.sql.gz"
}

# Handle script arguments
case "$1" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --dry-run    Check migration status without making changes"
        echo "  --force      Skip confirmation prompt in production"
        echo "  --help, -h   Show this help message"
        echo ""
        echo "Environment Variables:"
        echo "  DATABASE_URL       PostgreSQL connection string (required)"
        echo "  POSTGRES_PASSWORD  PostgreSQL password for backup operations"
        echo "  NODE_ENV          Environment (production, staging, etc.)"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
