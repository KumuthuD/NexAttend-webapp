"""
Service for generating unique 8-digit student IDs.

Format: YYMM + 4-digit sequential number
Example: 26030001 (first student registered in March 2026)
"""

import random
from datetime import datetime, timezone


async def generate_student_id(db) -> str:
    """
    Generate a unique 8-digit student ID.
    
    Uses YYMM prefix + sequential 4-digit suffix.
    Falls back to random 8-digit number if overflow (>9999).
    """
    now = datetime.now(timezone.utc)
    prefix = now.strftime("%y%m")  # e.g., "2603" for March 2026

    # Find the highest existing student_id with this prefix
    regex_pattern = f"^{prefix}"
    pipeline = [
        {"$match": {"student_id": {"$regex": regex_pattern}, "role": "student"}},
        {"$sort": {"student_id": -1}},
        {"$limit": 1},
    ]
    
    cursor = db["users"].aggregate(pipeline)
    results = await cursor.to_list(length=1)

    if results and results[0].get("student_id"):
        last_id = results[0]["student_id"]
        seq = int(last_id[4:]) + 1  # Increment the sequential part
    else:
        seq = 1

    if seq <= 9999:
        return f"{prefix}{seq:04d}"

    # Overflow: generate random unique 8-digit ID
    for _ in range(100):
        random_id = str(random.randint(10000000, 99999999))
        existing = await db["users"].find_one({"student_id": random_id})
        if not existing:
            return random_id

    raise RuntimeError("Could not generate a unique student ID after 100 attempts")
