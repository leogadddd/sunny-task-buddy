#!/bin/bash

# Quick script to install all dependencies and rebuild containers
# This is the most common workflow when adding new dependencies

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔧 Installing dependencies and rebuilding containers..."

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd "$PROJECT_ROOT/frontend"
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd "$PROJECT_ROOT/backend"
npm install

# Rebuild and start containers
echo "🐳 Rebuilding containers..."
cd "$PROJECT_ROOT"
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo "✅ All done! Containers are starting up."
echo "🌐 Frontend: http://localhost:8080"
echo "🔧 Backend: http://localhost:4000"