
import sys
import os

print("--- Checking Python Environment ---")
print(f"Python Executable: {sys.executable}")
print(f"Python Version: {sys.version}")

missing_packages = []

def check_import(package_name, import_name=None):
    if import_name is None:
        import_name = package_name
    try:
        __import__(import_name)
        print(f"✅ {package_name} is installed")
        return True
    except ImportError:
        print(f"❌ {package_name} is NOT installed")
        missing_packages.append(package_name)
        return False

# Check AI/Backend Dependencies
check_import("fastapi")
check_import("pymongo")
check_import("opencv-python", "cv2")
check_import("mtcnn")
check_import("deepface")
check_import("dotenv", "dotenv")

print("\n--- Checking MongoDB Connection ---")
try:
    from pymongo import MongoClient
    client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=2000)
    client.server_info() # Trigger connection
    print(f"✅ MongoDB is RUNNING at {client.address}")
except Exception as e:
    print(f"❌ MongoDB Connection FAILED: {e}")

if missing_packages:
    print(f"\n⚠️ Missing Packages: {', '.join(missing_packages)}")
    sys.exit(1)
else:
    print("\n✅ All Backend Dependencies Verified!")
