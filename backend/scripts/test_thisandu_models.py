import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.models.student import Student
from app.models.classroom import Classroom
from app.schemas.student import StudentCreate
from app.schemas.classroom import ClassroomCreate

def test_models():
    print("Testing Student Model...")
    student = Student(
        name="Test Student",
        roll_number="CSE-2024-001",
        email="test@example.com",
        course="Computer Science",
        year=3
    )
    print(f"Student created: {student.model_dump_json(indent=2)}")
    
    print("\nTesting Classroom Model...")
    classroom = Classroom(
        name="Intro to AI",
        course_code="AI-101",
        teacher_id="teacher_123",
        schedule="Mon/Wed 10:00 AM"
    )
    print(f"Classroom created: {classroom.model_dump_json(indent=2)}")
    
    print("\nTesting Student Schema...")
    s_schema = StudentCreate(
         name="Schema Student",
        roll_number="CSE-2024-002",
        email="schema@example.com",
        course="IT",
        year=2
    )
    assert s_schema.name == "Schema Student"
    
    print("\n All Use Case Models Verified Successfully!")

if __name__ == "__main__":
    try:
        test_models()
    except Exception as e:
        print(f" Test Failed: {e}")
        exit(1)
