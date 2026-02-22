"""
Cloud DB AI Test
----------------
Test the AI face recognition pipeline with MongoDB Atlas (cloud DB).

What this does:
  1. Connect to MongoDB Atlas using the same connection used in production
  2. Fetch all stored face embeddings from the cloud collection
  3. Capture a live webcam frame
  4. Run the full AI pipeline: detect -> crop -> embed -> match
  5. Print results - confirm AI works against cloud data

Viraj Jayasiri
Week 04 Day 19
Branch: feature/ai/cloud-testing
"""

import cv2
import sys
import os
import asyncio
import time

# add backend directory to path so imports work
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.append(backend_dir)

# load .env before importing settings
from dotenv import load_dotenv
load_dotenv(os.path.join(backend_dir, ".env"))

from motor.motor_asyncio import AsyncIOMotorClient
import certifi
from app.core.config import settings
from app.services.face_detector import FaceDetector
from app.services.ai.face_recognizer import FaceRecognizer
from app.services.ai.image_processor import convert_bgr_to_rgb
from app.services.ai.ai_config import (
    FACE_CROP_PADDING,
    FACE_DETECTION_MIN_CONFIDENCE,
    SIMILARITY_THRESHOLD
)


# collection name where face embeddings are stored
EMBEDDINGS_COLLECTION = "face_embeddings"


async def connect_to_cloud_db():
    """
    connect to MongoDB Atlas and return the database object
    uses the same URL and TLS settings as production (from .env)
    """
    print(f"Connecting to: {settings.DATABASE_NAME} on Atlas...")

    try:
        client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            tls=settings.MONGODB_TLS,
            tlsCAFile=certifi.where() if settings.MONGODB_TLS else None,
            serverSelectionTimeoutMS=10000  # 10 second timeout
        )
        db = client[settings.DATABASE_NAME]

        # ping to confirm the connection actually works
        await db.command("ping")
        print("Connected to MongoDB Atlas successfully")
        return client, db

    except Exception as e:
        print(f"Connection failed: {e}")
        return None, None


async def fetch_embeddings_from_cloud(db):
    """
    pull all face embedding documents from the cloud collection
    returns a list of dicts with student_id and embedding
    """
    collection = db[EMBEDDINGS_COLLECTION]

    docs = []
    async for doc in collection.find({}, {"student_id": 1, "embedding": 1, "_id": 0}):
        # only keep docs that actually have an embedding
        if "student_id" in doc and "embedding" in doc and len(doc["embedding"]) > 0:
            docs.append({
                "student_id": doc["student_id"],
                "embedding": doc["embedding"]
            })

    print(f"Fetched {len(docs)} embedding(s) from Atlas")
    return docs


def capture_test_frame(camera_index=0):
    """
    open webcam and let user press SPACE to capture a frame
    press Q to quit
    returns the captured BGR frame or None
    """
    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        print("Error: could not open webcam")
        return None

    print("\nWebcam ready. Press SPACE to capture your face, Q to quit.")

    frame_captured = None

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: failed to read frame from webcam")
            break

        # show live feed with instructions
        display = frame.copy()
        cv2.putText(display, "Cloud DB AI Test", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        cv2.putText(display, "SPACE=Capture  Q=Quit", (10, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)

        cv2.imshow("NexAttend Cloud Test", display)

        key = cv2.waitKey(1) & 0xFF
        if key == ord(' '):
            frame_captured = frame.copy()
            print("Frame captured")
            break
        elif key == ord('q'):
            print("Quit by user")
            break

    cap.release()
    cv2.destroyAllWindows()
    return frame_captured


def run_recognition_pipeline(frame, stored_embeddings, detector, recognizer):
    """
    run the full AI pipeline on a single frame:
      detect face -> crop -> generate embedding -> match against cloud embeddings

    returns a dict with the result
    """
    result = {
        "face_detected": False,
        "detection_confidence": None,
        "embedding_generated": False,
        "match_found": False,
        "student_id": None,
        "similarity": None,
        "confidence_pct": None,
        "note": ""
    }

    # step 1: detect the largest face in the frame
    face = detector.get_largest_face(frame)
    if face is None:
        result["note"] = "No face detected in frame"
        return result

    result["face_detected"] = True
    result["detection_confidence"] = round(face["confidence"], 4)
    print(f"Face detected - detection confidence: {face['confidence']:.4f}")

    # step 2: crop the face with padding
    x, y, w, h = face["box"]
    pad_x = int(w * FACE_CROP_PADDING)
    pad_y = int(h * FACE_CROP_PADDING)
    x1 = max(0, x - pad_x)
    y1 = max(0, y - pad_y)
    x2 = min(frame.shape[1], x + w + pad_x)
    y2 = min(frame.shape[0], y + h + pad_y)
    cropped = frame[y1:y2, x1:x2]

    if cropped.size == 0:
        result["note"] = "Face crop failed"
        return result

    # step 3: generate embedding from the cropped face
    try:
        rgb_face = convert_bgr_to_rgb(cropped)
        query_embedding = recognizer.get_embedding(rgb_face)
        result["embedding_generated"] = True
        print(f"Embedding generated - dimensions: {len(query_embedding)}")
    except Exception as e:
        result["note"] = f"Embedding error: {e}"
        return result

    # step 4: compare against all cloud embeddings
    best_match_id = None
    best_similarity = 0.0

    for doc in stored_embeddings:
        sim = recognizer.compare_embeddings(query_embedding, doc["embedding"])

        if sim > SIMILARITY_THRESHOLD and sim > best_similarity:
            best_similarity = sim
            best_match_id = doc["student_id"]

    if best_match_id:
        result["match_found"] = True
        result["student_id"] = best_match_id
        result["similarity"] = round(best_similarity, 4)
        result["confidence_pct"] = round(best_similarity * 100, 2)
        result["note"] = f"Matched student: {best_match_id}"
    else:
        result["note"] = "No match found in cloud embeddings"

    return result


def print_result(result, num_cloud_embeddings):
    """
    print a clean summary of the cloud DB test result
    """
    print("\n")
    print("=" * 55)
    print("CLOUD DB AI TEST RESULT - DAY 19")
    print("=" * 55)
    print(f"Cloud embeddings loaded: {num_cloud_embeddings}")
    print(f"Similarity threshold:    {SIMILARITY_THRESHOLD}")
    print("-" * 55)
    print(f"Face detected:           {result['face_detected']}")
    if result["detection_confidence"]:
        print(f"Detection confidence:    {result['detection_confidence']}")
    print(f"Embedding generated:     {result['embedding_generated']}")
    print(f"Match found:             {result['match_found']}")
    if result["student_id"]:
        print(f"Matched student ID:      {result['student_id']}")
        print(f"Similarity score:        {result['similarity']}")
        print(f"Confidence:              {result['confidence_pct']}%")
    print(f"Note:                    {result['note']}")
    print("-" * 55)

    # overall pass/fail
    if result["face_detected"] and result["embedding_generated"]:
        if result["match_found"]:
            print("STATUS: PASS - AI works with cloud DB, student recognized")
        else:
            print("STATUS: PASS (partial) - AI connected to cloud DB and ran pipeline")
            print("        No match found - register a face in Atlas first to get full match")
    else:
        print("STATUS: FAIL - Pipeline did not complete")

    print("=" * 55)
    print()


async def run_cloud_test():
    """
    main test entry point

    flow:
      1. connect to Atlas
      2. fetch all embeddings
      3. capture webcam frame
      4. run AI pipeline
      5. print result
    """
    print("\n")
    print("=" * 55)
    print("NexAttend - Cloud DB AI Test")
    print("Viraj Jayasiri - Week 04 Day 19")
    print("Branch: feature/ai/cloud-testing")
    print("=" * 55)

    # step 1: connect to Atlas
    client, db = await connect_to_cloud_db()
    if db is None:
        print("Could not connect to cloud DB. Check .env MONGODB_URL.")
        sys.exit(1)

    # step 2: fetch stored embeddings from cloud
    stored_embeddings = await fetch_embeddings_from_cloud(db)

    if len(stored_embeddings) == 0:
        print("\nNo embeddings found in Atlas.")
        print("The pipeline will still run but matching will not find anyone.")
        print("To get a full match test, register at least one student face first.")
    else:
        print("\nCloud embeddings ready. Starting recognition test...")

    # step 3: initialize AI services
    print("\nInitializing detector and recognizer...")
    try:
        detector = FaceDetector(min_confidence=FACE_DETECTION_MIN_CONFIDENCE)
        recognizer = FaceRecognizer()
        print("AI services initialized")
    except Exception as e:
        print(f"Error initializing AI services: {e}")
        client.close()
        sys.exit(1)

    # step 4: capture test frame from webcam
    frame = capture_test_frame()

    if frame is None:
        print("No frame captured. Exiting.")
        client.close()
        sys.exit(1)

    # step 5: run the full pipeline
    print("\nRunning recognition pipeline against cloud embeddings...")
    start_time = time.time()
    result = run_recognition_pipeline(frame, stored_embeddings, detector, recognizer)
    elapsed = time.time() - start_time
    print(f"Pipeline completed in {elapsed:.2f}s")

    # print final report
    print_result(result, len(stored_embeddings))

    # close the DB connection cleanly
    client.close()
    print("MongoDB connection closed")


if __name__ == "__main__":
    asyncio.run(run_cloud_test())
