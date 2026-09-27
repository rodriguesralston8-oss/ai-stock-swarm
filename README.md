# AI-Driven Stock Market Directional Prediction & Analytics System

A production-ready monorepo application that ingests live market data, calculates quantitative technical indicators, feeds features into a Large Language Model for directional price prediction, and visualizes the telemetry on a modern web dashboard.

## Architecture Overview

```
monorepo-root/
├── backend/                          # FastAPI Python Server
│   ├── main.py                       # Application entry point & API routes
│   ├── services/
│   │   ├── data_fetcher.py           # Async Alpha Vantage client with RAM caching
│   │   ├── features.py               # Vectorized Pandas/Numpy indicator math
│   │   ├── llm_gateway.py            # Multi-model resilient LLM gateway with failover & streaming
│   │   ├── llm_inference.py          # Legacy LLM inference (deprecated)
│   │   ├── multi_agent.py            # Multi-Agent Swarm (Bull/Bear/Consensus)
│   │   ├── notifier.py               # Discord/Slack/Telegram webhook dispatcher
│   │   ├── portfolio_engine.py       # Paper trading execution engine
│   │   ├── reporter.py               # PDF tear-sheet generator (fpdf2)
│   │   ├── risk_engine.py            # Monte Carlo GBM & VaR/Sharpe/Sortino metrics
│   │   ├── scanner.py                # Watchlist scanner with Celery background jobs
│   │   └── backtester.py             # Historical walk-forward simulation engine
│   ├── core/
│   │   ├── auth.py                   # JWT verification (Supabase)
│   │   ├── celery_app.py             # Celery + Redis beat schedule
│   │   ├── metrics.py                # Prometheus metrics & middleware
│   │   └── rate_limiter.py           # Redis sliding-window rate limiter
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── .env.example
├── frontend/                         # Next.js 14 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx           # Next.js global loading UI
│   │   │   ├── error.tsx             # Next.js error boundary
│   │   │   ├── dashboard/page.tsx    # Main telemetry dashboard
│   │   │   ├── portfolio/page.tsx    # Paper trading & portfolio terminal
│   │   │   └── (auth)/               # Login / Register pages
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui compatible components
│   │   │   ├── Header.tsx            # Auth-aware navigation
│   │   │   ├── TradingViewChart.tsx  # Lightweight Charts candlestick + volume + SMA
│   │   │   ├── PredictionCard.tsx
│   │   │   └── PriceChart.tsx
│   │   ├── hooks/
│   │   │   └── useStreamPrediction.ts # Real-time SSE streaming hook
│   │   └── lib/
│   │       ├── api.ts                # Backend fetch utilities (Bearer JWT)
│   │       ├── supabase.ts           # Database client
│   │       ├── db.ts                 # Database helpers (watchlist, logging)
│   │       └── utils.ts              # Utility functions
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── .env.example
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql    # Tables + RLS policies
│   │   └── portfolio_schema.sql      # Portfolios, positions, trades tables
│   └── init_db.py                    # Database initialization script
├── scripts/
│   └── smoke_test.py                 # E2E smoke test runner
├── deploy/
│   └── kubernetes/
│       ├── backend-deployment.yaml   # K8s deployment (2 replicas, probes)
│       ├── frontend-deployment.yaml  # K8s deployment (2 replicas, probes)
│       ├── service.yaml              # ClusterIP, Ingress, secrets, namespace
│       ├── kustomization.yaml        # Kustomize config
│       └── prometheus-rules.yaml     # Prometheus alerting rules
├── docker-compose.yml                # Production + dev orchestration
├── deploy.sh                         # One-click deployment script
├── .env.production.template          # Production secrets template
├── package.json                      # Root workspace scripts
└── README.md
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lightweight Charts, Lucide React |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, Pandas, NumPy, HTTPX, OpenAI SDK |
| **Database** | Supabase (PostgreSQL) with Row Level Security |
| **AI/ML** | Multi-Agent Swarm: Llama 3 70B (Bull/Bear) + Claude 3.5 Sonnet (Consensus) via OpenRouter/Anthropic |
| **Market Data** | Alpha Vantage (free tier compatible) |
| **Background Jobs** | Celery + Redis (beat schedule for daily scans) |
| **Observability** | Prometheus metrics, `/metrics` endpoint, custom counters/histograms |
| **Streaming** | Server-Sent Events (SSE), token-by-token typewriter UI |
| **Deployment** | Docker, Docker Compose, Kubernetes (Kustomize) |

## Features

- **Real-time Market Data**: Async Alpha Vantage client with 60-second in-memory cache to respect rate limits
- **Technical Indicators**: RSI, MACD, Bollinger Bands, ATR, Stochastic, OBV — all vectorized (zero for-loops)
- **Quantitative Risk Engine**: Monte Carlo GBM (100 paths, 30-day), VaR 95/99% (historical + parametric), Sharpe/Sortino/Calmar ratios, Max Drawdown
- **Multi-Agent AI Swarm**: Bull Agent (Llama 3), Bear Agent (Llama 3), Consensus Agent (Claude 3.5 Sonnet) — concurrent debate resolution
- **Resilient LLM Gateway**: Automatic failover between Llama 3 70B (primary) and Mixtral 8x7B (fallback) on rate limits, timeouts, 5xx errors
- **Real-time Streaming**: SSE endpoint (`/api/v1/stock/predict/stream`) with token-by-token typewriter effect on dashboard
- **AI Predictions**: Structured LLM prompts with Pydantic-enforced JSON output (`direction_prediction`, `confidence_score`, `signals_justification`, `news_sentiment_analysis`, `fundamental_impact_score`)
- **Paper Trading Engine**: Simulated order execution with 0.05% slippage, $1 commission, weighted avg cost basis, realized PnL
- **Portfolio Management**: Live equity, cash, unrealized/realized PnL, win rate, profit factor, position table with close buttons
- **Trade Journal**: Paginated history with slippage, commission, realized PnL
- **PDF Tear-Sheets**: Professional 2-page portfolio reports (positions + trade journal) via fpdf2
- **Celery Background Workers**: Scheduled scanner at 4:00 PM EST (market close) + 9:15 AM EST (pre-market) with webhook notifications
- **Backtesting**: Walk-forward simulation with accuracy, precision, recall, and simulated return metrics
- **User Watchlists**: Persisted to Supabase with RLS (per-user isolation)
- **Prediction Logging**: Automatic background logging of AI telemetry to `backtest_logs`
- **Observability**: Prometheus metrics (`/metrics`) — HTTP latency, cache hit/miss, LLM inference duration, failover count
- **Modern Dashboard**: TradingView-style candlestick + volume + SMA charts, live AI inference panel, backtest metrics grid, searchable watchlist
- **Full-Stack Auth**: Next.js middleware protection, Supabase Auth (email/password), JWT verification on FastAPI, auth-aware header

## Prerequisites

- **Python 3.11+**
- **Node.js 20+**
- **Supabase Account** (project URL + anon/service keys)
- **Alpha Vantage API Key** (free: https://www.alphavantage.co/support/#api-key)
- **OpenRouter API Key** (https://openrouter.ai/keys)
- **Anthropic API Key** (https://console.anthropic.com/) — for Consensus Agent
- **Kubernetes Cluster** (for production deployment, v1.28+)
- **Prometheus Operator** (for metrics scraping and alerting)

## Environment Variables

### Backend (`backend/.env`)

```bash
# Required
MARKET_API_KEY=your_alpha_vantage_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret

# Optional
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_PRIMARY_MODEL=meta-llama/llama-3-70b-instruct
LLM_FALLBACK_MODEL=mistralai/mixtral-8x7b-instruct
LLM_BULL_MODEL=meta-llama/llama-3-70b-instruct
LLM_BEAR_MODEL=meta-llama/llama-3-70b-instruct
LLM_CONSENSUS_MODEL=anthropic/claude-3.5-sonnet
USE_SWARM=true
PORT=8000
REDIS_URL=redis://localhost:6379

# Optional Webhooks
DISCORD_WEBHOOK_URL=
SLACK_WEBHOOK_URL=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

### Frontend (`frontend/.env.local`)

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Quick Start (Local Development)

### 1. Clone and Install Dependencies

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your API keys
pip install -r requirements.txt

# Frontend
cd ../frontend
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
npm install
```

### 2. Initialize Database

Run the Supabase schema migration:

```bash
cd supabase
python init_db.py
```

Or manually execute `supabase/migrations/001_initial_schema.sql` and `supabase/migrations/portfolio_schema.sql` in your Supabase SQL Editor.

### 3. Start Development Servers

```bash
# Terminal 1 - Backend (port 8000)
cd backend
uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend (port 3000)
cd frontend
npm run dev
```

### 4. Access the Dashboard

Open http://localhost:3000/dashboard

Enable the **"Real-time Streaming"** toggle to see live token-by-token AI inference.

## Live Cloud Deployment (One-Command)

For production VPS deployment, use the automated deployment script:

```bash
# 1. Make the script executable
chmod +x deploy.sh

# 2. Run the deployment (will create .env from template if missing)
./deploy.sh
```

### What the deployment script does:

1. **Environment Check** — Validates `.env` exists; if missing, copies `.env.production.template` to `.env` and exits with instructions to populate API keys
2. **Variable Validation** — Ensures all required secrets are configured (Alpha Vantage, OpenRouter, Anthropic, Supabase, JWT secret)
3. **Clean Slate** — Stops and removes any existing containers
4. **Fresh Build** — Builds FastAPI and Next.js Docker images with `--no-cache`
5. **Launch Cluster** — Starts all services in detached mode:
   - FastAPI API (port 8000)
   - Next.js Web (port 3000)
   - Redis (port 6379)
   - Celery Worker (background tasks)
   - Celery Beat (scheduled scanner at market close + pre-market)
6. **Health Verification** — Confirms all services are responding

### After deployment:

```bash
# View live logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f celery-worker
docker-compose logs -f celery-beat

# Stop all services
docker-compose down

# Restart services
docker-compose restart
```

### Access Points:

| Service | URL |
|---------|-----|
| Dashboard | http://localhost:3000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| Health Check | http://localhost:8000/health |
| Prometheus Metrics | http://localhost:8000/metrics |

### Required Environment Variables (in `.env`):

All variables are documented in `.env.production.template`. Required keys:

- `MARKET_API_KEY` — Alpha Vantage API key
- `OPENROUTER_API_KEY` — For Llama 3 / Mixtral models
- `ANTHROPIC_API_KEY` — For Consensus Agent (Claude 3.5 Sonnet)
- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon public key
- `SUPABASE_SERVICE_KEY` — Supabase service role key (secret)
- `SUPABASE_JWT_SECRET` — Supabase JWT secret for token verification

Optional webhook notifications:
- `DISCORD_WEBHOOK_URL`, `SLACK_WEBHOOK_URL`, `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`

### Production Hardening Checklist:

- [ ] Replace all placeholder values in `.env` with real credentials
- [ ] Configure reverse proxy (NGINX) with TLS termination for HTTPS
- [ ] Set up domain DNS pointing to VPS IP
- [ ] Enable UFW firewall: `ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw enable`
- [ ] Set up automated backups for Supabase/Redis
- [ ] Configure log rotation: `docker-compose logs --max-size=10m --max-file=3`
- [ ] Monitor disk space: `df -h` (Docker images can grow large)

## Prometheus Monitoring

### Local Metrics Access

```bash
# Backend metrics endpoint
curl http://localhost:8000/metrics

# Key metrics exposed:
# - http_requests_total{method,endpoint,status_code}
# - http_request_duration_seconds{method,endpoint}
# - cache_hits_total / cache_misses_total
# - llm_inference_duration_seconds{model,streaming}
# - llm_failover_total{from_model,to_model}
# - active_connections{endpoint}
# - inference_errors_total{error_type,model}
```

### Prometheus Scraping Config

Add to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'ai-stock-api'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'
```

### Grafana Dashboards

Import the provided dashboard JSON (see `deploy/grafana/ai-stock-dashboard.json`) for:
- Request rate / latency / error rate (RED metrics)
- Cache efficiency (hit/miss ratio)
- LLM inference duration by model + streaming vs non-streaming
- Failover rate and active SSE connections

### Alerting Rules

Deploy `deploy/kubernetes/prometheus-rules.yaml` to your Prometheus Operator:

```bash
kubectl apply -f deploy/kubernetes/prometheus-rules.yaml
```

Alerts included:
- `AIStockAPIDown` — API unavailable > 2min
- `AIStockAPIHighLatency` — p95 latency > 2s for 5min
- `AIStockAPIHighErrorRate` — 5xx rate > 5% for 3min
- `AIStockLLMFailoverHigh` — failover rate > 0.1/s for 2min
- `AIStockLLMHighLatency` — p95 inference > 15s for 5min
- `AIStockCacheMissRateHigh` — miss rate > 30% for 5min
- `AIStockSSEConnectionsHigh` — > 100 concurrent streams

## Docker Deployment

### Production Mode

```bash
# Build and start production containers
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Services:
- **API**: http://localhost:8000 (FastAPI)
- **Web**: http://localhost:3000 (Next.js)
- **Metrics**: http://localhost:8000/metrics

### Development Mode (with hot reload)

```bash
# Start with dev profile
docker-compose --profile dev up --build

# Stop
docker-compose --profile dev down
```

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster v1.28+
- `kubectl` configured
- `kustomize` installed (or use `kubectl apply -k`)
- Ingress controller (NGINX recommended)
- cert-manager for TLS (optional)
- Prometheus Operator for metrics/alerts

### Deploy

```bash
# 1. Create namespace and secrets (edit secrets first!)
kubectl apply -f deploy/kubernetes/service.yaml

# 2. Deploy applications
kubectl apply -k deploy/kubernetes/

# 3. Verify
kubectl get pods -n ai-stock
kubectl get svc -n ai-stock
kubectl get ingress -n ai-stock
```

### Kustomize Overlays (Production vs Staging)

```bash
# Production
kubectl apply -k deploy/kubernetes/overlays/production

# Staging
kubectl apply -k deploy/kubernetes/overlays/staging
```

### Image Building for Registry

```bash
# Tag and push to your registry
docker build -t your-registry/ai-stock-api:v1.0.0 ./backend
docker push your-registry/ai-stock-api:v1.0.0

docker build -t your-registry/ai-stock-web:v1.0.0 ./frontend
docker push your-registry/ai-stock-web:v1.0.0

# Update kustomization.yaml images section or use kustomize edit
kustomize edit set image ai-stock-api=your-registry/ai-stock-api:v1.0.0
kustomize edit set image ai-stock-web=your-registry/ai-stock-web:v1.0.0
```

### Health Checks & Probes

| Probe | Endpoint | Initial Delay | Period | Timeout | Failure Threshold |
|-------|----------|---------------|--------|---------|-------------------|
| Startup | `/health` | 5s | 5s | 5s | 30 |
| Readiness | `/health` | 10s | 10s | 5s | 3 |
| Liveness | `/health` | 30s | 30s | 10s | 3 |

### Rolling Updates

```bash
# Update image tag
kubectl set image deployment/ai-stock-api api=your-registry/ai-stock-api:v1.1.0 -n ai-stock
kubectl set image deployment/ai-stock-web web=your-registry/ai-stock-web:v1.1.0 -n ai-stock

# Monitor rollout
kubectl rollout status deployment/ai-stock-api -n ai-stock
kubectl rollout status deployment/ai-stock-web -n ai-stock
```

### Scaling

```bash
# Horizontal Pod Autoscaler (HPA)
kubectl autoscale deployment ai-stock-api --cpu-percent=70 --min=2 --max=10 -n ai-stock
kubectl autoscale deployment ai-stock-web --cpu-percent=70 --min=2 --max=10 -n ai-stock

# Manual scale
kubectl scale deployment ai-stock-api --replicas=5 -n ai-stock
```

## API Endpoints

### Public (v1) — Used by Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/stock/fetch?ticker=AAPL` | 30-day price history |
| `POST` | `/api/v1/stock/predict` | AI directional prediction (blocking JSON) |
| `GET` | `/api/v1/stock/predict/stream?ticker=AAPL` | **SSE streaming prediction** |
| `GET` | `/api/v1/stock/risk?ticker=AAPL` | Risk metrics + Monte Carlo |
| `GET` | `/api/v1/backtest?ticker=AAPL` | Backtest metrics (1 year) |
| `POST` | `/api/v1/scanner/run` | Trigger watchlist scan |

### Portfolio Management (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/portfolio/trade` | Execute paper trade |
| `GET` | `/api/v1/portfolio` | Portfolio summary + positions |
| `GET` | `/api/v1/portfolio/trades` | Paginated trade history |
| `POST` | `/api/v1/portfolio/positions/{ticker}/close` | Close position |
| `GET` | `/api/v1/portfolio/export/pdf` | Download PDF tear-sheet |

### Watchlist (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/watchlist` | Get user's watchlist |
| `POST` | `/api/watchlist` | Add ticker to watchlist |
| `DELETE` | `/api/watchlist/{ticker}` | Remove ticker |

### Observability

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/metrics` | Prometheus metrics |

## Database Schema

### `watchlists`
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users)
- `ticker` (TEXT)
- `created_at` (TIMESTAMPTZ)
- **Unique**: `(user_id, ticker)`
- **RLS**: Users only access own rows

### `backtest_logs`
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users)
- `ticker` (TEXT)
- `prediction_date` (DATE)
- `predicted_dir` (TEXT: UP/DOWN)
- `confidence` (DECIMAL 5,4)
- `actual_dir` (TEXT: UP/DOWN, nullable)
- `justification` (TEXT)
- `created_at` (TIMESTAMPTZ)
- **RLS**: Users only access own rows

### `portfolios`
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users)
- `cash_balance` (NUMERIC 15,2)
- `initial_balance` (NUMERIC 15,2)
- `currency` (VARCHAR 3)
- `updated_at` (TIMESTAMPTZ)
- **Unique**: `(user_id)`

### `positions`
- `id` (UUID, PK)
- `portfolio_id` (UUID, FK → portfolios)
- `ticker` (VARCHAR 10)
- `shares` (NUMERIC 12,4)
- `average_entry_price` (NUMERIC 12,4)
- `updated_at` (TIMESTAMPTZ)
- **Unique**: `(portfolio_id, ticker)`

### `trades`
- `id` (UUID, PK)
- `portfolio_id` (UUID, FK → portfolios)
- `ticker` (VARCHAR 10)
- `side` (VARCHAR 4: BUY/SELL)
- `order_type` (VARCHAR 6: MARKET/LIMIT)
- `shares` (NUMERIC 12,4)
- `execution_price` (NUMERIC 12,4)
- `slippage` (NUMERIC 8,4)
- `commission` (NUMERIC 8,2)
- `realized_pnl` (NUMERIC 12,2)
- `executed_at` (TIMESTAMPTZ)
- `notes` (TEXT)

## Development Guidelines

1. **No Placeholders**: All code is production-ready; no TODOs or mock data
2. **Rate Limit Prevention**: In-memory cache (60s TTL) on Alpha Vantage calls
3. **Strict Data Contracts**: Pydantic models enforce LLM JSON output schema
4. **Vectorized Math**: Pandas/NumPy only — no Python for-loops in features
5. **Secure Config**: All secrets via `os.environ.get()` / `process.env`
6. **Async First**: All FastAPI endpoints and HTTP calls use `async/await`
7. **Resilient LLM**: Automatic failover on 429, 503, timeouts, connection errors
8. **Observability First**: All critical paths instrumented with Prometheus metrics

## Testing

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test

# E2E Smoke Test (requires running services)
python scripts/smoke_test.py --url http://localhost:8000

# Run all CI checks locally (if act is installed)
act -W .github/workflows/ci.yml
```

## Project Scripts (Root)

```bash
# Install all dependencies
npm run install:all

# Run both dev servers
npm run dev

# Build frontend
npm run build

# Initialize database
npm run db:init

# Docker production
npm run docker:up
npm run docker:down
```

## License

MIT