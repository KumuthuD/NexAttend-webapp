import cv2
import sys
from mtcnn import MTCNN

def test_mtcnn_live():
    print("Testing MTCNN Face Detection (Live)")
    print("Initializing MTCNN... (this might take a few seconds)")
    
    try:
        detector = MTCNN()
        print("MTCNN initialized successfully")
    except Exception as e:
        print(f"Failed to initialize MTCNN: {e}")
        return

    print("Opening camera... Press 'q' to quit.")
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        sys.exit(1)
        
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Could not read frame.")
            break
            
        # MTCNN expects RGB images (OpenCV uses BGR)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Detect faces
        faces = detector.detect_faces(rgb_frame)
        
        # Draw rectangles around faces
        for face in faces:
            x, y, width, height = face['box']
            # Draw rectangle (Green, 2px thickness)
            cv2.rectangle(frame, (x, y), (x+width, y+height), (0, 255, 0), 2)
            
            # Optional: Add confidence score text
            confidence = round(face['confidence'], 2)
            cv2.putText(frame, f"Face: {confidence}", (x, y - 10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Show result
        cv2.imshow('NexAttend - Live Face Detection', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
            
    cap.release()
    cv2.destroyAllWindows()
    print("Camera released.")

if __name__ == "__main__":
    test_mtcnn_live()
