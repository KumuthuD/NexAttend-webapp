
"""
Recognition Pipeline Test
Integrates Detector and Recognizer for full live pipeline testing.

Kumuthu Dahanayake
Week 01 Day 5
"""

import cv2
import sys
import os
import numpy as np

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from app.services.face_detector import FaceDetector
from app.services.face_recognizer import FaceRecognizer

def test_recognition_pipeline():
    print("--- Testing Face Recognition Pipeline ---")
    
    # Initialize Services
    try:
        print("Initializing FaceDetector...")
        detector = FaceDetector()
        
        print("Initializing FaceRecognizer (this might take a moment)...")
        recognizer = FaceRecognizer()
    except Exception as e:
        print(f"Failed to init services: {e}")
        return

    # Open Camera
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: No webcam found.")
        return

    print("Camera Opened. Point at your face!")
    print("Press 's' to snapshot and embed. Press 'q' to quit.")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Show live feed
        display_frame = frame.copy()
        
        # Detect faces
        faces = detector.detect_faces(frame)
        detector.draw_faces(display_frame, faces) # Draw boxes

        cv2.imshow("NexAttend - Recognition Test", display_frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('s'):
            # Snapshot triggered
            if len(faces) > 0:
                # Take the first face
                face = faces[0]
                x, y, w, h = face['box']
                
                # Ensure cropping is within bounds
                h_img, w_img, _ = frame.shape
                x = max(0, x)
                y = max(0, y)
                w = min(w, w_img - x)
                h = min(h, h_img - y)
                
                # Crop
                face_crop = frame[y:y+h, x:x+w]
                
                if face_crop.size > 0:
                    print("Face captured! Generating embedding...")
                    embedding = recognizer.get_embedding(face_crop)
                    
                    if embedding:
                        print(f"Embedding generated! Size: {len(embedding)}")
                        print(f"Values (first 5): {embedding[:5]}")
                    else:
                        print("Failed to generate embedding.")
                        
                    # Show the crop
                    cv2.imshow("Captured Face", face_crop)
            else:
                print("No face detected to snapshot!")

    cap.release()
    cv2.destroyAllWindows()
    print("Test finished.")

if __name__ == "__main__":
    test_recognition_pipeline()
