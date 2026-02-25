import requests
import sqlite3
import time
import os

BASE_URL = "http://localhost:8000"
TEST_EMAIL = "varad19872@gmail.com"
DB_PATH = "e:/research Hub/backend/research_hub.db"

def get_otp_from_db(email):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT o.otp_code FROM otps o 
        JOIN users u ON o.user_id = u.id 
        WHERE u.email = ?
        ORDER BY o.id DESC LIMIT 1
    """, (email,))
    row = cursor.fetchone()
    conn.close()
    return row[0] if row else None

def test_auth_flow():
    print("--- Starting Auth Flow Test ---")
    
    # 1. Signup
    print(f"\n1. Attempting Signup for {TEST_EMAIL}...")
    signup_data = {
        "name": "Test User",
        "email": TEST_EMAIL,
        "password": "Password123!"
    }
    response = requests.post(f"{BASE_URL}/signup", json=signup_data)
    if response.status_code == 400 and "already registered" in response.text:
        print("User already exists, proceeding to check OTP/Login.")
    elif response.status_code == 200:
        print("Signup Success!")
    else:
        print(f"Signup Failed: {response.status_code} - {response.text}")
        return

    # 2. Check OTP in DB
    print("\n2. Checking OTP in database...")
    otp = get_otp_from_db(TEST_EMAIL)
    if otp:
        print(f"OTP found: {otp}")
    else:
        print("OTP not found in database!")
        return

    # 3. Verify OTP
    print(f"\n3. Verifying OTP {otp} for {TEST_EMAIL}...")
    verify_data = {
        "email": TEST_EMAIL,
        "otp_code": otp
    }
    response = requests.post(f"{BASE_URL}/verify-otp", json=verify_data)
    if response.status_code == 200:
        print("Verification Success!")
    else:
        print(f"Verification Failed: {response.status_code} - {response.text}")
        # If it failed because already verified, that's fine for testing
        if "verified" not in response.text.lower():
             return

    # 4. Login
    print("\n4. Attempting Login...")
    login_data = {
        "email": TEST_EMAIL,
        "password": "Password123!"
    }
    response = requests.post(f"{BASE_URL}/login", json=login_data)
    if response.status_code == 200:
        login_resp = response.json()
        token = login_resp["access_token"]
        print("Login Success!")
        print(f"User Name from Login: {login_resp['user']['name']}")
        
        # 5. Check Dashboard Access
        print("\n5. Checking Dashboard Stats Access...")
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/dashboard-stats", headers=headers)
        if response.status_code == 200:
            stats = response.json()
            print("Dashboard Stats Success!")
            print(f"Stats: {stats}")
        else:
            print(f"Dashboard Stats Failed: {response.status_code} - {response.text}")
    else:
        print(f"Login Failed: {response.status_code} - {response.text}")

if __name__ == "__main__":
    test_auth_flow()
