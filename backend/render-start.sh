#!/usr/bin/env bash
set -e

echo "🚀 Starting ResearchHUB AI Backend (Render)"

# Move into backend directory safely
cd "$(dirname "$0")"

# ===============================
# LOAD ENV (LOCAL ONLY)
# ===============================
if [ -f ".env" ]; then
  echo "🔐 Loading local .env file"
  export $(grep -v '^#' .env | xargs)
else
  echo "ℹ️ Using Render environment variables"
fi

# ===============================
# ENSURE DATABASE_URL EXISTS
# ===============================
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set!"
  exit 1
fi

echo "🗄 DATABASE_URL detected"

# ===============================
# ENSURE PORT EXISTS
# ===============================
PORT="${PORT:-10000}"
export PORT

echo "🌐 Binding to PORT=${PORT}"

# ===============================
# TEST DATABASE CONNECTION
# ===============================
echo "🔎 Testing database connection..."

python - <<EOF
import os
from sqlalchemy import create_engine

url = os.getenv("DATABASE_URL")
engine = create_engine(url)

try:
    conn = engine.connect()
    conn.close()
    print("✅ Database connection successful")
except Exception as e:
    print("❌ Database connection failed:", e)
    raise
EOF

# ===============================
# START FASTAPI
# ===============================
echo "🔥 Starting Uvicorn..."

exec uvicorn main:app \
  --host 0.0.0.0 \
  --port "$PORT" \
  --log-level info
