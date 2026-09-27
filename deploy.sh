#!/usr/bin/env bash
# ==============================================================================
# AI STOCK ANALYTICS - ONE-CLICK DEPLOYMENT SCRIPT
# ==============================================================================
# This script deploys the entire AI Stock Analytics platform to a local/cloud VPS
# using Docker Compose. It handles environment setup, builds images, and starts
# all services (FastAPI, Next.js, Redis, Celery Worker, Celery Beat).
#
# Usage: chmod +x deploy.sh && ./deploy.sh
# ==============================================================================

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
ENV_FILE=".env"
ENV_TEMPLATE=".env.production.template"
COMPOSE_FILE="docker-compose.yml"

echo -e "${BLUE}${BOLD}"
echo "=============================================================================="
echo "  AI STOCK ANALYTICS - DEPLOYMENT SCRIPT"
echo "=============================================================================="
echo -e "${NC}"

# ------------------------------------------------------------------------------
# STEP 1: Check for .env file
# ------------------------------------------------------------------------------
echo -e "${YELLOW}[1/6] Checking environment configuration...${NC}"

if [[ ! -f "$ENV_FILE" ]]; then
    echo -e "${RED}${BOLD}"
    echo "=============================================================================="
    echo "  ERROR: .env FILE NOT FOUND"
    echo "=============================================================================="
    echo -e "${NC}"
    echo -e "${YELLOW}Creating .env from template...${NC}"
    cp "$ENV_TEMPLATE" "$ENV_FILE"
    echo -e "${GREEN}Created $ENV_FILE from template.${NC}"
    echo ""
    echo -e "${RED}${BOLD}=============================================================================="
    echo "  ACTION REQUIRED: Populate your API keys in .env before deploying!"
    echo "=============================================================================="
    echo -e "${NC}"
    echo "Edit the .env file and replace all 'your_*_here' placeholder values with"
    echo "your actual API keys and secrets. Required keys:"
    echo ""
    echo "  • MARKET_API_KEY           (Alpha Vantage)"
    echo "  • OPENROUTER_API_KEY       (OpenRouter for Llama/Mixtral)"
    echo "  • ANTHROPIC_API_KEY        (Claude 3.5 Sonnet for Consensus)"
    echo "  • NEXT_PUBLIC_SUPABASE_URL (Your Supabase project URL)"
    echo "  • NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "  • SUPABASE_SERVICE_KEY"
    echo "  • SUPABASE_JWT_SECRET"
    echo "  • DISCORD_WEBHOOK_URL      (optional)"
    echo "  • SLACK_WEBHOOK_URL        (optional)"
    echo "  • TELEGRAM_BOT_TOKEN       (optional)"
    echo ""
    echo "After editing .env, run ./deploy.sh again."
    exit 1
fi

# Load environment variables
set -a
source "$ENV_FILE"
set +a
echo -e "${GREEN}Environment loaded from $ENV_FILE${NC}"

# ------------------------------------------------------------------------------
# STEP 2: Validate critical environment variables
# ------------------------------------------------------------------------------
echo -e "${YELLOW}[2/6] Validating required environment variables...${NC}"

REQUIRED_VARS=(
    "MARKET_API_KEY"
    "OPENROUTER_API_KEY"
    "ANTHROPIC_API_KEY"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_KEY"
    "SUPABASE_JWT_SECRET"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    value="${!var:-}"
    if [[ -z "$value" ]] || [[ "$value" == *"your_"* ]] || [[ "$value" == *"_here"* ]]; then
        MISSING_VARS+=("$var")
    fi
done

if [[ ${#MISSING_VARS[@]} -gt 0 ]]; then
    echo -e "${RED}${BOLD}"
    echo "=============================================================================="
    echo "  ERROR: MISSING OR UNCONFIGURED REQUIRED VARIABLES"
    echo "=============================================================================="
    echo -e "${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo -e "  ${RED}✗${NC} $var"
    done
    echo ""
    echo "Please edit .env and populate all required values."
    exit 1
fi

echo -e "${GREEN}All required environment variables are configured.${NC}"

# ------------------------------------------------------------------------------
# STEP 3: Stop existing containers
# ------------------------------------------------------------------------------
echo -e "${YELLOW}[3/6] Stopping existing containers...${NC}"
docker compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || true
echo -e "${GREEN}Existing containers stopped.${NC}"

# ------------------------------------------------------------------------------
# STEP 4: Build Docker images
# ------------------------------------------------------------------------------
echo -e "${YELLOW}[4/6] Building Docker images (this may take a few minutes)...${NC}"
docker compose -f "$COMPOSE_FILE" build --no-cache --parallel
echo -e "${GREEN}Docker images built successfully.${NC}"

# ------------------------------------------------------------------------------
# STEP 5: Start services
# ------------------------------------------------------------------------------
echo -e "${YELLOW}[5/6] Starting services...${NC}"
docker compose -f "$COMPOSE_FILE" up -d

# Wait for services to be healthy
echo "Waiting for services to become healthy..."
sleep 10

# ------------------------------------------------------------------------------
# STEP 6: Verify deployment
# ------------------------------------------------------------------------------
echo -e "${YELLOW}[6/6] Verifying deployment...${NC}"

# Check API health
API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health || echo "000")
if [[ "$API_HEALTH" == "200" ]]; then
    echo -e "${GREEN}✓ FastAPI backend is healthy (port 8000)${NC}"
else
    echo -e "${RED}✗ FastAPI backend health check failed (HTTP $API_HEALTH)${NC}"
fi

# Check Frontend
WEB_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [[ "$WEB_HEALTH" == "200" ]]; then
    echo -e "${GREEN}✓ Next.js frontend is healthy (port 3000)${NC}"
else
    echo -e "${RED}✗ Next.js frontend health check failed (HTTP $WEB_HEALTH)${NC}"
fi

# Check Redis
if docker compose -f "$COMPOSE_FILE" exec -T redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
    echo -e "${GREEN}✓ Redis is healthy (port 6379)${NC}"
else
    echo -e "${RED}✗ Redis health check failed${NC}"
fi

# ------------------------------------------------------------------------------
# DEPLOYMENT COMPLETE
# ------------------------------------------------------------------------------
echo ""
echo -e "${BLUE}${BOLD}"
echo "=============================================================================="
echo "  DEPLOYMENT COMPLETE"
echo "=============================================================================="
echo -e "${NC}"
echo ""
echo -e "${GREEN}Services are now running:${NC}"
echo "  • Frontend (Next.js):   http://localhost:3000"
echo "  • Backend API (FastAPI): http://localhost:8000"
echo "  • API Documentation:     http://localhost:8000/docs"
echo "  • Health Check:          http://localhost:8000/health"
echo "  • Prometheus Metrics:    http://localhost:8000/metrics"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  • View all logs:        docker compose logs -f"
echo "  • View API logs:        docker compose logs -f api"
echo "  • View Worker logs:     docker compose logs -f celery-worker"
echo "  • View Beat logs:       docker compose logs -f celery-beat"
echo "  • View Web logs:        docker compose logs -f web"
echo "  • Stop all services:    docker compose down"
echo "  • Restart services:     docker compose restart"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Open http://localhost:3000 in your browser"
echo "  2. Register a new account or sign in"
echo "  3. Add tickers to your watchlist from the Dashboard"
echo "  4. Run a watchlist scan to trigger the Multi-Agent Swarm"
echo "  5. Execute paper trades and download PDF tear-sheets from Portfolio"
echo ""
echo -e "${GREEN}${BOLD}Happy Trading! 📈${NC}"