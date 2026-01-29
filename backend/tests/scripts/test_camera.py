
import cv2
import sys

def test_camera():
    print("--- Testing Webcam Access ---")
    
    # Attempt to open default camera (index 0)
    # If you have multiple cameras, you might need index 1
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("❌ Error: Could not open webcam.")
        sys.exit(1)
        
    print("✅ Webcam opened successfully!")
    
    # Try reading a frame
    ret, frame = cap.read()
    
    if ret:
        print(f"✅ Frame captured! Resolution: {frame.shape[1]}x{frame.shape[0]}")
        # Optionally save it to verify
        # cv2.imwrite("test_capture.jpg", frame)
    else:
        print("❌ Error: Valid camera found, but could not read frame.")
        
    cap.release()
    print("✅ Camera released.")

if __name__ == "__main__":
    test_camera()
