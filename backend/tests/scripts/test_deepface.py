
import cv2
import numpy as np
import os
from deepface import DeepFace

def test_deepface_embedding():
    print(" Testing DeepFace Embedding Generation ")
    
    # 1. Create a dummy image (simulating a face)
    # DeepFace might complain if no face is passed, so we will try to use a real image if possible.
    # But for a basic build test, we construct a NumPy array.
    # Note: DeepFace usually expects a path or a numpy array.
    
    # Let's create a 300x300 RGB image (random noise might fail detection, so we use a blank one for import test)
    # Ideally, you should place a real 'face.jpg' in this folder for a true test.
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    cv2.rectangle(img, (100, 100), (200, 200), (255, 255, 255), -1) # Make a white box
    
    print(" Created dummy image.")

    try:
        print(" Loading DeepFace model (Facenet)... This may take a while first time.")
        
        # We turn off enforce_detection because our dummy image has no real face.
        # This tests if the model loads and runs the forward pass.
        embedding_objs = DeepFace.represent(
            img_path=img,
            model_name="Facenet",
            enforce_detection=False
        )
        
        embedding = embedding_objs[0]["embedding"]
        
        print(f"Embedding generated successfully!")
        print(f"Dimension: {len(embedding)}")
        print(f"First 5 values: {embedding[:5]}")
        
    except Exception as e:
        print(f" DeepFace Error: {e}")

if __name__ == "__main__":
    test_deepface_embedding()
