"""
Quick test runner for Day 13
Viraj Jayasiri - feature/ai/recognition-testing

Just run this and follow the prompts
Target: 80%+ accuracy with 3-5 faces
"""

import cv2
from app.services.ai.single_face_recognition_service import SingleFaceRecognitionService
import os

TEST_DIR = "test_captures/recognition_test_data"
os.makedirs(TEST_DIR, exist_ok=True)

def main():
    print("\nDAY 13 - RECOGNITION TEST")
    print("="*50)
    
    service = SingleFaceRecognitionService()
    registered = []
    
    # register students
    n = int(input("\nHow many students (3-5)? "))
    
    for i in range(n):
        sid = input(f"Student ID {i+1}: ")
        
        print(f"\nCapturing {sid}... Press SPACE")
        cap = cv2.VideoCapture(0)
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            face = service.detect_single_face(frame)
            if face:
                x, y, w, h = face['box']
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            
            cv2.putText(frame, sid, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            cv2.imshow('Register', frame)
            
            if cv2.waitKey(1) == 32 and face:  # space
                cropped = service.crop_detected_face(frame, face['box'])
                emb = service.generate_embedding(cropped)
                if emb:
                    registered.append({"student_id": sid, "embedding": emb})
                    cv2.imwrite(f"{TEST_DIR}/{sid}_reg.jpg", frame)
                    print(f"Registered {sid}")
                    break
        
        cap.release()
        cv2.destroyAllWindows()
    
    # test recognition
    print(f"\nRegistered {len(registered)} students")
    input("Press ENTER to test...")
    
    results = []
    
    for student in registered:
        sid = student['student_id']
        print(f"\nTesting {sid}... 5 captures")
        
        cap = cv2.VideoCapture(0)
        count = 0
        
        while count < 5:
            ret, frame = cap.read()
            if not ret:
                break
            
            cv2.putText(frame, f"{sid} ({count+1}/5)", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            cv2.imshow('Test', frame)
            
            if cv2.waitKey(1) == 32:  # space
                result = service.recognize_single_face(frame, registered)
                count += 1
                
                if result['match_found']:
                    got = result['student_id']
                    conf = result['confidence']
                    status = "OK" if got == sid else "WRONG"
                    print(f"  {count}. {status} - {got} ({conf:.1f}%)")
                    results.append(got == sid)
                else:
                    print(f"  {count}. NO MATCH")
                    results.append(False)
                
                cv2.imwrite(f"{TEST_DIR}/{sid}_test_{count}.jpg", frame)
        
        cap.release()
        cv2.destroyAllWindows()
    
    # report
    print("\n" + "="*50)
    correct = sum(results)
    total = len(results)
    accuracy = (correct / total * 100) if total > 0 else 0
    
    print(f"Correct: {correct}/{total}")
    print(f"Accuracy: {accuracy:.1f}%")
    print(f"Status: {'PASS' if accuracy >= 80 else 'FAIL'} (target: 80%)")
    print("="*50)

if __name__ == "__main__":
    main()
