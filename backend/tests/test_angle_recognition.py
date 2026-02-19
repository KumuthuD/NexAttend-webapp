"""
Angle Recognition Test
----------------------
Test face recognition accuracy at different head angles.
Angles tested: front, slight side (30 deg), full side (90 deg)

Viraj Jayasiri
Week 04 Day 17
Branch: feature/ai/angle-testing
"""

import cv2
import sys
import os
import time

# add backend directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.append(backend_dir)

from app.services.face_detector import FaceDetector
from app.services.ai.face_recognizer import FaceRecognizer
from app.services.ai.image_processor import convert_bgr_to_rgb

# folder to save captured test images
SAVE_DIR = os.path.join(backend_dir, "test_angle_results")
if not os.path.exists(SAVE_DIR):
    os.makedirs(SAVE_DIR)

# angles to test
ANGLE_LABELS = ["front", "slight_side", "full_side"]

# how many test captures per angle
CAPTURES_PER_ANGLE = 3


def capture_image_from_webcam(label, camera_index=0):
    """
    open webcam and let user press SPACE to capture a frame
    press Q to quit early
    returns the captured frame or None
    """
    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        print("Error: could not open webcam")
        return None

    print(f"\nCapturing: {label}")
    print("Press SPACE to capture, Q to quit...")

    frame_to_return = None

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: failed to read frame")
            break

        # show instruction on frame
        display = frame.copy()
        cv2.putText(display, f"Angle: {label}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        cv2.putText(display, "SPACE=Capture  Q=Quit", (10, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)

        cv2.imshow("Capture", display)

        key = cv2.waitKey(1) & 0xFF
        if key == ord(' '):
            frame_to_return = frame.copy()
            print("Captured!")
            break
        elif key == ord('q'):
            print("Quit by user")
            break

    cap.release()
    cv2.destroyAllWindows()
    return frame_to_return


def register_face(detector, recognizer, student_id):
    """
    capture one frontal image to register the student
    returns the embedding or None if failed
    """
    print("\n" + "=" * 50)
    print(f"REGISTRATION: {student_id}")
    print("Look straight at the camera (front angle)")
    print("=" * 50)

    frame = capture_image_from_webcam("front_register")
    if frame is None:
        return None

    # save the registration image
    reg_path = os.path.join(SAVE_DIR, f"{student_id}_register.jpg")
    cv2.imwrite(reg_path, frame)

    # detect face
    face = detector.get_largest_face(frame)
    if face is None:
        print("No face detected in registration image")
        return None

    # crop face with padding
    x, y, w, h = face['box']
    pad_x = int(w * 0.2)
    pad_y = int(h * 0.2)
    x1 = max(0, x - pad_x)
    y1 = max(0, y - pad_y)
    x2 = min(frame.shape[1], x + w + pad_x)
    y2 = min(frame.shape[0], y + h + pad_y)
    cropped = frame[y1:y2, x1:x2]

    if cropped.size == 0:
        print("Crop failed")
        return None

    # convert to RGB and get embedding
    try:
        rgb_face = convert_bgr_to_rgb(cropped)
        embedding = recognizer.get_embedding(rgb_face)
        print(f"Registration successful - embedding size: {len(embedding)}")
        return embedding
    except Exception as e:
        print(f"Error generating registration embedding: {e}")
        return None


def test_angle(detector, recognizer, stored_embedding, student_id, angle_label, capture_num):
    """
    capture one image at a specific angle, detect face, generate embedding,
    compare with stored embedding and return result dict
    """
    print(f"\n  Capture {capture_num + 1}/{CAPTURES_PER_ANGLE} - angle: {angle_label}")

    frame = capture_image_from_webcam(angle_label)
    if frame is None:
        return {"angle": angle_label, "capture": capture_num + 1,
                "detected": False, "similarity": None, "matched": False, "note": "no frame"}

    # save test image
    img_name = f"{student_id}_{angle_label}_{capture_num + 1}.jpg"
    cv2.imwrite(os.path.join(SAVE_DIR, img_name), frame)

    # detect face
    face = detector.get_largest_face(frame)
    if face is None:
        print("  No face detected")
        return {"angle": angle_label, "capture": capture_num + 1,
                "detected": False, "similarity": None, "matched": False, "note": "no face"}

    detection_conf = face['confidence']
    print(f"  Detection confidence: {detection_conf:.4f}")

    # crop face
    x, y, w, h = face['box']
    pad_x = int(w * 0.2)
    pad_y = int(h * 0.2)
    x1 = max(0, x - pad_x)
    y1 = max(0, y - pad_y)
    x2 = min(frame.shape[1], x + w + pad_x)
    y2 = min(frame.shape[0], y + h + pad_y)
    cropped = frame[y1:y2, x1:x2]

    if cropped.size == 0:
        return {"angle": angle_label, "capture": capture_num + 1,
                "detected": True, "similarity": None, "matched": False, "note": "crop failed"}

    # generate embedding and compare
    try:
        rgb_face = convert_bgr_to_rgb(cropped)
        test_embedding = recognizer.get_embedding(rgb_face)
        similarity = recognizer.compare_embeddings(stored_embedding, test_embedding)
        matched = similarity >= recognizer.threshold

        print(f"  Similarity: {similarity:.4f} | {'MATCH' if matched else 'NO MATCH'}")

        return {
            "angle": angle_label,
            "capture": capture_num + 1,
            "detected": True,
            "similarity": round(similarity, 4),
            "matched": matched,
            "detection_conf": round(detection_conf, 4),
            "note": ""
        }

    except Exception as e:
        print(f"  Error: {e}")
        return {"angle": angle_label, "capture": capture_num + 1,
                "detected": True, "similarity": None, "matched": False, "note": str(e)}


def print_report(student_id, results):
    """
    print a clean accuracy report broken down by angle
    """
    print("\n")
    print("*" * 60)
    print("ANGLE RECOGNITION TEST REPORT - DAY 17")
    print(f"Student ID: {student_id}")
    print("*" * 60)

    # group results by angle
    by_angle = {}
    for r in results:
        angle = r["angle"]
        if angle not in by_angle:
            by_angle[angle] = []
        by_angle[angle].append(r)

    total_captures = 0
    total_detected = 0
    total_matched = 0

    for angle in ANGLE_LABELS:
        angle_results = by_angle.get(angle, [])
        if not angle_results:
            continue

        detected = sum(1 for r in angle_results if r["detected"])
        matched = sum(1 for r in angle_results if r["matched"])
        captures = len(angle_results)

        # average similarity for detected faces
        sims = [r["similarity"] for r in angle_results if r["similarity"] is not None]
        avg_sim = sum(sims) / len(sims) if sims else 0.0

        print(f"\nAngle: {angle.upper()}")
        print(f"  Captures:  {captures}")
        print(f"  Detected:  {detected}/{captures}")
        print(f"  Matched:   {matched}/{captures}")
        print(f"  Avg Similarity: {avg_sim:.4f}")

        # show each capture result
        for r in angle_results:
            sim_str = f"{r['similarity']:.4f}" if r["similarity"] is not None else "N/A"
            status = "MATCH" if r["matched"] else ("NO FACE" if not r["detected"] else "NO MATCH")
            print(f"    Capture {r['capture']}: sim={sim_str}  [{status}]")

        total_captures += captures
        total_detected += detected
        total_matched += matched

    # overall summary
    detection_rate = (total_detected / total_captures * 100) if total_captures > 0 else 0
    match_rate = (total_matched / total_captures * 100) if total_captures > 0 else 0

    print("\n" + "-" * 60)
    print("OVERALL SUMMARY")
    print("-" * 60)
    print(f"Total Captures:  {total_captures}")
    print(f"Detection Rate:  {total_detected}/{total_captures} ({detection_rate:.1f}%)")
    print(f"Match Rate:      {total_matched}/{total_captures} ({match_rate:.1f}%)")
    print("")

    if match_rate >= 80:
        print("STATUS: PASS - Accuracy is good across angles")
    elif match_rate >= 60:
        print("STATUS: PARTIALLY PASSED - Acceptable for non-frontal angles")
    else:
        print("STATUS: NEEDS IMPROVEMENT - Review lighting and angle range")

    print("*" * 60)
    print(f"\nTest images saved to: {SAVE_DIR}")
    print("*" * 60)
    print("\n")


def run_angle_test():
    """
    main test function
    1. initialize services
    2. register one student (frontal)
    3. test each angle multiple times
    4. print report
    """
    print("\n")
    print("*" * 60)
    print("ANGLE RECOGNITION TEST - NexAttend")
    print("Viraj Jayasiri - Week 04 Day 17")
    print("Branch: feature/ai/angle-testing")
    print("*" * 60)

    # initialize detector and recognizer
    print("\nInitializing face detector and recognizer...")
    try:
        detector = FaceDetector(min_confidence=0.85)
        recognizer = FaceRecognizer()
        print("Services ready")
    except Exception as e:
        print(f"Error initializing services: {e}")
        sys.exit(1)

    # get student ID
    student_id = input("\nEnter student ID for testing (e.g. student_001): ").strip()
    if not student_id:
        student_id = "student_001"
        print(f"Using default: {student_id}")

    # registration phase - frontal image
    print("\nPhase 1: Registration (frontal face)")
    stored_embedding = register_face(detector, recognizer, student_id)
    if stored_embedding is None:
        print("Registration failed. Exiting.")
        sys.exit(1)

    print(f"\nRegistration done. Now testing {len(ANGLE_LABELS)} angles.")
    print(f"Captures per angle: {CAPTURES_PER_ANGLE}")
    print("\nAngles:")
    print("  front       - look straight at camera")
    print("  slight_side - turn head about 30 degrees to the side")
    print("  full_side   - turn head about 90 degrees (profile view)")
    input("\nPress ENTER to start angle testing...")

    # testing phase
    all_results = []
    for angle_label in ANGLE_LABELS:
        print("\n" + "=" * 50)
        print(f"TESTING ANGLE: {angle_label.upper()}")

        if angle_label == "front":
            print("Look straight at the camera")
        elif angle_label == "slight_side":
            print("Turn your head slightly to the side (about 30 degrees)")
        elif angle_label == "full_side":
            print("Turn your head fully to the side (profile view, about 90 degrees)")

        print("=" * 50)
        input("Press ENTER when ready for this angle...")

        for cap_num in range(CAPTURES_PER_ANGLE):
            result = test_angle(detector, recognizer, stored_embedding,
                                student_id, angle_label, cap_num)
            all_results.append(result)
            time.sleep(0.5)

    # print final report
    print_report(student_id, all_results)

    return all_results


if __name__ == "__main__":
    run_angle_test()
