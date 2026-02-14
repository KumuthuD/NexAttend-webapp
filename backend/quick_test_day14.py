import sys
import os

# Add local backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

try:
    print("Attempting to import AttendanceMarkRequest...")
    from app.schemas.attendance import AttendanceMarkRequest
    print("Successfully imported AttendanceMarkRequest")
except ImportError as e:
    print(f" Failed to import AttendanceMarkRequest: {e}")
except Exception as e:
    print(f" An unexpected error occurred: {e}")

try:
    print("Attempting to import AttendanceBatchRecord...")
    from app.schemas.attendance import AttendanceBatchRecord
    print("Successfully imported AttendanceBatchRecord")
except ImportError as e:
    print(f"Failed to import AttendanceBatchRecord: {e}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")
