"""
Test with 5+ faces in single frame (using static images)
Day 14 - Viraj Jayasiri
Branch: feature/ai/multi-face-testing

Alternative version that uses pre-captured images instead of live webcam.
Useful for quick testing or when multiple people aren't available.
"""

import cv2
import numpy as np
import os
from typing import List, Dict

from app.services.face_detector import FaceDetector
from app.services.ai.face_recognizer import FaceRecognizer


class MultiFaceStaticTest:
    """
    Test multi-face recognition using static images
    """
    
    def __init__(self):
        print("="*70)
        print("MULTI-FACE RECOGNITION TEST (STATIC IMAGES)")
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
        
        # storage
        self.registered_students = []
        
        print("Services initialized")
        print()
    
    def register_from_image(self, student_id: str, image_path: str) -> bool:
        """
        Register a student from an image file
        """
        print(f"Registering {student_id} from {image_path}...")
        
        if not os.path.exists(image_path):
            print(f"Error: Image not found: {image_path}")
            return False
        
        # load image
        frame = cv2.imread(image_path)
        
        if frame is None:
            print(f"Error: Cannot load image")
            return False
        
        # detect face
        faces = self.detector.detect_faces(frame)
        
        if len(faces) == 0:
            print("No face detected in image")
            return False
        
        if len(faces) > 1:
            print(f"Warning: {len(faces)} faces detected, using largest")
        
        # use largest face
        face = faces[0]
        x, y, w, h = face['box']
        
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
            
            self.registered_students.append({
                'student_id': student_id,
                'embedding': embedding,
                'image_path': image_path
            })
            
            print(f"Successfully registered {student_id}")
            print(f"Embedding size: {len(embedding)}")
            return True
            
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return False
    
    def test_multi_face_image(self, test_image_path: str) -> List[Dict]:
        """
        Test recognition on an image with multiple faces
        """
        print(f"\nTesting image: {test_image_path}")
        
        if not os.path.exists(test_image_path):
            print(f"Error: Test image not found")
            return []
        
        # load image
        frame = cv2.imread(test_image_path)
        
        if frame is None:
            print("Error: Cannot load test image")
            return []
        
        print(f"Image loaded: {frame.shape[1]}x{frame.shape[0]}")
        
        # detect faces
        faces = self.detector.detect_faces(frame)
        print(f"Detected {len(faces)} faces")
        
        if len(faces) < 5:
            print(f"Warning: Only {len(faces)} faces detected (expected 5+)")
        
        results = []
        
        # process each face
        for idx, face in enumerate(faces, 1):
            x, y, w, h = face['box']
            confidence = face['confidence']
            
            print(f"\nFace {idx}:")
            print(f"  Position: ({x}, {y}), Size: {w}x{h}")
            print(f"  Detection confidence: {confidence:.4f}")
            
            # crop face
            padding = 20
            x1 = max(0, x - padding)
            y1 = max(0, y - padding)
            x2 = min(frame.shape[1], x + w + padding)
            y2 = min(frame.shape[0], y + h + padding)
            
            face_crop = frame[y1:y2, x1:x2]
            
            # recognize
            try:
                embedding = self.recognizer.get_embedding(face_crop)
                
                # find best match
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
                
                # check threshold
                if best_similarity >= self.recognizer.threshold:
                    print(f"  Match: {best_match} (similarity: {best_similarity:.4f})")
                    status = "RECOGNIZED"
                else:
                    print(f"  No match (best: {best_similarity:.4f})")
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
                print(f"  Error: {e}")
                results.append({
                    'face_index': idx,
                    'box': (x, y, w, h),
                    'detection_confidence': confidence,
                    'recognized_as': None,
                    'similarity': 0,
                    'status': "ERROR"
                })
        
        return results, frame
    
    def visualize_results(self, frame: np.ndarray, results: List[Dict]):
        """
        Draw results on frame and save/display
        """
        display_frame = frame.copy()
        
        for result in results:
            x, y, w, h = result['box']
            status = result['status']
            recognized_as = result['recognized_as']
            
            # color based on status
            if status == "RECOGNIZED":
                color = (0, 255, 0)  # green
                label = f"{recognized_as}"
            elif status == "UNKNOWN":
                color = (0, 0, 255)  # red
                label = "Unknown"
            else:
                color = (0, 165, 255)  # orange
                label = "Error"
            
            # draw box
            cv2.rectangle(display_frame, (x, y), (x+w, y+h), color, 2)
            
            # draw label
            label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)[0]
            cv2.rectangle(display_frame, (x, y-label_size[1]-10), 
                         (x+label_size[0], y), color, -1)
            cv2.putText(display_frame, label, (x, y-5),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        # save result
        output_path = "test_captures/multi_face_result.jpg"
        cv2.imwrite(output_path, display_frame)
        print(f"\nResult saved to: {output_path}")
        
        # display
        cv2.imshow('Results', display_frame)
        print("Press any key to close...")
        cv2.waitKey(0)
        cv2.destroyAllWindows()
    
    def print_summary(self, results: List[Dict]):
        """
        Print test summary
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
        
        print(f"\nResults:")
        print(f"  Recognized: {recognized}")
        print(f"  Unknown: {unknown}")
        print(f"  Errors: {errors}")
        
        if len(results) > 0:
            rate = (recognized / len(results)) * 100
            print(f"\nRecognition Rate: {rate:.1f}%")
        
        print("\nDetails:")
        print("-"*70)
        for r in results:
            print(f"Face {r['face_index']}: "
                  f"{r['status']:12} | "
                  f"ID: {str(r['recognized_as']):15} | "
                  f"Similarity: {r['similarity']:.4f}")
        
        print("\n" + "="*70)
        
        # status
        if len(results) >= 5:
            print("\nSTATUS: PASS - 5+ faces detected")
        else:
            print(f"\nSTATUS: FAIL - Only {len(results)} faces")
        
        print("="*70)


def main():
    """
    Main test flow
    """
    print("\n")
    print("*"*70)
    print("STATIC IMAGE TEST - MULTI-FACE RECOGNITION")
    print("*"*70)
    print()
    
    tester = MultiFaceStaticTest()
    
    print("This test uses pre-captured images")
    print("You need:")
    print("  1. Individual images for each student (registration)")
    print("  2. One group image with 5+ students (test)")
    print()
    
    # register students
    print("[STEP 1] REGISTER STUDENTS")
    num_students = int(input("How many students to register? (min 5): "))
    
    for i in range(num_students):
        student_id = input(f"\nStudent ID {i+1}: ").strip()
        image_path = input(f"Image path for {student_id}: ").strip()
        
        success = tester.register_from_image(student_id, image_path)
        
        if not success:
            print(f"Failed to register {student_id}")
    
    if len(tester.registered_students) < 5:
        print(f"\nError: Only {len(tester.registered_students)} registered")
        return
    
    print(f"\n{len(tester.registered_students)} students registered")
    
    # test multi-face image
    print("\n[STEP 2] TEST MULTI-FACE IMAGE")
    test_image = input("Path to group image (with 5+ faces): ").strip()
    
    results, frame = tester.test_multi_face_image(test_image)
    
    if not results:
        print("Test failed - no results")
        return
    
    # visualize
    print("\n[STEP 3] VISUALIZE RESULTS")
    tester.visualize_results(frame, results)
    
    # summary
    tester.print_summary(results)


if __name__ == "__main__":
    main()
