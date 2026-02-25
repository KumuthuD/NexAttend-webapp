import os
from jinja2 import Environment, FileSystemLoader
from datetime import datetime

# 1. Setup Jinja2 environment focusing on our templates folder
template_dir = os.path.join(os.path.dirname(__file__), "app", "templates", "email")
env = Environment(loader=FileSystemLoader(template_dir))

# 2. Load our new template
template = env.get_template("attendance_confirmation.html")

# 3. Inject fake data for testing
html_content = template.render(
    student_name="Kumuthu Dahanayake",
    class_name="Advanced Software Engineering 101",
    date_time=datetime.now().strftime("%B %d, %Y at %I:%M %p"),
    dashboard_link="https://nexattend.com/dashboard"
)

# 4. Save the compiled output so we can open it in the browser
output_file = os.path.join(os.path.dirname(__file__), "preview_email.html")
with open(output_file, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f" Success! Template rendered with fake data.")
print(f" Please double-click this file to view your email: {output_file}")
