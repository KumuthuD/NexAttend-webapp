"""
Automated recognition test using webcam captures
Day 13 - Viraj Jayasiri
Branch: feature/ai/recognition-testing

Simpler version - captures once then tests
"""

import cv2
import numpy as np
import os
import time
from typing import List, Dict
from app.services.ai.single_face_recognition_service import SingleFaceRecognitionService

# test data directory
TEST_DATA_DIR = "test_captures/recognition_test_data"
os.makedirs(TEST_DATA_DIR, exist_ok=True)


def capture_registration_images():
    """
    Capture registration images for 3-5 students
    """
    print("\n=== REGISTRATION PHASE ===")
    print("We will capture one clear image per student")
    
    num_students = int(input("\nHow many students to register (3-5)? "))
    
    if num_students < 3 or num_students > 5:
        print("Error: Must be 3-5 students")
        return []
    
    student_ids = []
    for i in range(num_students):
        student_id = input(f"Enter student ID {i+1}: ").strip()
        student_ids.append(student_id)
    
    # capture each student
    service = SingleFaceRecognitionService()
    registered = []
    
    for student_id in student_ids:
        print(f"\n--- Capturing: {student_id} ---")
        print("Position yourself in camera")
        print("Press SPACE when ready\n")
        
        cap = cv2.VideoCapture(0)
        captured = False
        
        while not captured:
            ret, frame = cap.read()
            if not ret:
                break
            
            # show preview
            face = service.detect_single_face(frame)
            if face:
                x, y, w, h = face['box']
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            
            cv2.putText(frame, f"Registering: {student_id}", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            cv2.putText(frame, "SPACE to capture", (10, 60), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
            cv2.imshow('Register', frame)
            
            if cv2.waitKey(1) & 0xFF == 32:  # space
                if face:
                    # save image
                    img_path = os.path.join(TEST_DATA_DIR, f"{student_id}_register.jpg")
                    cv2.imwrite(img_path, frame)
                    
                    # generate embedding
                    cropped = service.crop_detected_face(frame, face['box'])
                    embedding = service.generate_embedding(cropped)
                    
                    if embedding:
                        registered.append({
                            "student_id": student_id,
                            "embedding": embedding,
                            "image_path": img_path
                        })
                        print(f"Registered: {student_id}")
                        captured = True
                    else:
                        print("Failed to generate embedding, try again")
                else:
                    print("No face detected, try again")
        
        cap.release()
        cv2.destroyAllWindows()
        time.sleep(0.5)
    
    return registered


def run_recognition_tests(registered_students: List[Dict]):
    """
    Test each registered student
    """
    print("\n=== TESTING PHASE ===")
    print("Now we will test recognition for each student")
    
    service = SingleFaceRecognitionService()
    all_results = []
    
    for student in registered_students:
        student_id = student['student_id']
        
        print(f"\n--- Testing: {student_id} ---")
        print("Position yourself in camera")
        print("We will capture 5 test images")
        print("Press SPACE for each capture\n")
        
        cap = cv2.VideoCapture(0)
        test_count = 0
        results = []
        
        while test_count < 5:
            ret, frame = cap.read()
            if not ret:
                break
            
            # show preview
            cv2.putText(frame, f"Testing: {student_id} ({test_count+1}/5)", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            cv2.putText(frame, "SPACE to capture test", (10, 60), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
            cv2.imshow('Test', frame)
            
            if cv2.waitKey(1) & 0xFF == 32:  # space
                # run recognition
                result = service.recognize_single_face(frame, registered_students)
                
                test_count += 1
                
                # save test image
                img_path = os.path.join(TEST_DATA_DIR, f"{student_id}_test_{test_count}.jpg")
                cv2.imwrite(img_path, frame)
                
                # check result
                if result['match_found']:
                    recognized = result['student_id']
                    confidence = result['confidence']
                    
                    if recognized == student_id:
                        status = "CORRECT"
                        print(f"Test {test_count}: CORRECT ({confidence:.1f}%)")
                    else:
                        status = "WRONG"
                        print(f"Test {test_count}: WRONG - got {recognized}")
                    
                    results.append({
                        "expected": student_id,
                        "recognized": recognized,
                        "confidence": confidence,
                        "status": status
                    })
                else:
                    status = "NO_MATCH"
                    print(f"Test {test_count}: NO MATCH")
                    results.append({
                        "expected": student_id,
                        "recognized": None,
                        "confidence": 0,
                        "status": status
                    })
        
        cap.release()
        cv2.destroyAllWindows()
        time.sleep(0.5)
        
        all_results.extend(results)
    
    return all_results


def print_report(registered_students: List[Dict], test_results: List[Dict]):
    """
    Print final test report
    """
    print("\n" + "="*60)
    print("RECOGNITION TEST REPORT - DAY 13")
    print("="*60)
    
    print(f"\nRegistered Students: {len(registered_students)}")
    for s in registered_students:
        print(f"  - {s['student_id']}")
    
    print(f"\nTotal Tests: {len(test_results)}")
    
    # stats
    correct = sum(1 for r in test_results if r['status'] == 'CORRECT')
    wrong = sum(1 for r in test_results if r['status'] == 'WRONG')
    no_match = sum(1 for r in test_results if r['status'] == 'NO_MATCH')
    
    print(f"\nResults:")
    print(f"  Correct: {correct}")
    print(f"  Wrong: {wrong}")
    print(f"  No Match: {no_match}")
    
    if len(test_results) > 0:
        accuracy = (correct / len(test_results)) * 100
        print(f"\nAccuracy: {accuracy:.1f}%")
        
        if accuracy >= 80:
            print("\nSTATUS: PASS - Target achieved (80%+)")
        else:
            print("\nSTATUS: FAIL - Below target (80%+)")
    
    # detailed breakdown
    print("\nDetailed Results:")
    print("-"*60)
    for i, r in enumerate(test_results, 1):
        print(f"{i:2}. Expected: {r['expected']:12} | "
              f"Got: {str(r['recognized']):12} | "
              f"Conf: {r['confidence']:5.1f}% | "
              f"{r['status']}")
    
    print("="*60)


def main():
    """
    Main test flow
    """
    print("="*60)
    print("DAY 13 RECOGNITION TEST")
    print("Viraj Jayasiri - 3-5 Face Recognition")
    print("="*60)
    
    # step 1: register
    registered = capture_registration_images()
    
    if len(registered) < 3:
        print("\nError: Need at least 3 registered students")
        return
    
    print(f"\nSuccessfully registered {len(registered)} students")
    
    # step 2: test
    input("\nPress ENTER to start testing...")
    results = run_recognition_tests(registered)
    
    # step 3: report
    print_report(registered, results)


if __name__ == "__main__":
    main()
