import requests
import time
import os
from sqlalchemy.orm import sessionmaker
from database import engine
import models

BASE_URL = "http://localhost:8000"

def test_flow():
    print("--- Starting Backend Tests ---")
    
    # 1. Signup
    email = f"test_{int(time.time())}@example.com"
    password = "password123"
    print(f"[*] Testing Signup with {email}...")
    signup_data = {
        "name": "Test User",
        "email": email,
        "password": password
    }
    res = requests.post(f"{BASE_URL}/signup", json=signup_data)
    if res.status_code != 200:
        print(f"[!] Signup failed: {res.status_code} - {res.text}")
        return
    print("[+] Signup successful.")
    
    # 2. Get OTP from DB
    print("[*] Retrieving OTP from database...")
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    user = db.query(models.User).filter(models.User.email == email).first()
    otp_record = db.query(models.OTP).filter(models.OTP.user_id == user.id).order_by(models.OTP.id.desc()).first()
    otp_code = otp_record.otp_code
    db.close()
    print(f"[+] OTP retrieved: {otp_code}")
    
    # 3. Verify OTP
    print("[*] Testing OTP Verification...")
    verify_data = {
        "email": email,
        "otp_code": otp_code
    }
    res = requests.post(f"{BASE_URL}/verify-otp", json=verify_data)
    if res.status_code != 200:
        print(f"[!] OTP Verification failed: {res.status_code} - {res.text}")
        return
    print("[+] OTP Verification successful.")
    
    # 4. Login
    print("[*] Testing Login...")
    login_data = {
        "email": email,
        "password": password
    }
    res = requests.post(f"{BASE_URL}/login", json=login_data)
    if res.status_code != 200:
        print(f"[!] Login failed: {res.status_code} - {res.text}")
        return
    token = res.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    print("[+] Login successful.")
    
    # 5. Document Upload
    print("[*] Testing Document Upload...")
    with open("test_upload.txt", "w") as f:
        f.write("This is a test document about the capital of France. The capital of France is Paris.")
    
    with open("test_upload.txt", "rb") as f:
        files = {"file": ("test_upload.txt", f, "text/plain")}
        res = requests.post(f"{BASE_URL}/upload", headers=headers, files=files)
    
    if res.status_code != 200:
        print(f"[!] Document Upload failed: {res.status_code} - {res.text}")
        return
    doc_id = res.json().get("id")
    print(f"[+] Document Upload successful. Doc ID: {doc_id}")
    
    # 6. Create Chat
    print("[*] Testing Create Chat...")
    chat_data = {"chat_title": "Test Chat"}
    res = requests.post(f"{BASE_URL}/chats", headers=headers, json=chat_data)
    if res.status_code != 200:
        print(f"[!] Create Chat failed: {res.status_code} - {res.text}")
        return
    chat_id = res.json().get("id")
    print(f"[+] Create Chat successful. Chat ID: {chat_id}")
    
    # 7. Ask Question to AI
    print("[*] Testing AI Question Answering...")
    query_data = {"query": "What is the capital of France?"}
    res = requests.post(f"{BASE_URL}/chats/{chat_id}/query", headers=headers, data=query_data)
    if res.status_code != 200:
        print(f"[!] AI Question Answering failed: {res.status_code} - {res.text}")
    else:
        print(f"[+] AI Response received: {res.text[:100]}...") # truncate if long
        
    # 8. Document Delete
    print("[*] Testing Document Delete...")
    res = requests.delete(f"{BASE_URL}/documents/{doc_id}", headers=headers)
    if res.status_code != 200:
        print(f"[!] Document Delete failed: {res.status_code} - {res.text}")
    else:
        print("[+] Document Delete successful.")
        
    # 9. Chat Delete
    print("[*] Testing Chat Delete...")
    res = requests.delete(f"{BASE_URL}/chats/{chat_id}", headers=headers)
    if res.status_code != 200:
        print(f"[!] Chat Delete failed: {res.status_code} - {res.text}")
    else:
        print("[+] Chat Delete successful.")
        
    print("--- All tests completed ---")
    
if __name__ == "__main__":
    test_flow()
