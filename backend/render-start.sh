#!/usr/bin/env bash
set -e

echo "🚀 Starting ResearchHUB AI Backend (Render)"

# Always run from backend directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Render provides PORT (default 10000)
PORT="${PORT:-10000}"
export PORT

echo "🌐 Binding FastAPI to PORT=${PORT}"

# Optional: small delay to avoid early port scan race
sleep 2

# Start FastAPI (Render detects this)
exec uvicorn main:app \
  --host 0.0.0.0 \
  --port "$PORT" \
  --log-level info
