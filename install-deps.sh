#!/bin/bash

# Script to install dependencies and rebuild containers
# Usage: ./install-deps.sh [frontend|backend|all]

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

install_frontend_deps() {
    log_info "Installing frontend dependencies..."
    cd "$FRONTEND_DIR"
    npm install
    log_success "Frontend dependencies installed"
}

install_backend_deps() {
    log_info "Installing backend dependencies..."
    cd "$BACKEND_DIR"
    npm install
    log_success "Backend dependencies installed"
}

rebuild_containers() {
    log_info "Rebuilding Docker containers..."
    cd "$PROJECT_ROOT"
    docker-compose down
    docker-compose build --no-cache
    log_success "Containers rebuilt"
}

start_containers() {
    log_info "Starting containers..."
    cd "$PROJECT_ROOT"
    docker-compose up -d
    log_success "Containers started"
}

show_usage() {
    echo "Usage: $0 [frontend|backend|all|rebuild|start]"
    echo ""
    echo "Commands:"
    echo "  frontend  - Install frontend dependencies only"
    echo "  backend   - Install backend dependencies only"
    echo "  all       - Install dependencies for both frontend and backend"
    echo "  rebuild   - Rebuild containers (assumes dependencies are installed)"
    echo "  start     - Start containers (assumes containers are built)"
    echo ""
    echo "Examples:"
    echo "  $0 all        # Install all deps and rebuild containers"
    echo "  $0 frontend   # Install only frontend deps"
    echo "  $0 rebuild    # Just rebuild containers"
}

case "${1:-all}" in
    "frontend")
        install_frontend_deps
        ;;
    "backend")
        install_backend_deps
        ;;
    "all")
        install_frontend_deps
        install_backend_deps
        rebuild_containers
        start_containers
        ;;
    "rebuild")
        rebuild_containers
        start_containers
        ;;
    "start")
        start_containers
        ;;
    *)
        show_usage
        exit 1
        ;;
esac

log_success "Done!"