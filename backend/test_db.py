import asyncio
import sys
import os

from bson import ObjectId

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.mongodb import db

from app.api.routes.students import get_student_attendance_history

async def test():
    db.connect()
    try:
        sid = '69a685205188de5bd119f102'
        user = await db.db['users'].find_one({'_id': ObjectId(sid)})
        print(f"Testing for student: {sid} {user}")
        
        stat = await get_student_attendance_history(sid)
        print(f"Total Sessions: {stat.total_sessions}")
        print(f"Present: {stat.present_count}")
        for s in stat.history:
            print(f"- {s.classroom_name}: {s.attendance_status}")
    finally:
        db.close()

if __name__ == '__main__':
    asyncio.run(test())
