from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

load_dotenv()
db_url = os.getenv("DATABASE_URL", "sqlite:///./research_hub.db")
print(f"Using DB: {db_url}")

try:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        conn.execute(text("UPDATE users SET is_verified = 1"))
        conn.commit()
        print("Success: All users marked as verified.")
except Exception as e:
    print(f"Error: {e}")
