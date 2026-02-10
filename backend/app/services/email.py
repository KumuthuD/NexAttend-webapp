from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.core.config import settings
from typing import List
from pathlib import Path

# Email Configuration
conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_TLS,
    MAIL_SSL_TLS=settings.MAIL_SSL,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_email(email_to: List[str], subject: str, html_content: str):
    """
    Send an email efficiently using fastapi-mail background tasks
    """
    if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
        print(f"[MOCK EMAIL] To: {email_to}, Subject: {subject}")
        print(f"[MOCK CONTENT] {html_content[:100]}...")
        return

    message = MessageSchema(
        subject=subject,
        recipients=email_to,
        body=html_content,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)

async def send_verification_email(email: str, token: str):
    """
    Send account verification email
    """
    verification_link = f"http://localhost:5173/verify-email?token={token}"
    
    html_content = f"""
    <html>
        <body>
            <h1>Verify your NexAttend Account</h1>
            <p>Welcome to NexAttend! Please click the link below to verify your email address:</p>
            <a href="{verification_link}" style="padding: 10px 20px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
            <p>If you didn't request this, please ignore this email.</p>
        </body>
    </html>
    """
    
    await send_email([email], "Verify your NexAttend Account", html_content)

async def send_password_reset_email(email: str, token: str):
    """
    Send password reset email
    """
    reset_link = f"http://localhost:5173/reset-password?token={token}"
    
    html_content = f"""
    <html>
        <body>
            <h1>Reset your Password</h1>
            <p>Click the link below to verify reset your password:</p>
            <a href="{reset_link}" style="padding: 10px 20px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>
        </body>
    </html>
    """
    
    await send_email([email], "Reset your Password", html_content)
