
"""
FaceDetector Class Test
Validates the FaceDetector service class with live webcam feed.

Kumuthu Dahanayake
Week 01 Day 4
"""

import cv2
import sys
import os

# Add backend directory to path so we can import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

from app.services.face_detector import FaceDetector

def test_detector_class():
    print("--- Testing FaceDetector Class ---")
    
    # Initialize
    try:
        print("Initializing FaceDetector...")
        detector = FaceDetector()
    except Exception as e:
        print(f"Failed to init: {e}")
        return

    # Open Camera
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: No webcam found.")
        return

    print(" Camera Opened. Press 'q' to quit.")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Run detection
        faces = detector.detect_faces(frame)

        # Draw results
        annotated_frame = detector.draw_faces(frame, faces)

        # Show
        cv2.imshow("NexAttend - FaceDetector Class Test", annotated_frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    print("Test finished.")

if __name__ == "__main__":
    test_detector_class()
