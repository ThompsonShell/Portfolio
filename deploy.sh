#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/portfolio-backend"
FRONTEND_DIR="$ROOT_DIR/portfolio-frontend"

# ---------- Colors ----------
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${CYAN}[DEPLOY]${NC} $1"; }
ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
err()  { echo -e "${RED}[ERR]${NC} $1"; }

# ===========================================================
# 1. BACKEND (Django + Gunicorn)  →  port 8000
# ===========================================================
deploy_backend() {
  log "=== Deploying Backend ==="
  cd "$BACKEND_DIR"

  # --- Virtual environment ---
  if [ ! -d "venv" ]; then
    log "Creating Python virtual environment..."
    python3 -m venv venv
  fi
  source venv/bin/activate

  # --- Install dependencies ---
  log "Installing Python dependencies..."
  pip install -q --upgrade pip
  pip install -q -r requirements.txt

  # --- Environment file ---
  if [ ! -f ".env" ]; then
    err ".env file not found! Copying from .env.example..."
    cp .env.example .env
    echo "  → Edit $BACKEND_DIR/.env with your settings before re-running."
    exit 1
  fi

  # --- Database migrations ---
  log "Running database migrations..."
  python manage.py migrate --noinput

  # --- Collect static files ---
  log "Collecting static files..."
  python manage.py collectstatic --noinput --clear

  # --- Seed data (optional, safe to re-run) ---
  log "Seeding sample data..."
  python manage.py seed_data 2>/dev/null || true

  deactivate
  ok "Backend ready."
}

# ===========================================================
# 2. FRONTEND (Next.js)  →  port 3000
# ===========================================================
deploy_frontend() {
  log "=== Deploying Frontend ==="
  cd "$FRONTEND_DIR"

  # --- Environment file ---
  if [ ! -f ".env.local" ]; then
    err ".env.local not found! Copying from example..."
    cp .env.local.example .env.local
    echo "  → Edit $FRONTEND_DIR/.env.local and re-run."
    exit 1
  fi

  # --- Install dependencies ---
  log "Installing Node.js dependencies..."
  npm ci --omit=dev

  # --- Build ---
  log "Building Next.js application..."
  npm run build

  ok "Frontend ready."
}

# ===========================================================
# 3. START SERVICES
# ===========================================================
start_services() {
  log "=== Starting Services ==="

  # --- Kill any existing processes on 8000 / 3000 ---
  for port in 8000 3000; do
    pid=$(lsof -t -i ":$port" 2>/dev/null || true)
    if [ -n "$pid" ]; then
      log "Killing process on port $port (PID $pid)..."
      kill "$pid" 2>/dev/null || true
      sleep 1
    fi
  done

  # --- Backend (Gunicorn) ---
  log "Starting Backend on port 8000..."
  cd "$BACKEND_DIR"
  source venv/bin/activate
  nohup gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --log-level info \
    --access-logfile "$BACKEND_DIR/logs/gunicorn-access.log" \
    --error-logfile "$BACKEND_DIR/logs/gunicorn-error.log" \
    --pid "$BACKEND_DIR/logs/gunicorn.pid" \
    --daemon
  deactivate
  ok "Backend started → http://localhost:8000"

  # --- Frontend (Next.js) ---
  log "Starting Frontend on port 3000..."
  cd "$FRONTEND_DIR"
  PORT=3000 nohup npx next start \
    -p 3000 \
    > "$FRONTEND_DIR/logs/nextjs.log" \
    2>&1 &
  echo $! > "$FRONTEND_DIR/logs/nextjs.pid"
  ok "Frontend started → http://localhost:3000"
}

# ===========================================================
# 4. STOP SERVICES
# ===========================================================
stop_services() {
  log "=== Stopping Services ==="

  # Backend
  if [ -f "$BACKEND_DIR/logs/gunicorn.pid" ]; then
    kill "$(cat "$BACKEND_DIR/logs/gunicorn.pid")" 2>/dev/null || true
    rm -f "$BACKEND_DIR/logs/gunicorn.pid"
  fi
  pkill -f "gunicorn.*config.wsgi" 2>/dev/null || true

  # Frontend
  if [ -f "$FRONTEND_DIR/logs/nextjs.pid" ]; then
    kill "$(cat "$FRONTEND_DIR/logs/nextjs.pid")" 2>/dev/null || true
    rm -f "$FRONTEND_DIR/logs/nextjs.pid"
  fi
  pkill -f "next start" 2>/dev/null || true

  ok "Services stopped."
}

# ===========================================================
# 5. STATUS
# ===========================================================
status() {
  echo ""
  echo "Service Status:"
  for port in 8000 3000; do
    pid=$(lsof -t -i ":$port" 2>/dev/null || true)
    if [ -n "$pid" ]; then
      name=$( [ "$port" = "8000" ] && echo "Backend (Django)" || echo "Frontend (Next.js)" )
      echo -e "  ${GREEN}✓${NC} $name → PID $pid → http://localhost:$port"
    else
      name=$( [ "$port" = "8000" ] && echo "Backend (Django)" || echo "Frontend (Next.js)" )
      echo -e "  ${RED}✗${NC} $name → not running"
    fi
  done
  echo ""
}

# ===========================================================
# 6. DOCKER COMMANDS
# ===========================================================
docker_build() {
  log "=== Docker: Building images ==="
  docker compose build --no-cache
  ok "Docker images built."
}

docker_up() {
  log "=== Docker: Starting all services ==="
  docker compose up -d
  ok "All services started."
  docker_status
}

docker_down() {
  log "=== Docker: Stopping all services ==="
  docker compose down -v
  ok "Services stopped and volumes removed."
}

docker_logs() {
  log "=== Docker: Tailing logs ==="
  docker compose logs -f "${2:-}"
}

docker_status() {
  echo ""
  echo "Docker Container Status:"
  docker compose ps
  echo ""
}

docker_rebuild() {
  docker_build
  docker_down
  docker_up
}

mkdir -p "$BACKEND_DIR/logs" "$FRONTEND_DIR/logs"

case "${1:-all}" in
  # ---- Native (no Docker) ----
  backend)
    deploy_backend
    ;;
  frontend)
    deploy_frontend
    ;;
  build)
    deploy_backend
    deploy_frontend
    ;;
  start)
    start_services
    ;;
  stop)
    stop_services
    ;;
  restart)
    stop_services
    sleep 1
    start_services
    ;;
  status)
    status
    ;;
  # ---- Docker ----
  docker-build)
    docker_build
    ;;
  docker-up)
    docker_up
    ;;
  docker-down)
    docker_down
    ;;
  docker-logs)
    docker_logs "$@"
    ;;
  docker-status)
    docker_status
    ;;
  docker-rebuild)
    docker_rebuild
    ;;
  docker)
    docker_rebuild
    ;;
  all|*)
    deploy_backend
    deploy_frontend
    start_services
    status
    ;;
esac
