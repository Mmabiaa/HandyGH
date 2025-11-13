#!/bin/bash
# HandyGH Quick Deployment Script
# This script automates the deployment process for HandyGH backend
# Use with caution in production!

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/opt/handygh"
BACKEND_DIR="$APP_DIR/backend"
VENV_DIR="$BACKEND_DIR/venv"
BACKUP_DIR="$APP_DIR/backups"

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "ℹ $1"
}

check_root() {
    if [ "$EUID" -eq 0 ]; then
        print_error "Do not run this script as root"
        exit 1
    fi
}

check_directory() {
    if [ ! -d "$BACKEND_DIR" ]; then
        print_error "Backend directory not found: $BACKEND_DIR"
        exit 1
    fi
}

backup_database() {
    print_info "Creating database backup..."
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

    mkdir -p "$BACKUP_DIR"

    if sudo -u postgres pg_dump handygh_db > "$BACKUP_FILE"; then
        print_success "Database backed up to $BACKUP_FILE"
    else
        print_error "Database backup failed"
        exit 1
    fi
}

pull_latest_code() {
    print_info "Pulling latest code from git..."
    cd "$APP_DIR"

    if git pull origin main; then
        print_success "Code updated successfully"
    else
        print_error "Git pull failed"
        exit 1
    fi
}

activate_venv() {
    print_info "Activating virtual environment..."
    if [ -f "$VENV_DIR/bin/activate" ]; then
        source "$VENV_DIR/bin/activate"
        print_success "Virtual environment activated"
    else
        print_error "Virtual environment not found"
        exit 1
    fi
}

install_dependencies() {
    print_info "Installing/updating dependencies..."
    cd "$BACKEND_DIR"

    if pip install -r requirements/production.txt --quiet; then
        print_success "Dependencies installed"
    else
        print_error "Dependency installation failed"
        exit 1
    fi
}

run_migrations() {
    print_info "Running database migrations..."
    cd "$BACKEND_DIR"

    if python manage.py migrate --noinput; then
        print_success "Migrations completed"
    else
        print_error "Migrations failed"
        exit 1
    fi
}

collect_static() {
    print_info "Collecting static files..."
    cd "$BACKEND_DIR"

    if python manage.py collectstatic --noinput --clear; then
        print_success "Static files collected"
    else
        print_error "Static file collection failed"
        exit 1
    fi
}

restart_services() {
    print_info "Restarting application service..."

    if sudo systemctl restart handygh; then
        print_success "Application service restarted"
    else
        print_error "Service restart failed"
        exit 1
    fi

    # Wait for service to start
    sleep 3

    # Check service status
    if sudo systemctl is-active --quiet handygh; then
        print_success "Application service is running"
    else
        print_error "Application service failed to start"
        sudo journalctl -u handygh -n 50
        exit 1
    fi
}

verify_deployment() {
    print_info "Verifying deployment..."

    # Check if application responds
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/health/ | grep -q "200"; then
        print_success "Application is responding"
    else
        print_warning "Application health check failed"
    fi

    # Check logs for errors
    if sudo journalctl -u handygh --since "1 minute ago" | grep -i error; then
        print_warning "Errors found in logs"
    else
        print_success "No errors in recent logs"
    fi
}

# Main deployment process
main() {
    echo "=========================================="
    echo "HandyGH Deployment Script"
    echo "=========================================="
    echo ""

    # Pre-flight checks
    print_info "Running pre-flight checks..."
    check_root
    check_directory
    print_success "Pre-flight checks passed"
    echo ""

    # Confirm deployment
    read -p "Are you sure you want to deploy? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        print_info "Deployment cancelled"
        exit 0
    fi
    echo ""

    # Backup
    backup_database
    echo ""

    # Update code
    pull_latest_code
    echo ""

    # Activate virtual environment
    activate_venv
    echo ""

    # Install dependencies
    install_dependencies
    echo ""

    # Run migrations
    run_migrations
    echo ""

    # Collect static files
    collect_static
    echo ""

    # Restart services
    restart_services
    echo ""

    # Verify deployment
    verify_deployment
    echo ""

    echo "=========================================="
    print_success "Deployment completed successfully!"
    echo "=========================================="
    echo ""
    print_info "Next steps:"
    echo "  1. Check application logs: sudo journalctl -u handygh -f"
    echo "  2. Test critical endpoints"
    echo "  3. Monitor error rates"
    echo ""
}

# Run main function
main
