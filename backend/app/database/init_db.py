"""
Database Initialization Script
Creates collections and indexes for NexAttend
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import IndexModel, ASCENDING
import os
import sys

# Add parent directories to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from app.core.config import settings

# Collections to create
COLLECTIONS = [
    "users",
    "students", 
    "classrooms",
    "attendance",
    "face_embeddings"
]

# Index definitions
INDEXES = {
    "users": [
        IndexModel([("email", ASCENDING)], unique=True),
    ],
    "students": [
        IndexModel([("email", ASCENDING)], unique=True),
        IndexModel([("roll_number", ASCENDING)], unique=True),
        IndexModel([("classroom_id", ASCENDING)]),
    ],
    "classrooms": [
        IndexModel([("course_code", ASCENDING)], unique=True),
        IndexModel([("teacher_id", ASCENDING)]),
    ],
    "attendance": [
        IndexModel([("classroom_id", ASCENDING), ("date", ASCENDING)]),
        IndexModel([("student_id", ASCENDING)]),
    ],
    "face_embeddings": [
        IndexModel([("student_id", ASCENDING)], unique=True),
    ]
}


async def init_database():
    """Initialize database with collections and indexes."""
    print("=" * 50)
    print("NexAttend Database Initialization")
    print("=" * 50)
    
    # Connect to MongoDB
    print(f"\nConnecting to MongoDB...")
    # Hide sensitive info if any (though currently simple local URL)
    safe_url = settings.MONGODB_URL.split('@')[-1] if '@' in settings.MONGODB_URL else settings.MONGODB_URL
    print(f"URL: {safe_url}")
    print(f"Database: {settings.DATABASE_NAME}")
    
    try:
        client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            tls=True,
            tlsAllowInvalidCertificates=True
        )
        
        # Test connection
        await client.admin.command('ping')
        print("✅ Connected to MongoDB successfully!")
        
        db = client[settings.DATABASE_NAME]
        
        # Get existing collections
        existing_collections = await db.list_collection_names()
        print(f"\nExisting collections: {existing_collections}")
        
        # Create collections
        print("\n--- Creating Collections ---")
        for collection_name in COLLECTIONS:
            if collection_name not in existing_collections:
                await db.create_collection(collection_name)
                print(f"✅ Created collection: {collection_name}")
            else:
                print(f"⏭️  Collection already exists: {collection_name}")
        
        # Create indexes
        print("\n--- Creating Indexes ---")
        for collection_name, indexes in INDEXES.items():
            collection = db[collection_name]
            try:
                await collection.create_indexes(indexes)
                print(f"✅ Created indexes for: {collection_name}")
            except Exception as e:
                print(f"⚠️  Index error for {collection_name}: {e}")
        
        # Verify setup
        print("\n--- Verification ---")
        final_collections = await db.list_collection_names()
        print(f"Final collections: {final_collections}")
        
        for collection_name in COLLECTIONS:
            collection = db[collection_name]
            index_info = await collection.index_information()
            print(f"  {collection_name}: {len(index_info)} indexes")
        
        print("\n" + "=" * 50)
        print("✅ Database initialization complete!")
        print("=" * 50)
        
        client.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        raise e


if __name__ == "__main__":
    try:
        asyncio.run(init_database())
    except KeyboardInterrupt:
        print("\n❌ Initialization interrupted.")
    except Exception as e:
        print(f"\n❌ Initialization failed with error: {e}")
