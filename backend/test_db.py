import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost:3306/research_hub_ai")
DATABASE_URL = DATABASE_URL.strip('"').strip("'")
if DATABASE_URL.startswith("mysql://"):
    DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)

print(f"Connecting to: {DATABASE_URL}")

try:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("Success: Connection successful!")
        
        # Check tables
        if DATABASE_URL.startswith("sqlite"):
            tables = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
        else:
            tables = conn.execute(text("SHOW TABLES"))
        
        print("Tables found:")
        for t in tables:
            print(f"- {t[0]}")

except Exception as e:
    print(f"Error: {e}")
