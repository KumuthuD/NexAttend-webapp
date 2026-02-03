"""Viraj Jayasiri - Week 02 Day 7"""

import sys
import os
import urllib.request
import numpy as np

# add the backend directory to the path so we can import 'app'
# getting the path of this file, going up 2 levels (tests -> backend)
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.append(backend_dir)

try:
    import cv2
except ImportError:
    print("Warning: OpenCV (cv2) not found.")
    cv2 = None

# properly import the class we created
from app.services.ai.face_recognizer import FaceRecognizer

def download_image(url, save_path):
    print(f"Downloading image from {url}...")
    try:
        import ssl
        # Create unverified context to avoid SSL errors
        context = ssl._create_unverified_context()
        with urllib.request.urlopen(url, context=context) as response, open(save_path, 'wb') as out_file:
            out_file.write(response.read())
        print("Download success!")
        return True
    except Exception as e:
        print(f"Download failed: {e}")
        # Try curl if python fails
        try:
            os.system(f"curl -L -o {save_path} {url}")
            if os.path.exists(save_path):
                 print("Download success via curl!")
                 return True
        except:
             pass
        return False

def test_comparison():
    print("=== Testing Embedding Comparison (Isolated) ===")
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Adjust path to be relative to where we run or absolute
    temp_dir = os.path.join(current_dir, "temp_data")
    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)
        
    img1_path = os.path.join(temp_dir, "test_face_1.jpg")
    img2_path = os.path.join(temp_dir, "test_face_2.jpg")
    
    # Elon Musk images
    url1 = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28cropped%29.jpg/220px-Elon_Musk_Royal_Society_%28cropped%29.jpg"
    url2 = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Elon_Musk_Colorado_2022_%28cropped2%29.jpg/220px-Elon_Musk_Colorado_2022_%28cropped2%29.jpg"
    
    if not os.path.exists(img1_path):
        download_image(url1, img1_path)
    if not os.path.exists(img2_path):
        download_image(url2, img2_path)
        
    if cv2 is None:
        print("Error: OpenCV is not working, cannot load images.")
        return

    img1 = cv2.imread(img1_path)
    img2 = cv2.imread(img2_path)
    
    if img1 is None:
        print(f"Error: Could not read {img1_path}")
    if img2 is None:
        print(f"Error: Could not read {img2_path}")
        
    if img1 is None or img2 is None:
        return

    print("Initializing FaceRecognizer...")
    try:
        recognizer = FaceRecognizer()
        
        print("Generating embedding 1...")
        emb1 = recognizer.get_embedding(img1)
        
        print("Generating embedding 2...")
        emb2 = recognizer.get_embedding(img2)
        
        score = recognizer.compare_embeddings(emb1, emb2)
        print(f"Similarity Score: {score}")
        
        if score > recognizer.threshold:
            print("SUCCESS: The images match! (High Similarity)")
        else:
            print("FAILURE: The images do not match (Low Similarity)")
            
    except Exception as e:
        print(f"An error occurred during DeepFace operations: {e}")

if __name__ == "__main__":
    test_comparison()
