#!/usr/bin/env bash
set -e

echo "🚀 Starting ResearchHUB AI Backend"

# Move into backend directory
cd "$(dirname "$0")"

# ==============================
# LOAD LOCAL .env (optional)
# ==============================
if [ -f ".env" ]; then
  echo "🔐 Loading .env file"
  export $(grep -v '^#' .env | xargs)
else
  echo "ℹ️ Using Render environment variables"
fi

# ==============================
# CHECK DATABASE_URL
# ==============================
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not set!"
  exit 1
fi

echo "🗄 DATABASE_URL is set"

# ==============================
# ENSURE PORT
# ==============================
PORT="${PORT:-10000}"
export PORT

echo "🌐 Binding to PORT=${PORT}"

# ==============================
# START FASTAPI
# ==============================
exec uvicorn main:app \
  --host 0.0.0.0 \
  --port "$PORT" \
  --log-level info
