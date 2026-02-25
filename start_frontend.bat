@echo off
echo Starting ResearchHUB AI Frontend...
cd frontend
if not exist node_modules (
    echo node_modules not found. Installing dependencies...
    npm install
)
echo Starting Vite development server...
npm run dev
pause
