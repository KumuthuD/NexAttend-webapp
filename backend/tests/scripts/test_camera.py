import cv2
import sys

def test_camera():
    print("Opening camera window... Press 'q' to quit.")
    
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        sys.exit(1)
        
    print("Webcam opened! You should see a window now.")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Valid camera found, but could not read frame.")
            break
            
        cv2.imshow('NexAttend Camera Test', frame)
        
        # Break loop on 'q' key press
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
            
    cap.release()
    cv2.destroyAllWindows()
    print("Camera released and window closed.")

if __name__ == "__main__":
    test_camera()
