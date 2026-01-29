
import cv2
import numpy as np
from mtcnn import MTCNN
import os

def test_mtcnn():
    print("--- Testing MTCNN Face Detection ---")
    
    # Initialize detector
    try:
        detector = MTCNN()
        print("✅ MTCNN initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize MTCNN: {e}")
        return

    # Create a dummy image (black background with a white square)
    # In a real scenario, we'd load an actual face image.
    # For now, we just want to ensure the library runs without crashing.
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    cv2.rectangle(img, (100, 100), (200, 200), (255, 255, 255), -1)
    
    print("📸 Created dummy test image (300x300)")

    try:
        # Detect faces (won't find any real faces, but exercises the model)
        faces = detector.detect_faces(img)
        print(f"✅ Detection ran successfully. Faces found: {len(faces)}")
        print("(Note: 0 faces is expected for a dummy image, we just checked if the model runs)")
        
    except Exception as e:
        print(f"❌ Detection failed: {e}")

if __name__ == "__main__":
    test_mtcnn()
