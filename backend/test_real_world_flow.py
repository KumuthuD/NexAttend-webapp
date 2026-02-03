
"""
Real World Flow Test (Day 7)
Simulates the full NexAttend lifecycle:
1. Registration (Load photo -> Generate Embedding -> Save to DB)
2. Identification (Live Camera -> Detect -> Match against DB)

Kumuthu Dahanayake
Week 02 Day 7
"""

import cv2
import sys
import os
import numpy as np
import time

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "")))

from app.services.face_detector import FaceDetector
from app.services.embedding_service import embedding_service

def main():
    print("--- NexAttend Day 7: Real World Flow Test ---")
    
    # 1. Initialize Services
    try:
        print("Initializing AI Services...")
        detector = FaceDetector(min_face_size=30)
        # embedding_service is already initialized on import
    except Exception as e:
        print(f"Error initializing services: {e}")
        return

    # 2. Simulated Database
    # Structure: [{'name': 'Kumuthu', 'embedding': [...], 'id': 1}]
    mock_db = []
    
    # 3. Registration Phase
    reference_path = os.path.join(os.path.dirname(__file__), "reference.jpg")
    
    if os.path.exists(reference_path):
        print(f"Found 'reference.jpg'. Registering user...")
        ref_img = cv2.imread(reference_path)
        if ref_img is not None:
            # We need to detect and crop the face first
            faces = detector.detect_faces(ref_img)
            if faces:
                # Use the largest face
                faces.sort(key=lambda x: x['box'][2] * x['box'][3], reverse=True)
                target_face = faces[0]
                
                # Crop
                x, y, w, h = target_face['box']
                face_crop = ref_img[y:y+h, x:x+w]
                
                # Generate Embedding using Service
                emb = embedding_service.generate_embedding(face_crop)
                
                if emb:
                    mock_db.append({
                        'name': 'Kumuthu (From File)',
                        'embedding': emb,
                        'id': '101'
                    })
                    print(f" Successfully registered 'Kumuthu' from file!")
                else:
                    print(" Failed to generate embedding from file.")
            else:
                print(" No face found in reference.jpg")
        else:
            print(" Could not read reference.jpg")
    else:
        print("ℹ 'reference.jpg' not found. You can register live using 'R'.")

    # 4. Identification Phase (Loop)
    print("\nStarting Camera...")
    print("Controls:")
    print(" (R) - Register the current face as 'Live User'")
    print(" (Q) - Quit")
    
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: No webcam found.")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        # Optimization: Resize for detection logic (optional, keeping full size for now based on user pref)
        display_frame = frame.copy()
        
        # Detect Faces
        faces = detector.detect_faces(frame)
        
        for face in faces:
            x, y, w, h = face['box']
            
            # Crop Face for Identification
            # Add a little padding for better recognition
            h_img, w_img, _ = frame.shape
            pad = int(w * 0.1) # 10% padding
            x1 = max(0, x - pad)
            y1 = max(0, y - pad)
            x2 = min(w_img, x + w + pad)
            y2 = min(h_img, y + h + pad)
            
            face_crop = frame[y1:y2, x1:x2]
            
            # IDENTITY CHECK
            name_label = "Unknown"
            color = (0, 0, 255) # Red
            
            if face_crop.size > 0:
                # Get live embedding
                live_emb = embedding_service.generate_embedding(face_crop)
                
                if live_emb:
                    # Search in DB
                    matched_user, dist = embedding_service.identify_user(live_emb, mock_db)
                    
                    if matched_user:
                        name_label = f"{matched_user['name']} ({dist:.2f})"
                        color = (0, 255, 0) # Green
                    else:
                        name_label = f"Unknown ({dist:.2f})"
            
            # Draw Box & Label
            cv2.rectangle(display_frame, (x, y), (x+w, y+h), color, 2)
            cv2.putText(display_frame, name_label, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        # Show simulated DB count
        cv2.putText(display_frame, f"DB Users: {len(mock_db)}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)

        cv2.imshow("NexAttend - Day 7 Verification Test", display_frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('r'):
            # Manual Live Registration
            if len(faces) > 0:
                # Take first face
                f = faces[0]
                x, y, w, h = f['box']
                crop = frame[y:y+h, x:x+w]
                emb = embedding_service.generate_embedding(crop)
                if emb:
                    new_id = str(len(mock_db) + 1)
                    mock_db.append({
                        'name': f"User_{new_id}",
                        'embedding': emb,
                        'id': new_id
                    })
                    print(f" Registered Live User_{new_id}")
            else:
                print(" No face to register")

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
