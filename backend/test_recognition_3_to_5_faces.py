"""
Test recognition with 3-5 registered faces
Day 13 - Viraj Jayasiri
Branch: feature/ai/recognition-testing

This script registers 3-5 faces and tests recognition accuracy
Target: 80%+ accuracy
"""

import cv2
import numpy as np
import os
from typing import List, Dict
from app.services.ai.single_face_recognition_service import SingleFaceRecognitionService

# test data directory
TEST_DATA_DIR = "test_captures/recognition_test_data"
os.makedirs(TEST_DATA_DIR, exist_ok=True)


class RecognitionTester:
    """
    Test recognition with multiple registered faces
    """
    
    def __init__(self):
        self.service = SingleFaceRecognitionService(
            min_confidence=0.90,
            similarity_threshold=0.7
        )
        self.registered_students = []
        self.test_results = []
    
    def register_student_from_webcam(self, student_id: str) -> bool:
        """
        Register a student by capturing face from webcam
        """
        print(f"\n--- Registering: {student_id} ---")
        print("Position yourself in front of camera")
        print("Press SPACE to capture, ESC to cancel\n")
        
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("Error: Cannot open webcam")
            return False
        
        captured = False
        embedding = None
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # detect face for preview
            face = self.service.detect_single_face(frame)
            
            # draw box if face detected
            if face:
                x, y, w, h = face['box']
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                cv2.putText(frame, f"Conf: {face['confidence']:.2f}", 
                           (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            
            cv2.putText(frame, f"Registering: {student_id}", 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            cv2.putText(frame, "SPACE to capture | ESC to cancel", 
                       (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
            cv2.imshow('Register Student', frame)
            
            key = cv2.waitKey(1) & 0xFF
            
            if key == 32:  # space
                if face is None:
                    print("No face detected, try again")
                    continue
                
                # crop and generate embedding
                cropped = self.service.crop_detected_face(frame, face['box'])
                if cropped is not None:
                    embedding = self.service.generate_embedding(cropped)
                    
                    if embedding is not None:
                        # save the image
                        img_path = os.path.join(TEST_DATA_DIR, f"{student_id}_registered.jpg")
                        cv2.imwrite(img_path, frame)
                        
                        print(f"Captured successfully")
                        print(f"Embedding dimensions: {len(embedding)}")
                        print(f"Image saved: {img_path}")
                        captured = True
                        break
                    else:
                        print("Failed to generate embedding, try again")
                else:
                    print("Failed to crop face, try again")
            
            elif key == 27:  # esc
                print("Registration cancelled")
                break
        
        cap.release()
        cv2.destroyAllWindows()
        
        if captured and embedding is not None:
            self.registered_students.append({
                "student_id": student_id,
                "embedding": embedding
            })
            return True
        
        return False
    
    def test_recognition_from_webcam(self, expected_student_id: str, num_tests: int = 5):
        """
        Test recognition multiple times for a student
        """
        print(f"\n--- Testing Recognition: {expected_student_id} ---")
        print(f"Will capture {num_tests} frames")
        print("Press SPACE to capture each test frame, ESC to skip\n")
        
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("Error: Cannot open webcam")
            return
        
        test_count = 0
        correct_count = 0
        
        while test_count < num_tests:
            ret, frame = cap.read()
            if not ret:
                break
            
            # show preview
            face = self.service.detect_single_face(frame)
            
            if face:
                x, y, w, h = face['box']
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            
            cv2.putText(frame, f"Testing: {expected_student_id} ({test_count+1}/{num_tests})", 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            cv2.putText(frame, "SPACE to test | ESC to skip", 
                       (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
            cv2.imshow('Test Recognition', frame)
            
            key = cv2.waitKey(1) & 0xFF
            
            if key == 32:  # space
                # run recognition
                result = self.service.recognize_single_face(frame, self.registered_students)
                
                test_count += 1
                
                # check result
                if result['match_found']:
                    recognized_id = result['student_id']
                    confidence = result['confidence']
                    
                    if recognized_id == expected_student_id:
                        print(f"Test {test_count}: CORRECT - {recognized_id} (confidence: {confidence:.2f}%)")
                        correct_count += 1
                        status = "CORRECT"
                    else:
                        print(f"Test {test_count}: WRONG - recognized as {recognized_id} instead of {expected_student_id}")
                        status = "WRONG"
                    
                    self.test_results.append({
                        "expected": expected_student_id,
                        "recognized": recognized_id,
                        "confidence": confidence,
                        "status": status
                    })
                else:
                    print(f"Test {test_count}: NO MATCH FOUND")
                    self.test_results.append({
                        "expected": expected_student_id,
                        "recognized": None,
                        "confidence": 0,
                        "status": "NO_MATCH"
                    })
                
                # save test image
                img_path = os.path.join(TEST_DATA_DIR, f"{expected_student_id}_test_{test_count}.jpg")
                cv2.imwrite(img_path, frame)
            
            elif key == 27:  # esc
                print("Testing skipped")
                break
        
        cap.release()
        cv2.destroyAllWindows()
        
        # show results for this student
        if test_count > 0:
            accuracy = (correct_count / test_count) * 100
            print(f"\nResults for {expected_student_id}:")
            print(f"  Correct: {correct_count}/{test_count}")
            print(f"  Accuracy: {accuracy:.1f}%")
    
    def print_final_report(self):
        """
        Print complete test report
        """
        print("\n" + "="*60)
        print("FINAL RECOGNITION TEST REPORT")
        print("="*60)
        
        print(f"\nRegistered Students: {len(self.registered_students)}")
        for student in self.registered_students:
            print(f"  - {student['student_id']}")
        
        print(f"\nTotal Tests: {len(self.test_results)}")
        
        # calculate overall stats
        correct = sum(1 for r in self.test_results if r['status'] == 'CORRECT')
        wrong = sum(1 for r in self.test_results if r['status'] == 'WRONG')
        no_match = sum(1 for r in self.test_results if r['status'] == 'NO_MATCH')
        
        total = len(self.test_results)
        if total > 0:
            accuracy = (correct / total) * 100
            
            print(f"\nResults:")
            print(f"  Correct: {correct}")
            print(f"  Wrong: {wrong}")
            print(f"  No Match: {no_match}")
            print(f"\nOverall Accuracy: {accuracy:.1f}%")
            
            # check if meets target
            if accuracy >= 80:
                print("\nSTATUS: PASS (Target: 80%+)")
            else:
                print("\nSTATUS: FAIL (Target: 80%+)")
            
            # detailed results
            print("\nDetailed Test Results:")
            print("-" * 60)
            for i, r in enumerate(self.test_results, 1):
                print(f"{i}. Expected: {r['expected']:15} | "
                      f"Got: {str(r['recognized']):15} | "
                      f"Conf: {r['confidence']:6.2f}% | "
                      f"Status: {r['status']}")
        
        print("\n" + "="*60)


def main():
    """
    Main test flow
    """
    print("="*60)
    print("RECOGNITION TEST - 3 TO 5 FACES")
    print("Day 13 - Viraj Jayasiri")
    print("="*60)
    
    tester = RecognitionTester()
    
    # step 1: register students
    print("\n[STEP 1] REGISTER STUDENTS")
    print("You need to register 3-5 students")
    
    num_students = int(input("How many students to register (3-5)? "))
    
    if num_students < 3 or num_students > 5:
        print("Error: Must register 3-5 students")
        return
    
    for i in range(num_students):
        student_id = input(f"\nEnter student ID {i+1}: ").strip()
        success = tester.register_student_from_webcam(student_id)
        
        if not success:
            print(f"Failed to register {student_id}")
            retry = input("Retry? (y/n): ").lower()
            if retry == 'y':
                success = tester.register_student_from_webcam(student_id)
    
    if len(tester.registered_students) < 3:
        print("\nError: Need at least 3 registered students")
        return
    
    print(f"\n{len(tester.registered_students)} students registered successfully")
    
    # step 2: test recognition
    print("\n[STEP 2] TEST RECOGNITION")
    
    for student in tester.registered_students:
        student_id = student['student_id']
        num_tests = int(input(f"\nHow many test captures for {student_id}? (recommended: 3-5): "))
        tester.test_recognition_from_webcam(student_id, num_tests)
    
    # step 3: show report
    tester.print_final_report()


if __name__ == "__main__":
    main()
