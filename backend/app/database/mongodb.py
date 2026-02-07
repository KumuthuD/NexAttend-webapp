from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging
import certifi

class Database:
    client: AsyncIOMotorClient = None
    db = None

    def connect(self):
        """Create database connection."""
        try:
            self.client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                tls=False
            )
            self.db = self.client[settings.DATABASE_NAME]
            logging.info("Connected to MongoDB")
        except Exception as e:
            logging.error(f"Could not connect to MongoDB: {e}")
            raise e

    def close(self):
        """Close database connection."""
        if self.client:
            self.client.close()
            logging.info("Closed MongoDB connection")

# Global database instance
db = Database()

async def get_database():
    """Dependency to get database instance."""
    return db.db
