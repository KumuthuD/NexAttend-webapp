"""
Multi-Face Detection Test
Tests optimized FaceDetector with multiple faces in frame.
Validates performance metrics and quality checks.

Viraj Jayasiri
Week 02 Day 6
"""

import cv2
import sys
import os
import time
from typing import List

# add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.face_detector import FaceDetector


class MultiFaceDetectionTest:
    """
    Test optimized face detector with multiple faces
    """
    
    def __init__(self):
        print("=" * 70)
        print("Multi-Face Detection Test")
        print("Testing optimized FaceDetector for Day 6")
        print("=" * 70)
        print()
        
        # initialize detector with optimized settings
        print("Initializing optimized FaceDetector...")
        self.detector = FaceDetector(
            min_face_size=20,
            scale_factor=0.709,
            min_confidence=0.90
        )
        
        # metrics
        self.total_frames = 0
        self.total_faces = 0
        self.max_faces = 0
        self.processing_times = []
        
        print("Detector initialized")
        print()
    
    def test_live_webcam(self):
        """
        Test with live webcam feed
        """
        print("Starting live webcam test...")
        print()
        print("Controls:")
        print("  Press 'q' to QUIT")
        print("  Press 's' to show STATISTICS")
        print("  Press 'c' to CROP all faces")
        print()
        
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("Error: Cannot open webcam")
            return
        
        # set camera properties
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        print("Camera opened successfully")
        print("-" * 70)
        
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    print("Failed to capture frame")
                    break
                
                self.total_frames += 1
                
                # measure detection time
                start_time = time.time()
                faces = self.detector.detect_faces(
                    frame,
                    filter_confidence=True,
                    sort_by_size=True
                )
                end_time = time.time()
                
                processing_time = (end_time - start_time) * 1000  # convert to ms
                self.processing_times.append(processing_time)
                
                # update metrics
                face_count = len(faces)
                self.total_faces += face_count
                if face_count > self.max_faces:
                    self.max_faces = face_count
                
                # draw results
                display_frame = self.detector.draw_faces(frame, faces)
                
                # add performance info
                fps = 1000 / processing_time if processing_time > 0 else 0
                perf_text = f"Processing: {processing_time:.1f}ms ({fps:.1f} FPS)"
                cv2.putText(display_frame, perf_text, (10, 60),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)
                
                # show frame
                cv2.imshow('Multi-Face Detection Test', display_frame)
                
                # handle keyboard
                key = cv2.waitKey(1) & 0xFF
                
                if key == ord('q'):
                    print("\nQuit requested")
                    break
                elif key == ord('s'):
                    self._print_statistics()
                elif key == ord('c') and faces:
                    self._test_crop_faces(frame, faces)
        
        except KeyboardInterrupt:
            print("\n\nInterrupted by user")
        
        finally:
            cap.release()
            cv2.destroyAllWindows()
            self._print_final_report()
    
    def test_batch_processing(self, num_frames: int = 10):
        """
        Test batch processing capability
        """
        print("\n" + "=" * 70)
        print("Testing Batch Processing")
        print("=" * 70)
        
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("Error: Cannot open webcam")
            return
        
        # capture frames
        print(f"Capturing {num_frames} frames...")
        frames = []
        for i in range(num_frames):
            ret, frame = cap.read()
            if ret:
                frames.append(frame)
        
        cap.release()
        
        if not frames:
            print("No frames captured")
            return
        
        print(f"Captured {len(frames)} frames")
        print("Processing batch...")
        
        # process batch
        start_time = time.time()
        results = self.detector.detect_faces_batch(frames, filter_confidence=True)
        end_time = time.time()
        
        total_time = (end_time - start_time) * 1000
        avg_time = total_time / len(frames)
        
        # analyze results
        total_faces_batch = sum(len(faces) for faces in results)
        
        print(f"\nBatch Processing Results:")
        print(f"  Total frames: {len(frames)}")
        print(f"  Total time: {total_time:.1f}ms")
        print(f"  Average per frame: {avg_time:.1f}ms")
        print(f"  Total faces detected: {total_faces_batch}")
        print(f"  Average faces per frame: {total_faces_batch / len(frames):.1f}")
    
    def test_face_quality_validation(self):
        """
        Test face quality validation on detected faces
        """
        print("\n" + "=" * 70)
        print("Testing Face Quality Validation")
        print("=" * 70)
        print("Position your face in view and press 'v' to validate quality")
        print("Press 'q' to return to main test")
        print()
        
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            return
        
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                faces = self.detector.detect_faces(frame)
                display_frame = self.detector.draw_faces(frame, faces)
                
                cv2.imshow('Quality Validation Test', display_frame)
                
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q'):
                    break
                elif key == ord('v') and faces:
                    # crop and validate each face
                    cropped_faces = self.detector.crop_faces(frame, faces)
                    
                    print(f"\nValidating {len(cropped_faces)} face(s):")
                    for idx, face_img in enumerate(cropped_faces):
                        is_valid, reason = self.detector.validate_face_quality(face_img)
                        status = "PASS" if is_valid else "FAIL"
                        print(f"  Face #{idx+1}: {status} - {reason}")
        
        finally:
            cap.release()
            cv2.destroyAllWindows()
    
    def test_overlap_filtering(self):
        """
        Test overlapping face detection filtering
        """
        print("\n" + "=" * 70)
        print("Testing Overlap Filtering")
        print("=" * 70)
        
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            return
        
        print("Capturing frame for overlap test...")
        ret, frame = cap.read()
        cap.release()
        
        if not ret:
            print("Failed to capture frame")
            return
        
        # detect faces without filtering
        faces_all = self.detector.detect_faces(frame, filter_confidence=False)
        
        # filter overlapping faces
        faces_filtered = self.detector.filter_overlapping_faces(faces_all, overlap_threshold=0.5)
        
        print(f"\nOverlap Filtering Results:")
        print(f"  Before filtering: {len(faces_all)} faces")
        print(f"  After filtering: {len(faces_filtered)} faces")
        print(f"  Removed: {len(faces_all) - len(faces_filtered)} overlapping detections")
        
        # visualize
        frame_before = self.detector.draw_faces(frame.copy(), faces_all)
        frame_after = self.detector.draw_faces(frame.copy(), faces_filtered)
        
        cv2.imshow('Before Filtering', frame_before)
        cv2.imshow('After Filtering', frame_after)
        print("\nPress any key to close windows...")
        cv2.waitKey(0)
        cv2.destroyAllWindows()
    
    def _test_crop_faces(self, frame, faces):
        """
        Test face cropping functionality
        """
        print(f"\nCropping {len(faces)} face(s)...")
        
        cropped_faces = self.detector.crop_faces(frame, faces, padding=0.2)
        
        for idx, cropped_face in enumerate(cropped_faces):
            h, w = cropped_face.shape[:2]
            print(f"  Face #{idx+1}: {w}x{h} pixels")
            
            # show cropped face
            cv2.imshow(f'Cropped Face #{idx+1}', cropped_face)
        
        print("Press any key to close cropped face windows...")
        cv2.waitKey(0)
        
        # close all cropped face windows
        for idx in range(len(cropped_faces)):
            cv2.destroyWindow(f'Cropped Face #{idx+1}')
    
    def _print_statistics(self):
        """
        Print current statistics
        """
        print("\n" + "-" * 70)
        print("Current Statistics:")
        print(f"  Frames processed: {self.total_frames}")
        print(f"  Total faces detected: {self.total_faces}")
        print(f"  Max faces in frame: {self.max_faces}")
        
        if self.processing_times:
            avg_time = sum(self.processing_times) / len(self.processing_times)
            min_time = min(self.processing_times)
            max_time = max(self.processing_times)
            
            print(f"  Avg processing time: {avg_time:.1f}ms")
            print(f"  Min processing time: {min_time:.1f}ms")
            print(f"  Max processing time: {max_time:.1f}ms")
            print(f"  Avg FPS: {1000/avg_time:.1f}")
        
        print("-" * 70)
    
    def _print_final_report(self):
        """
        Print final test report
        """
        print("\n" + "=" * 70)
        print("Final Test Report")
        print("=" * 70)
        print(f"Total frames processed: {self.total_frames}")
        print(f"Total faces detected: {self.total_faces}")
        print(f"Max faces in single frame: {self.max_faces}")
        
        if self.total_frames > 0:
            avg_faces = self.total_faces / self.total_frames
            print(f"Average faces per frame: {avg_faces:.2f}")
        
        if self.processing_times:
            avg_time = sum(self.processing_times) / len(self.processing_times)
            min_time = min(self.processing_times)
            max_time = max(self.processing_times)
            
            print(f"\nPerformance Metrics:")
            print(f"  Average processing time: {avg_time:.1f}ms")
            print(f"  Min processing time: {min_time:.1f}ms")
            print(f"  Max processing time: {max_time:.1f}ms")
            print(f"  Average FPS: {1000/avg_time:.1f}")
            
            # performance rating
            if avg_time < 100:
                rating = "EXCELLENT"
            elif avg_time < 200:
                rating = "GOOD"
            elif avg_time < 300:
                rating = "ACCEPTABLE"
            else:
                rating = "NEEDS OPTIMIZATION"
            
            print(f"  Performance rating: {rating}")
        
        print("=" * 70)
        print("\nTest completed successfully")


def main():
    """
    Main test runner
    """
    print("\n")
    print("*" * 70)
    print("NexAttend Multi-Face Detection Test Suite")
    print("Day 6: Face Detector Optimization")
    print("*" * 70)
    print()
    
    tester = MultiFaceDetectionTest()
    
    while True:
        print("\nSelect test to run:")
        print("  1. Live Webcam Test (main test)")
        print("  2. Batch Processing Test")
        print("  3. Face Quality Validation Test")
        print("  4. Overlap Filtering Test")
        print("  5. Exit")
        print()
        
        choice = input("Enter choice (1-5): ").strip()
        
        if choice == '1':
            tester.test_live_webcam()
        elif choice == '2':
            tester.test_batch_processing()
        elif choice == '3':
            tester.test_face_quality_validation()
        elif choice == '4':
            tester.test_overlap_filtering()
        elif choice == '5':
            print("\nExiting test suite")
            break
        else:
            print("Invalid choice, try again")


if __name__ == "__main__":
    main()
