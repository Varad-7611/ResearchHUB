import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./research_hub.db")

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        users = conn.execute(text("SELECT id, name, email, is_verified FROM users")).fetchall()
        print(f"Users found in {DATABASE_URL}:")
        for u in users:
            print(u)
except Exception as e:
    print(f"Error: {e}")
