"""
Test with 5+ faces in single frame
Day 14 - Viraj Jayasiri
Branch: feature/ai/multi-face-testing

This script tests the complete pipeline with 5+ faces appearing together.
Tests detection and recognition of all faces in a single frame.
"""

import cv2
import numpy as np
import os
import time
from typing import List, Dict, Optional

from app.services.face_detector import FaceDetector
from app.services.ai.face_recognizer import FaceRecognizer
from app.services.ai.image_processor import convert_bgr_to_rgb


class MultiFaceRecognitionTest:
    """
    Test detection and recognition with 5+ faces in single frame
    """
    
    def __init__(self):
        print("="*70)
        print("MULTI-FACE RECOGNITION TEST (5+ FACES)")
        print("Day 14 - Viraj Jayasiri")
        print("="*70)
        print()
        
        # initialize services
        self.detector = FaceDetector(
            min_face_size=20,
            scale_factor=0.709,
            min_confidence=0.90
        )
        
        self.recognizer = FaceRecognizer(model_name="Facenet")
        
        # storage for registered students
        self.registered_students = []
        
        # test results
        self.test_results = []
        
        print("Services initialized successfully")
        print()
    
    def register_student(self, student_id: str) -> bool:
        """
        Register a student by capturing face from webcam
        """
        print(f"\n--- Registering: {student_id} ---")
        print("Position yourself clearly in front of camera")
        print("Press SPACE to capture, ESC to cancel")
        print()
        
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("Error: Cannot open webcam")
            return False
        
        registered = False
        
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    print("Failed to capture frame")
                    break
                
                # detect faces in frame
                faces = self.detector.detect_faces(frame)
                
                # draw rectangles around detected faces
                display_frame = frame.copy()
                for face in faces:
                    x, y, w, h = face['box']
                    cv2.rectangle(display_frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                    conf = face['confidence']
                    cv2.putText(display_frame, f"{conf:.2f}", (x, y-10),
                              cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                
                # show frame
                cv2.imshow('Register Student', display_frame)
                
                key = cv2.waitKey(1) & 0xFF
                
                if key == ord(' '):  # space to capture
                    if len(faces) == 0:
                        print("No face detected. Try again.")
                        continue
                    
                    if len(faces) > 1:
                        print(f"Multiple faces detected ({len(faces)}). Make sure only you are visible.")
                        continue
                    
                    # get the single face
                    face = faces[0]
                    x, y, w, h = face['box']
                    
                    # crop face with padding
                    padding = 20
                    x1 = max(0, x - padding)
                    y1 = max(0, y - padding)
                    x2 = min(frame.shape[1], x + w + padding)
                    y2 = min(frame.shape[0], y + h + padding)
                    
                    face_crop = frame[y1:y2, x1:x2]
                    
                    # generate embedding
                    print("Generating embedding...")
                    try:
                        embedding = self.recognizer.get_embedding(face_crop)
                        
                        # store student
                        self.registered_students.append({
                            'student_id': student_id,
                            'embedding': embedding,
                            'face_image': face_crop
                        })
                        
                        print(f"Successfully registered {student_id}")
                        print(f"Embedding shape: {len(embedding)}")
                        registered = True
                        break
                        
                    except Exception as e:
                        print(f"Error generating embedding: {e}")
                        continue
                
                elif key == 27:  # ESC to cancel
                    print("Registration cancelled")
                    break
        
        finally:
            cap.release()
            cv2.destroyAllWindows()
        
        return registered
    
    def capture_multi_face_frame(self) -> Optional[np.ndarray]:
        """
        Capture a single frame with multiple faces
        """
        print("\n--- Capture Multi-Face Frame ---")
        print("Make sure all registered students are visible")
        print("Press SPACE to capture, ESC to cancel")
        print()
        
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("Error: Cannot open webcam")
            return None
        
        captured_frame = None
        
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    print("Failed to capture frame")
                    break
                
                # detect faces
                faces = self.detector.detect_faces(frame)
                
                # draw rectangles
                display_frame = frame.copy()
                for face in faces:
                    x, y, w, h = face['box']
                    cv2.rectangle(display_frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                
                # show face count
                cv2.putText(display_frame, f"Faces: {len(faces)}", (10, 30),
                          cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                
                cv2.imshow('Multi-Face Capture', display_frame)
                
                key = cv2.waitKey(1) & 0xFF
                
                if key == ord(' '):  # space to capture
                    if len(faces) < 5:
                        print(f"Only {len(faces)} faces detected. Need at least 5.")
                        continue
                    
                    print(f"Captured frame with {len(faces)} faces")
                    captured_frame = frame
                    break
                
                elif key == 27:  # ESC to cancel
                    print("Capture cancelled")
                    break
        
        finally:
            cap.release()
            cv2.destroyAllWindows()
        
        return captured_frame
    
    def recognize_faces_in_frame(self, frame: np.ndarray) -> List[Dict]:
        """
        Detect and recognize all faces in the frame
        """
        print("\n--- Recognition Process ---")
        
        # detect all faces
        faces = self.detector.detect_faces(frame)
        print(f"Detected {len(faces)} faces")
        
        results = []
        
        for idx, face in enumerate(faces, 1):
            x, y, w, h = face['box']
            confidence = face['confidence']
            
            print(f"\nProcessing face {idx}...")
            print(f"  Position: ({x}, {y})")
            print(f"  Size: {w}x{h}")
            print(f"  Detection confidence: {confidence:.4f}")
            
            # crop face
            padding = 20
            x1 = max(0, x - padding)
            y1 = max(0, y - padding)
            x2 = min(frame.shape[1], x + w + padding)
            y2 = min(frame.shape[0], y + h + padding)
            
            face_crop = frame[y1:y2, x1:x2]
            
            # generate embedding
            try:
                embedding = self.recognizer.get_embedding(face_crop)
                
                # compare with all registered students
                best_match = None
                best_similarity = 0
                
                for student in self.registered_students:
                    similarity = self.recognizer.compare_embeddings(
                        embedding,
                        student['embedding']
                    )
                    
                    if similarity > best_similarity:
                        best_similarity = similarity
                        best_match = student['student_id']
                
                # check if match is above threshold
                if best_similarity >= self.recognizer.threshold:
                    print(f"  Recognized: {best_match}")
                    print(f"  Similarity: {best_similarity:.4f}")
                    status = "RECOGNIZED"
                else:
                    print(f"  No match found")
                    print(f"  Best similarity: {best_similarity:.4f}")
                    best_match = None
                    status = "UNKNOWN"
                
                results.append({
                    'face_index': idx,
                    'box': (x, y, w, h),
                    'detection_confidence': confidence,
                    'recognized_as': best_match,
                    'similarity': best_similarity,
                    'status': status
                })
                
            except Exception as e:
                print(f"  Error during recognition: {e}")
                results.append({
                    'face_index': idx,
                    'box': (x, y, w, h),
                    'detection_confidence': confidence,
                    'recognized_as': None,
                    'similarity': 0,
                    'status': "ERROR"
                })
        
        return results
    
    def visualize_results(self, frame: np.ndarray, results: List[Dict]):
        """
        Draw recognition results on frame and display
        """
        display_frame = frame.copy()
        
        for result in results:
            x, y, w, h = result['box']
            status = result['status']
            recognized_as = result['recognized_as']
            
            # choose color based on status
            if status == "RECOGNIZED":
                color = (0, 255, 0)  # green
                label = f"{recognized_as}"
            elif status == "UNKNOWN":
                color = (0, 0, 255)  # red
                label = "Unknown"
            else:
                color = (0, 165, 255)  # orange
                label = "Error"
            
            # draw rectangle
            cv2.rectangle(display_frame, (x, y), (x+w, y+h), color, 2)
            
            # draw label background
            label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)[0]
            cv2.rectangle(display_frame, (x, y-label_size[1]-10), 
                         (x+label_size[0], y), color, -1)
            
            # draw label text
            cv2.putText(display_frame, label, (x, y-5),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        # show result
        cv2.imshow('Recognition Results', display_frame)
        print("\nPress any key to close...")
        cv2.waitKey(0)
        cv2.destroyAllWindows()
    
    def print_summary(self, results: List[Dict]):
        """
        Print test summary and statistics
        """
        print("\n" + "="*70)
        print("TEST SUMMARY")
        print("="*70)
        
        print(f"\nRegistered Students: {len(self.registered_students)}")
        for student in self.registered_students:
            print(f"  - {student['student_id']}")
        
        print(f"\nDetected Faces: {len(results)}")
        
        recognized = sum(1 for r in results if r['status'] == 'RECOGNIZED')
        unknown = sum(1 for r in results if r['status'] == 'UNKNOWN')
        errors = sum(1 for r in results if r['status'] == 'ERROR')
        
        print(f"\nRecognition Results:")
        print(f"  Recognized: {recognized}")
        print(f"  Unknown: {unknown}")
        print(f"  Error: {errors}")
        
        if len(results) > 0:
            recognition_rate = (recognized / len(results)) * 100
            print(f"\nRecognition Rate: {recognition_rate:.1f}%")
        
        print("\nDetailed Results:")
        print("-"*70)
        for r in results:
            print(f"Face {r['face_index']}: "
                  f"{r['status']:12} | "
                  f"Recognized: {str(r['recognized_as']):15} | "
                  f"Similarity: {r['similarity']:.4f} | "
                  f"Detection: {r['detection_confidence']:.4f}")
        
        print("\n" + "="*70)
        
        # check if test passes
        if len(results) >= 5:
            print("\nSTATUS: PASS - All faces detected (5+)")
        else:
            print(f"\nSTATUS: FAIL - Only {len(results)} faces detected (need 5+)")
        
        print("="*70)


def main():
    """
    Main test flow
    """
    print("\n")
    print("*"*70)
    print("DAY 14 - MULTI-FACE RECOGNITION TEST (5+ FACES)")
    print("Viraj Jayasiri")
    print("*"*70)
    print()
    
    tester = MultiFaceRecognitionTest()
    
    # step 1: register 5+ students
    print("\n[STEP 1] REGISTER STUDENTS")
    print("You need to register at least 5 students")
    
    num_students = int(input("\nHow many students to register? (minimum 5): "))
    
    if num_students < 5:
        print("Error: Must register at least 5 students for this test")
        return
    
    for i in range(num_students):
        student_id = input(f"\nEnter student ID {i+1}: ").strip()
        success = tester.register_student(student_id)
        
        if not success:
            print(f"Failed to register {student_id}")
            retry = input("Retry? (y/n): ").lower()
            if retry == 'y':
                success = tester.register_student(student_id)
            
            if not success:
                print("Skipping this student")
    
    if len(tester.registered_students) < 5:
        print(f"\nError: Only {len(tester.registered_students)} students registered")
        print("Need at least 5 students for this test")
        return
    
    print(f"\n{len(tester.registered_students)} students registered successfully")
    
    # step 2: capture frame with all faces
    print("\n[STEP 2] CAPTURE MULTI-FACE FRAME")
    print("Get all registered students in front of the camera")
    input("Press ENTER when ready...")
    
    frame = tester.capture_multi_face_frame()
    
    if frame is None:
        print("Failed to capture frame")
        return
    
    # step 3: recognize all faces
    print("\n[STEP 3] RECOGNIZE ALL FACES")
    results = tester.recognize_faces_in_frame(frame)
    
    # step 4: visualize results
    print("\n[STEP 4] VISUALIZE RESULTS")
    tester.visualize_results(frame, results)
    
    # step 5: print summary
    tester.print_summary(results)


if __name__ == "__main__":
    main()
