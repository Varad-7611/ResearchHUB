import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
# Try MySQL default
DATABASE_URL = "mysql+pymysql://root:@localhost:3306/research_hub_ai"

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("Successfully connected to MySQL!")
        tables = conn.execute(text("SHOW TABLES")).fetchall()
        print("Tables in MySQL:")
        for t in tables:
            print(f"- {t[0]}")
        
        users = conn.execute(text("SELECT id, email, is_verified FROM users")).fetchall()
        print("Users in MySQL:")
        for u in users:
            print(u)
except Exception as e:
    print(f"Error connecting to MySQL: {e}")
