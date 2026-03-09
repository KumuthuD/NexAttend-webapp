"""
Staging Face Recognition Test
-----------------------------
Final validation of the face recognition pipeline on the staging environment.
This script verifies:
  1. Connection to MongoDB Atlas (cloud database)
  2. Loading registered student embeddings from Atlas
  3. Running the AI pipeline (capture -> detect -> recognize)
  4. Accuracy and performance on "server-ready" configuration

Viraj Jayasiri
Week 04 Day 20
Branch: release/staging-v0.1
"""

import cv2
import sys
import os
import asyncio
import time
import certifi
import numpy as np
from motor.motor_asyncio import AsyncIOMotorClient

# add backend directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.append(backend_dir)

# load environment variables
from dotenv import load_dotenv
load_dotenv(os.path.join(backend_dir, ".env"))

from app.core.config import settings
from app.services.face_detector import FaceDetector
from app.services.ai.face_recognizer import FaceRecognizer
from app.services.ai.image_processor import convert_bgr_to_rgb
from app.services.ai.ai_config import (
    FACE_CROP_PADDING,
    FACE_DETECTION_MIN_CONFIDENCE,
    SIMILARITY_THRESHOLD
)

async def test_staging_pipeline():
    """
    Main staging test flow
    """
    print("\n" + "="*60)
    print("NEXATTEND - STAGING FACE RECOGNITION TEST")
    print("Viraj Jayasiri - Day 20")
    print("="*60)

    # 1. Connect to Staging Database (MongoDB Atlas)
    print(f"\n[1/4] Connecting to cloud database: {settings.DATABASE_NAME}")
    try:
        client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            tls=True,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=5000
        )
        db = client[settings.DATABASE_NAME]
        await db.command("ping")
        print("Successfully connected to MongoDB Atlas")
    except Exception as e:
        print(f"FAILED: Connection to Atlas: {e}")
        return

    # 2. Fetch Student Embeddings
    print("\n[2/4] Fetching registered students from Atlas...")
    try:
        # fetch users who have a registered face
        cursor = db["users"].find({"has_registered_face": True}, {"full_name": 1, "embedding": 1, "email": 1})
        all_students = await cursor.to_list(length=100)
        
        if not all_students:
            print("WARNING: No registered students found in Atlas. Register someone first for a full test.")
        else:
            print(f"Loaded {len(all_students)} student(s) from cloud database")
    except Exception as e:
        print(f"FAILED: Could not fetch embeddings: {e}")
        client.close()
        return

    # 3. Initialize Staging AI Services
    print("\n[3/4] Initializing AI models (MTCNN & FaceNet)...")
    try:
        # Use classroom-optimized settings for staging check
        detector = FaceDetector(min_face_size=30, min_confidence=FACE_DETECTION_MIN_CONFIDENCE)
        recognizer = FaceRecognizer()
        print("AI services initialized successfully")
    except Exception as e:
        print(f"FAILED: AI initialization: {e}")
        client.close()
        return

    # 4. Capture and Recognize (Live Test)
    print("\n[4/4] Starting live recognition test...")
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("FAILED: Webcam not accessible")
        client.close()
        return

    print("\nInstructions:")
    print(" - Press SPACE to capture your face and test recognition")
    print(" - Press Q to quit")

    while True:
        ret, frame = cap.read()
        if not ret: break

        display = frame.copy()
        cv2.putText(display, "STAGING TEST READY", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(display, "SPACE = RECOGNIZE  Q = QUIT", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)
        
        cv2.imshow("Staging AI Test", display)
        key = cv2.waitKey(1) & 0xFF

        if key == ord(' '):
            print("\nCapturing frame and running pipeline...")
            start_time = time.time()
            
            # Step A: Detection
            face = detector.get_largest_face(frame)
            if not face:
                print("No face detected. Try again.")
                continue

            # Step B: Preprocessing & Embedding
            x, y, w, h = face['box']
            pad = int(w * FACE_CROP_PADDING)
            x1, y1 = max(0, x - pad), max(0, y - pad)
            x2, y2 = min(frame.shape[1], x + w + pad), min(frame.shape[0], y + h + pad)
            face_crop = frame[y1:y2, x1:x2]
            
            rgb_face = convert_bgr_to_rgb(face_crop)
            query_embedding = recognizer.get_embedding(rgb_face)
            
            # Step C: Recognition (matching against cloud data)
            best_match = None
            max_similarity = 0.0

            for student in all_students:
                sim = recognizer.compare_embeddings(query_embedding, student["embedding"])
                if sim > SIMILARITY_THRESHOLD and sim > max_similarity:
                    max_similarity = sim
                    best_match = student

            process_time = (time.time() - start_time) * 1000
            print(f"Pipeline completed in {process_time:.2f}ms")

            # Final Report for this capture
            print("-" * 40)
            if best_match:
                print(f"RESULT: MATCH FOUND")
                print(f"Student: {best_match.get('full_name')}")
                print(f"Email:   {best_match.get('email')}")
                print(f"Similarity: {max_similarity:.4f}")
            else:
                print("RESULT: NO MATCH (Unknown Student)")
            print("-" * 40)

        elif key == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    client.close()
    
    print("\nStaging test session ended.")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(test_staging_pipeline())
