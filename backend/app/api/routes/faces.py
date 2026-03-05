"""
Face Management Routes
Handles face registration, detection, and recognition.

Kumuthu Dahanayake
Week 02 Day 8 — Registration & Detection
Week 03 Day 13 — Single Recognition Pipeline
Week 03 Day 14 — Multi-Face Recognition with Batch Attendance
Viraj Jayasiri - Week 04 Day 16 (Low-light optimization)
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, status, BackgroundTasks
from app.services.anomaly_service import check_anomaly
from app.api.deps import get_current_user
from app.models.user import User
from app.services.face_detector import FaceDetector
from app.services.embedding_service import embedding_service
from app.services.lighting_optimizer import lighting_optimizer
from app.services.email_service import email_service
from app.database.mongodb import db
import numpy as np
import cv2
import logging
import time
from datetime import datetime
from bson import ObjectId
from typing import Optional

router = APIRouter()
logger = logging.getLogger(__name__)

# Registration detector — strict threshold for high quality face registration
detector = FaceDetector(min_face_size=50, min_confidence=0.95)

# Classroom detector — relaxed threshold for multi-face recognition at distance
# Lower confidence (0.80) catches faces at angles and further away
# Smaller min_face_size (30) detects students sitting at the back
classroom_detector = FaceDetector(min_face_size=30, min_confidence=0.80)

@router.post("/register", status_code=status.HTTP_200_OK)
async def register_face(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Register a face for the currently authenticated user.
    
    1. Validates the uploaded image.
    2. Detects exactly one face.
    3. Generates embedding.
    4. Saves embedding to the user's profile in MongoDB.
    """
    #Validate File Type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    #Read Image
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Could not decode image")
    except Exception as e:
        logger.error(f"Error reading file: {e}")
        raise HTTPException(status_code=400, detail="Invalid image file")

    #Detect Face
    #We want exactly ONE face for strict registration
    faces = detector.detect_faces(image)
    
    if len(faces) == 0:
        raise HTTPException(status_code=400, detail="No face detected in the image. Please ensure good lighting and face camera directly.")
    
    if len(faces) > 1:
        # If multiple, maybe pick the largest? But for registration, strict is better (security).
        # Let's check if the primary face is significantly larger/central?
        # For now, reject to be safe.
        raise HTTPException(status_code=400, detail="Multiple faces detected. Please ensure only you are in the photo.")

    #Generate Embedding
    target_face = faces[0]
    
    #Optional: Check face quality/blurriness here? (Detector has some checks)
    
    #Crop the face (with padding)
    x, y, w, h = target_face['box']
    
    #Basic bounds check for cropping
    h_img, w_img = image.shape[:2]
    #Add minimal padding for embedding generation stability
    pad = int(w * 0.1)
    x1, y1 = max(0, x - pad), max(0, y - pad)
    x2, y2 = min(w_img, x + w + pad), min(h_img, y + h + pad)
    
    face_crop = image[y1:y2, x1:x2]
    
    # enhance face crop for better embedding in low-light
    face_crop = lighting_optimizer.enhance_image(face_crop, auto_mode=True)
    
    embedding = embedding_service.generate_embedding(face_crop)
    
    if not embedding:
        raise HTTPException(status_code=500, detail="Failed to generate face embedding. Please try again.")

    #Save to Database
    try:
        # Update the user document with the new embedding
        result = await db.db["users"].update_one(
            {"_id": ObjectId(current_user.id)},
            {"$set": {"embedding": embedding, "has_registered_face": True}}
        )
        
        if result.modified_count == 0:
            logger.warning(f"User {current_user.id} embedding update failed (might be same data)")
            
        logger.info(f"Registered face for user {current_user.email} ({current_user.id})")
        
        return {
            "message": "Face registered successfully",
            "user_id": str(current_user.id)
        }

    except Exception as e:
        logger.error(f"Database update error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error saving registration")


@router.post("/detect", status_code=status.HTTP_200_OK)
async def detect_faces_only(
    file: UploadFile = File(...)
):
    """
    detect faces in an image and return bounding boxes.
    used by frontend to draw real-time overlays on webcam feed.

    Kumuthu Dahanayake - Week 03 Day 12
    """
#validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

#read and decode image
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            raise HTTPException(status_code=400, detail="Could not decode image")
    except Exception as e:
        logger.error(f"Error reading file: {e}")
        raise HTTPException(status_code=400, detail="Invalid image file")

    #detect faces using MTCNN
    faces = detector.detect_faces(image)

#convert numpy types to native Python types for JSON serialization
    faces_data = []
    for face in faces:
        box = [int(coord) for coord in face['box']]
        conf = float(face['confidence'])
        kps = {k: [int(coord) for coord in v] for k, v in face['keypoints'].items()}

        faces_data.append({
            "box": box,
            "confidence": conf,
            "keypoints": kps
        })

    return {
        "count": len(faces_data),
        "faces": faces_data
    }


@router.post("/recognize", status_code=status.HTTP_200_OK)
async def recognize_faces(
    file: UploadFile = File(...),
    classroom_id: str = None
):
    """
    Recognize faces in an image and return identified students.

    system takes an image (webcam frame), detects all faces,
    generates embeddings, and matches against registered users in our mongoDB.
    also optionally filters by classroom_id.

    Kumuthu Dahanayake - Week 03 Day 13
    """
#validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    #read and decode image
    try:
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty file received")

        logger.info(f"Processing image: {file.filename}, size: {len(contents)} bytes")

        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            raise HTTPException(status_code=400, detail="Could not decode image")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reading file: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")

    # use classroom_detector here — registration detector (95%) is too strict
    # it was filtering out valid student faces during attendance
    faces = classroom_detector.detect_faces(image)

    if not faces:
        return {"count": 0, "matched_count": 0, "results": [], "message": "No faces detected"}

#load registered users ONCE (outside the loop - performance fix)
    query = {"has_registered_face": True}
    if classroom_id:
        query["classroom_id"] = classroom_id

    all_users = await db.db["users"].find(query).to_list(1000)

    if not all_users:
        return {
            "count": len(faces),
            "matched_count": 0,
            "results": [],
            "message": "No registered users to compare against"
        }

#process each detected face
    results = []
    for face in faces:
        try:
        #crop face with 15% padding for better embedding accuracy
            x, y, w, h = face['box']
            h_img, w_img = image.shape[:2]
            pad = int(w * 0.15)
            x1, y1 = max(0, x - pad), max(0, y - pad)
            x2, y2 = min(w_img, x + w + pad), min(h_img, y + h + pad)

            face_crop = image[y1:y2, x1:x2]
            
            # enhance face crop for better embedding quality
            face_crop = lighting_optimizer.enhance_image(face_crop, auto_mode=True)

    #generate embedding for the detected face
            embedding = embedding_service.generate_embedding(face_crop)

            if not embedding:
                logger.warning("Failed to generate embedding for a detected face")
                results.append({
                    "box": [int(c) for c in face['box']],
                    "detection_confidence": float(face['confidence']),
                    "matched": False,
                    "student": None,
                    "similarity": 0.0,
                    "status": "embedding_failed"
                })
                continue

#use embedding_service.identify_user for matching (proper service layer)
            best_user, distance = embedding_service.identify_user(embedding, all_users)

    #convert distance to confidence (lower distance = higher confidence)
            confidence = round(max(0.0, 1.0 - distance), 4)
            anomaly = check_anomaly(confidence, str(best_user["_id"]) if best_user else None)

            if best_user:
                results.append({
                    "box": [int(c) for c in face['box']],
                    "detection_confidence": float(face['confidence']),
                    "matched": True,
                    "student": {
                        "id": str(best_user["_id"]),
                        "full_name": best_user.get("full_name", "Unknown"),
                        "email": best_user.get("email", ""),
                        "email_notifications": best_user.get("email_notifications", True)
                    },
                    "similarity": confidence,
                    "is_flagged": anomaly["is_flagged"],
                    "flag_reason": anomaly["flag_reason"],
                    "status": "identified"
                })
            else:
                results.append({
                    "box": [int(c) for c in face['box']],
                    "detection_confidence": float(face['confidence']),
                    "matched": False,
                    "student": None,
                    "similarity": confidence,
                    "is_flagged": anomaly["is_flagged"],
                    "flag_reason": anomaly["flag_reason"],
                    "status": "unknown"
                })

        except Exception as e:
            logger.error(f"Error processing face: {e}")
            continue

#summary
    matched_count = sum(1 for r in results if r["matched"])
    logger.info(f"Recognition complete: {len(results)} faces, {matched_count} matched")

    return {
        "count": len(results),
        "matched_count": matched_count,
        "results": results
    }


@router.post("/recognize-multi", status_code=status.HTTP_200_OK)
async def recognize_multi_faces(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    classroom_id: Optional[str] = Form(None),
    session_id: Optional[str] = Form(None)
):
    """
    Multi-face recognition optimized for classroom attendance.

    Uses a relaxed detector (80% confidence, 30px min) to catch faces
    at distance and angles. Applies NMS to remove duplicate detections.
    If session_id is provided, auto-marks attendance for all recognized students.

    Kumuthu Dahanayake - Week 03 Day 14
    """
    start_time = time.time()

    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Read and decode image
    try:
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty file received")

        logger.info(f"[Multi-Face] Processing: {file.filename}, size: {len(contents)} bytes")

        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            raise HTTPException(status_code=400, detail="Could not decode image")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reading file: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")

    # Detect faces using classroom-optimized detector (lower confidence for distance)
    t1 = time.time()
    raw_faces = classroom_detector.detect_faces(image)
    t2 = time.time()
    logger.info(f"[Multi-Face] Detection took: {(t2-t1)*1000:.2f}ms")

    if not raw_faces:
        processing_time = round((time.time() - start_time) * 1000, 2)
        return {
            "count": 0,
            "matched_count": 0,
            "attendance_marked": False,
            "processing_time_ms": processing_time,
            "results": [],
            "message": "No faces detected"
        }

    # Remove overlapping duplicate detections (NMS)
    # keep only the best box for each face
    faces = classroom_detector.filter_overlapping_faces(raw_faces, overlap_threshold=0.5)
    logger.info(f"[Multi-Face] Detected {len(raw_faces)} raw → {len(faces)} after NMS")

    # Load registered users ONCE
    query = {"has_registered_face": True}
    all_users = await db.db["users"].find(query).to_list(1000)

    if not all_users:
        processing_time = round((time.time() - start_time) * 1000, 2)
        return {
            "count": len(faces),
            "matched_count": 0,
            "attendance_marked": False,
            "processing_time_ms": processing_time,
            "results": [],
            "message": "No registered users to compare against"
        }

    # Crop all faces using the detector's built-in method (15% padding)
    face_crops = classroom_detector.crop_faces(image, faces, padding=0.15)

    # Process each detected face
    results = []
    matched_student_ids = []

    for i, (face, face_crop) in enumerate(zip(faces, face_crops)):
        try:
            # Validate face quality
            is_valid, quality_msg = classroom_detector.validate_face_quality(face_crop)

            if not is_valid:
                results.append({ "status": "low_quality", "matched": False, "box": [int(c) for c in face['box']], "detection_confidence": float(face['confidence']), "similarity": 0.0 })
                continue

            # Generate embedding
            t_emb_start = time.time()
            embedding = embedding_service.generate_embedding(face_crop)
            t_emb_end = time.time()
            logger.info(f"[Multi-Face] Embedding #{i+1} took: {(t_emb_end-t_emb_start)*1000:.2f}ms")
            
            if not embedding:
                 # ... existing error handling ...
                results.append({ "status": "embedding_failed", "matched": False, "box": [int(c) for c in face['box']], "detection_confidence": float(face['confidence']), "similarity": 0.0 })
                continue

            # Match the face embedding against all registered students
            best_user, distance = embedding_service.identify_user(embedding, all_users)

            # ... rest of loop logic (unchanged structure, just showing log insertion)
            # Copied original logic below to be safe with replacement
            
            # Convert distance to similarity (lower distance = higher similarity)
            similarity = round(max(0.0, 1.0 - distance), 4)

            if best_user:
                student_id = str(best_user["_id"])

                # Prevent same student from being matched twice in one frame
                if student_id in matched_student_ids:
                    results.append({
                        "box": [int(c) for c in face['box']],
                        "detection_confidence": float(face['confidence']),
                        "matched": False,
                        "student": None,
                        "similarity": similarity,
                        "status": "duplicate_match",
                        "attendance": "skipped"
                    })
                    continue

                matched_student_ids.append(student_id)
                anomaly = check_anomaly(similarity, student_id)
                results.append({
                    "box": [int(c) for c in face['box']],
                    "detection_confidence": float(face['confidence']),
                    "matched": True,
                    "student": {
                        "id": student_id,
                        "full_name": best_user.get("full_name", "Unknown"),
                        "email": best_user.get("email", ""),
                        "email_notifications": best_user.get("email_notifications", True)
                    },
                    "similarity": similarity,
                    "is_flagged": anomaly["is_flagged"],
                    "flag_reason": anomaly["flag_reason"],
                    "status": "identified",
                    "attendance": "pending"
                })
            else:
                anomaly = check_anomaly(similarity, "Unknown")
                results.append({
                    "box": [int(c) for c in face['box']],
                    "detection_confidence": float(face['confidence']),
                    "matched": False,
                    "student": None,
                    "similarity": similarity,
                    "is_flagged": anomaly["is_flagged"],
                    "flag_reason": anomaly["flag_reason"],
                    "status": "unknown",
                    "attendance": "skipped"
                })

        except Exception as e:
            logger.error(f"[Multi-Face] Error processing face #{i+1}: {e}")
            continue

    # Batch attendance marking (if session_id is provided)
    attendance_marked = False
    if session_id and matched_student_ids:
        try:
            # Verify session exists and is active
            # session_id from form is a plain string — must cast to ObjectId for MongoDB
            try:
                session_oid = ObjectId(session_id)
            except Exception:
                logger.warning(f"[Multi-Face] Invalid session_id format: {session_id}")
                session_oid = session_id

            session = await db.db["attendance_sessions"].find_one({
                "_id": session_oid,
                "status": "active"
            })

            if session:
                # Fetch classroom name for the email
                classroom_name = "Your Classroom"
                if session.get("classroom_id"):
                    try:
                        cid = session["classroom_id"]
                        cid_obj = ObjectId(cid) if isinstance(cid, str) and len(cid) == 24 else cid
                        classroom = await db.db["classrooms"].find_one({"_id": cid_obj})
                        if classroom:
                            classroom_name = classroom.get("course_name", classroom.get("name", "Your Classroom"))
                    except Exception as e:
                        logger.warning(f"[Multi-Face] Could not fetch classroom: {e}")

                # Get already-present students to avoid duplicates
                already_present = set(session.get("present_student_ids", []))

                # Build batch records for new students only
                new_records = []
                new_student_ids = []

                for result in results:
                    if result.get("matched") and result["attendance"] == "pending":
                        sid = result["student"]["id"]

                        if sid in already_present:
                            result["attendance"] = "already_marked"
                            logger.debug(f"[Multi-Face] {sid} already marked present")
                        else:
                            new_records.append({
                                "student_id": sid,
                                "status": "present",
                                "confidence": result["similarity"],
                                "is_flagged": result.get("is_flagged", False),
                                "flag_reason": result.get("flag_reason"),
                                "method": "face_recognition",
                                "timestamp": datetime.utcnow()
                            })
                            new_student_ids.append(sid)
                            result["attendance"] = "marked"
                            
                            # Queue email
                            if result.get("student") and result["student"].get("email") and result["student"].get("email_notifications", True):
                                background_tasks.add_task(
                                    email_service.send_attendance_confirmation,
                                    result["student"]["email"],
                                    result["student"].get("full_name", "Student"),
                                    classroom_name,
                                    datetime.utcnow()
                                )

                # Single atomic DB update for all new students
                if new_records:
                    await db.db["attendance_sessions"].update_one(
                        {"_id": session_oid},
                        {
                            "$push": {"records": {"$each": new_records}},
                            "$addToSet": {"present_student_ids": {"$each": new_student_ids}}
                        }
                    )
                    attendance_marked = True
                    logger.info(f"[Multi-Face] Batch marked {len(new_records)} students present")
            else:
                logger.warning(f"[Multi-Face] Session {session_id} not found or inactive")
                # Mark all as skipped
                for result in results:
                    if result.get("attendance") == "pending":
                        result["attendance"] = "session_not_found"

        except Exception as e:
            logger.error(f"[Multi-Face] Batch attendance error: {e}")
            for result in results:
                if result.get("attendance") == "pending":
                    result["attendance"] = "error"
    else:
        # No session_id provided — mark pending as skipped
        for result in results:
            if result.get("attendance") == "pending":
                result["attendance"] = "no_session"

    # Calculate summary
    processing_time = round((time.time() - start_time) * 1000, 2)
    matched_count = sum(1 for r in results if r["matched"])

    logger.info(
        f"[Multi-Face] Done: {len(results)} faces, {matched_count} matched, "
        f"{processing_time}ms, attendance_marked={attendance_marked}"
    )

    return {
        "count": len(results),
        "matched_count": matched_count,
        "attendance_marked": attendance_marked,
        "processing_time_ms": processing_time,
        "results": results
    }
