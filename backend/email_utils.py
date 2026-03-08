import os
from dotenv import load_dotenv

load_dotenv()

def send_otp_email(recipient_email: str, otp_code: str):
    print(f"Mocking email to {recipient_email} with OTP {otp_code}")
    return True
