"""
Migration script to assign unique 8-digit student IDs to existing students.

Usage:
    cd backend
    .\\venv\\Scripts\\python.exe -m scripts.migrate_student_ids
"""

import asyncio
from app.database.mongodb import db as database
from app.services.student_id_service import generate_student_id


async def migrate():
    # Initialize DB connection
    database.connect()
    mongo_db = database.db
    
    if mongo_db is None:
        print("❌ Failed to connect to MongoDB. Check your .env configuration.")
        return
    
    print("✅ Connected to MongoDB")
    
    # Find all students without a student_id
    cursor = mongo_db["users"].find({
        "role": "student",
        "$or": [
            {"student_id": {"$exists": False}},
            {"student_id": None}
        ]
    })
    
    students = await cursor.to_list(length=10000)
    
    if not students:
        print("✅ No students need migration. All students already have IDs.")
        database.close()
        return
    
    print(f"🔄 Found {len(students)} students without student_id. Assigning IDs...")
    
    count = 0
    for student in students:
        student_id = await generate_student_id(mongo_db)
        await mongo_db["users"].update_one(
            {"_id": student["_id"]},
            {"$set": {"student_id": student_id}}
        )
        name = student.get("full_name", student.get("name", "Unknown"))
        print(f"  → {name}: {student_id}")
        count += 1
    
    print(f"\n✅ Successfully assigned student IDs to {count} students.")
    database.close()


if __name__ == "__main__":
    asyncio.run(migrate())
