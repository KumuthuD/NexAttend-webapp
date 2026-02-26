import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from jinja2 import Environment, FileSystemLoader
from datetime import datetime
import logging
from app.core.config import settings
from app.models.email_log import EmailLog
from app.database.mongodb import db as database
import traceback

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        try:
            self.template_dir = os.path.join(os.path.dirname(__file__), "..", "templates", "email")
            self.env = Environment(loader=FileSystemLoader(self.template_dir))
        except Exception as e:
            logger.error(f"Failed to initialize EmailService: {e}")
            self.env = None

    def send_attendance_confirmation(self, email: str, student_name: str, class_name: str, date_time: datetime):
        if not email:
            logger.warning("No email provided. Cannot send attendance confirmation.")
            return False

        if not settings.SMTP_HOST or not settings.SMTP_USER:
            logger.warning("SMTP configuration is missing. Cannot send email.")
            return False
            
        if not self.env:
            logger.error("Jinja2 Environment not initialized. Cannot send email.")
            return False
            
        try:
            template = self.env.get_template("attendance_confirmation.html")
            
            # Format datetime
            formatted_date_time = date_time.strftime("%B %d, %Y at %I:%M %p")
            
            html_content = template.render(
                student_name=student_name,
                class_name=class_name,
                date_time=formatted_date_time,
                dashboard_link="https://nexattend.com/dashboard"
            )
            
            msg = MIMEMultipart("alternative")
            msg["Subject"] = "Attendance Confirmed - NexAttend"
            msg["From"] = settings.FROM_EMAIL
            msg["To"] = email
            
            msg.attach(MIMEText(html_content, "html"))
            
            # Send email
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
                
            logger.info(f"Attendance confirmation email sent to {email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {email}: {e}")
            logger.debug(traceback.format_exc())
            return False

    async def _save_log(self, log_data: EmailLog):
        """
        Internal helper to save an email log to MongoDB.
        """
        try:
            if database.db is not None:
                await database.db["email_logs"].insert_one(log_data.model_dump(by_alias=True))
                logger.debug(f"Email log saved for {log_data.recipient_email}")
        except Exception as e:
            logger.error(f"Failed to save email log: {e}")

email_service = EmailService()
