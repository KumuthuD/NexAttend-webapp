
from pymongo import MongoClient
import sys
import os
from dotenv import load_dotenv

# Load .env file
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

print("--- Testing MongoDB Connection ---")

# Get URL from env
mongo_url = os.getenv("MONGODB_URL")
if not mongo_url:
    print("❌ Error: MONGODB_URL not found in .env file")
    sys.exit(1)

# Mask password for display
display_url = mongo_url.split('@')[-1] if '@' in mongo_url else "localhost"
print(f"📡 Connecting to: {display_url}...")

try:
    # Connect to MongoDB
    client = MongoClient(mongo_url, serverSelectionTimeoutMS=8000)
    
    # Trigger a server call to verify connection
    server_info = client.server_info()
    print(f"✅ Successfully connected to MongoDB Atlas!")
    print(f"   Version: {server_info.get('version')}")
    
    # List databases
    dbs = client.list_database_names()
    print(f"📂 Available Databases: {', '.join(dbs)}")
    
    # Create/Check the specific project database
    db_name = os.getenv("DATABASE_NAME", "nexattend_db")
    db = client[db_name]
    collections = db.list_collection_names()
    print(f"👉 '{db_name}' Collections: {collections if collections else '(empty)'}")
    
except Exception as e:
    print(f"❌ Connection Failed: {e}")
    sys.exit(1)
