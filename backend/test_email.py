import asyncio
from datetime import datetime
from app.services.email_service import email_service
from app.core.config import settings

# override config to use mailtrap or a local debugger server if we want to trace
settings.SMTP_HOST = "localhost"
settings.SMTP_PORT = 1025
settings.SMTP_USER = "test"
settings.SMTP_PASSWORD = "testpassword"

async def run_test():
    print("Testing email delivery...")
    result = await email_service.send_attendance_confirmation(
        email="test@example.com",
        student_name="Test Student",
        class_name="CS101",
        date_time=datetime.utcnow()
    )
    print(f"Send status: {result}")

if __name__ == "__main__":
    asyncio.run(run_test())
