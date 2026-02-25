@echo off
echo Starting ResearchHUB AI Backend...
cd backend
if not exist venv (
    echo Virtual environment not found. Creating one...
    python -m venv venv
    call venv\Scripts\activate
    echo Installing requirements...
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate
)
echo Starting FastAPI server on http://localhost:8000
python main.py
pause
