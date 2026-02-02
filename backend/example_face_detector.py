"""
Quick example showing how to use optimized FaceDetector

Viraj Jayasiri
Week 02 Day 6
"""

import cv2
from app.services.face_detector import FaceDetector


def example_basic_usage():
    """
    Basic example: detect faces in webcam
    """
    print("Example 1: Basic Multi-Face Detection")
    print("-" * 50)
    
    # initialize detector
    detector = FaceDetector(min_confidence=0.90)
    
    # open webcam
    cap = cv2.VideoCapture(0)
    
    print("Press 'q' to quit")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # detect faces
        faces = detector.detect_faces(frame, filter_confidence=True, sort_by_size=True)
        
        # draw results
        annotated_frame = detector.draw_faces(frame, faces)
        
        # display
        cv2.imshow('Basic Example', annotated_frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()


def example_face_cropping():
    """
    Example: detect and crop all faces
    """
    print("\nExample 2: Face Cropping")
    print("-" * 50)
    
    detector = FaceDetector()
    cap = cv2.VideoCapture(0)
    
    print("Press 'c' to crop faces, 'q' to quit")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        faces = detector.detect_faces(frame)
        annotated_frame = detector.draw_faces(frame, faces)
        cv2.imshow('Crop Example', annotated_frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('c') and faces:
            # crop all faces
            cropped_faces = detector.crop_faces(frame, faces, padding=0.2)
            
            print(f"Cropped {len(cropped_faces)} faces:")
            for idx, face_img in enumerate(cropped_faces):
                h, w = face_img.shape[:2]
                print(f"  Face {idx+1}: {w}x{h}")
                cv2.imshow(f'Face {idx+1}', face_img)
            
            cv2.waitKey(0)
            for idx in range(len(cropped_faces)):
                cv2.destroyWindow(f'Face {idx+1}')
    
    cap.release()
    cv2.destroyAllWindows()


def example_quality_check():
    """
    Example: validate face quality
    """
    print("\nExample 3: Face Quality Validation")
    print("-" * 50)
    
    detector = FaceDetector()
    cap = cv2.VideoCapture(0)
    
    print("Press 'v' to validate face quality, 'q' to quit")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        faces = detector.detect_faces(frame)
        annotated_frame = detector.draw_faces(frame, faces)
        cv2.imshow('Quality Check', annotated_frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('v') and faces:
            cropped_faces = detector.crop_faces(frame, faces)
            
            print("\nQuality Check Results:")
            for idx, face_img in enumerate(cropped_faces):
                is_valid, reason = detector.validate_face_quality(face_img)
                status = "PASS" if is_valid else "FAIL"
                print(f"  Face {idx+1}: {status} - {reason}")
    
    cap.release()
    cv2.destroyAllWindows()


def example_largest_face():
    """
    Example: get only the largest face (for registration)
    """
    print("\nExample 4: Get Largest Face Only")
    print("-" * 50)
    
    detector = FaceDetector()
    cap = cv2.VideoCapture(0)
    
    print("Shows only the largest face in frame")
    print("Press 'q' to quit")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # get only largest face
        largest_face = detector.get_largest_face(frame)
        
        if largest_face:
            faces = [largest_face]
        else:
            faces = []
        
        annotated_frame = detector.draw_faces(frame, faces)
        cv2.imshow('Largest Face Only', annotated_frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    print("=" * 50)
    print("FaceDetector Usage Examples")
    print("=" * 50)
    print()
    
    while True:
        print("\nSelect example to run:")
        print("  1. Basic Multi-Face Detection")
        print("  2. Face Cropping")
        print("  3. Face Quality Validation")
        print("  4. Get Largest Face Only")
        print("  5. Exit")
        print()
        
        choice = input("Enter choice (1-5): ").strip()
        
        if choice == '1':
            example_basic_usage()
        elif choice == '2':
            example_face_cropping()
        elif choice == '3':
            example_quality_check()
        elif choice == '4':
            example_largest_face()
        elif choice == '5':
            print("Exiting examples")
            break
        else:
            print("Invalid choice")
