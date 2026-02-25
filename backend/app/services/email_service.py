from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from app.core.config import settings
from jinja2 import Environment, FileSystemLoader
import os
import logging

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def _get_template_env():
        # Get the absolute path to the backend/app directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        app_dir = os.path.dirname(os.path.dirname(current_dir))
        template_dir = os.path.join(app_dir, "app", "templates", "email")
        return Environment(loader=FileSystemLoader(template_dir))

    @staticmethod
    def send_attendance_confirmation(student_name: str, student_email: str, class_name: str, date_time: str):
        """
        Sends an attendance confirmation email to a student using SendGrid.
        """
        if not settings.SENDGRID_API_KEY or settings.SENDGRID_API_KEY == "SG.placeholder_key":
            logger.warning("SendGrid API Key not set. Skipping email.")
            return

        try:
            env = EmailService._get_template_env()
            template = env.get_template("attendance_confirmation.html")
            
            html_content = template.render(
                student_name=student_name,
                class_name=class_name,
                date_time=date_time,
                dashboard_link="https://nex-attend-webapp.vercel.app/dashboard"
            )

            message = Mail(
                from_email=settings.FROM_EMAIL,
                to_emails=student_email,
                subject=f"Attendance Confirmed: {class_name}",
                html_content=html_content
            )

            sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
            response = sg.send(message)
            logger.info(f"Email sent to {student_email}. Status Code: {response.status_code}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {student_email}: {str(e)}")
            return False
