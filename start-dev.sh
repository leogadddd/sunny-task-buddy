#!/bin/bash

# 🚀 Quick Start Script - Start PostgreSQL and Backend
# This script starts the database and runs migrations

set -e

echo "🎯 Starting UpTrack Development Environment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${BLUE}🐳 Starting PostgreSQL...${NC}"
cd backend
docker-compose -f docker-compose.dev.yml up -d

echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
sleep 5

# Check if PostgreSQL is ready
until docker exec uptrack-postgres-dev pg_isready -U postgres > /dev/null 2>&1; do
    echo -e "${YELLOW}   Waiting for PostgreSQL...${NC}"
    sleep 2
done

echo -e "${GREEN}✅ PostgreSQL is ready!${NC}"
echo ""

# Run migrations
echo -e "${BLUE}🔄 Running database migrations...${NC}"

if npx prisma migrate deploy 2>/dev/null; then
    echo -e "${GREEN}✅ Migrations applied successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Creating initial migration...${NC}"
    npx prisma migrate dev --name init_phase1_auth
fi

echo ""
echo -e "${GREEN}🎉 Development environment is ready!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo ""
echo -e "  1️⃣  Start the backend:"
echo -e "     ${GREEN}cd backend && npm run dev${NC}"
echo ""
echo -e "  2️⃣  In another terminal, start the frontend:"
echo -e "     ${GREEN}cd frontend && npm run dev${NC}"
echo ""
echo -e "${BLUE}🛠️  Useful commands:${NC}"
echo -e "   ${GREEN}cd backend && docker-compose -f docker-compose.dev.yml logs -f${NC}  - View database logs"
echo -e "   ${GREEN}cd backend && docker-compose -f docker-compose.dev.yml down${NC}      - Stop database"
echo -e "   ${GREEN}cd backend && docker-compose -f docker-compose.dev.yml down -v${NC}   - Stop and remove data"
echo ""
