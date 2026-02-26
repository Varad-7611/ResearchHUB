#!/usr/bin/env bash
set -e

echo "🚀 Starting ResearchHUB AI Backend..."

# Ensure we are in backend directory
if [ ! -f "main.py" ]; then
  echo "❌ main.py not found. Make sure Render root is project root."
  exit 1
fi

# Load .env ONLY if present (local dev)
if [ -f ".env" ]; then
  echo "🔐 Loading environment variables from .env"
  export $(grep -v '^#' .env | xargs)
else
  echo "ℹ️ .env not found. Using Render environment variables."
fi

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Debug (safe check – no secrets printed)
echo "✅ Environment loaded:"
echo "   ➜ SMTP_HOST=${SMTP_HOST:-not_set}"
echo "   ➜ DATABASE_URL=${DATABASE_URL:-not_set}"
echo "   ➜ PORT=${PORT:-8000}"

# Start FastAPI app
echo "🔥 Launching FastAPI server..."
uvicorn main:app \
  --host 0.0.0.0 \
  --port ${PORT:-8000}
