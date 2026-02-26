#!/usr/bin/env bash
set -e

echo "🚀 Starting ResearchHUB AI Backend (Render Mode)"

# Always run from backend directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Safety check
if [ ! -f "main.py" ]; then
  echo "❌ main.py not found in backend/"
  exit 1
fi

# Load .env ONLY for local development
if [ -f ".env" ]; then
  echo "🔐 Loading local .env"
  export $(grep -v '^#' .env | xargs)
else
  echo "ℹ️ Using Render environment variables"
fi

# 🔑 CRITICAL FIX: guarantee PORT
PORT="${PORT:-8000}"
export PORT

echo "🌐 Binding FastAPI to PORT=${PORT}"

# Optional: small delay to let Render env settle
sleep 2

# Start FastAPI (Render-detected)
exec uvicorn main:app \
  --host 0.0.0.0 \
  --port "$PORT" \
  --log-level info
