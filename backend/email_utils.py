import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME")

def send_otp_email(recipient_email: str, otp_code: str):
    msg = MIMEMultipart()
    msg["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
    msg["To"] = recipient_email
    msg["Subject"] = "ResearchHUB AI - Verification Code"

    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #0d1117; color: #ffffff; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #161b22; padding: 40px; border-radius: 10px; border: 1px solid #30363d;">
            <h2 style="color: #58a6ff; text-align: center;">Welcome to ResearchHUB AI</h2>
            <p style="font-size: 16px;">Hello,</p>
            <p style="font-size: 16px;">Thank you for signing up for ResearchHUB AI. Please use the following OTP to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #58a6ff; background-color: #21262d; padding: 10px 20px; border-radius: 5px;">{otp_code}</span>
            </div>
            <p style="font-size: 14px; color: #8b949e;">This code will expire in 10 minutes.</p>
            <hr style="border: 0; border-top: 1px solid #30363d; margin: 30px 0;">
            <p style="font-size: 12px; color: #8b949e; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
    </body>
    </html>
    """
    msg.attach(MIMEText(body, "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
