"""
Simplified Pipeline Test-
Tests basic integration without requiring TensorFlow/MTCNN
Uses OpenCV's Haar Cascade for face detection instead

Viraj Jayasiri
Week 01 Day 5
"""

import cv2
import numpy as np
import sys
import os
from datetime import datetime

# Add parent directories to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.services.ai.camera_service import CameraService
from app.services.ai.image_processor import crop_image, convert_bgr_to_rgb


class SimplePipelineTest:
    """
    Simplified Pipeline Test using Haar Cascade
    Tests: Camera - Face Detection (Haar) - Face Cropping
    """
    
    def __init__(self, output_dir: str = "test_captures/cropped_faces_simple"):
        print("=" * 70)
        print("NexAttend - Simplified Pipeline Test (Haar Cascade)")
        print("Week 1 Day 5: Camera - Detect - Crop Face")
        print("=" * 70)
        print()
        
        # Initialize camera
        print("Initializing Camera Service...")
        self.camera = CameraService(camera_id=0)
        
        # Initialize Haar Cascade detector (built into OpenCV)
        print("Loading Haar Cascade Face Detector...")
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        
        if self.face_cascade.empty():
            raise RuntimeError("Failed to load Haar Cascade classifier")
        
        # Setup output directory
        self.output_dir = os.path.join(os.path.dirname(__file__), '..', '..', output_dir)
        os.makedirs(self.output_dir, exist_ok=True)
        print(f"Output directory: {self.output_dir}")
        
        self.frames_processed = 0
        self.faces_detected = 0
        self.faces_cropped = 0
        
        print()
        print("All components initialized successfully!")
        print()
    
    def detect_faces_haar(self, frame: np.ndarray):
        """
        Detect faces using Haar Cascade (OpenCV built-in)
        
        Returns:
            list: List of bounding boxes [x, y, w, h]
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray, 
            scaleFactor=1.1, 
            minNeighbors=5, 
            minSize=(30, 30)
        )
        return faces
    
    def run_live_test(self):
        print("Starting live camera test...")
        print()
        print("Controls:")
        print("  Press 'c' to CAPTURE and CROP faces")
        print("  Press 'q' to QUIT")
        print()
        
        if not self.camera.start_camera():
            print("Failed to start camera")
            return
        
        print("Camera started! Processing frames...")
        print("-" * 70)
        
        try:
            while True:
                # 1. CAPTURE FRAME
                success, frame = self.camera.capture_frame()
                if not success:
                    continue
                
                self.frames_processed += 1
                
                # 2. DETECT FACES
                faces = self.detect_faces_haar(frame)
                
                # Create display frame
                display_frame = frame.copy()
                
                if len(faces) > 0:
                    self.faces_detected += len(faces)
                    
                    # Draw detection results
                    for idx, (x, y, w, h) in enumerate(faces):
                        # Draw rectangle
                        cv2.rectangle(display_frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                        
                        # Draw label
                        text = f"Face {idx+1}"
                        cv2.putText(display_frame, text, (x, y - 10),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
                    
                    # Display count
                    count_text = f"Faces detected: {len(faces)}"
                    cv2.putText(display_frame, count_text, (10, 30),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                else:
                    cv2.putText(display_frame, "No faces detected", (10, 30),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                
                # Show frame
                cv2.imshow('Simplified Pipeline Test (C=Capture, Q=Quit)', display_frame)
                
                # Handle key presses
                key = cv2.waitKey(1) & 0xFF
                
                if key == ord('q'):
                    print("\nQuit requested")
                    break
                elif key == ord('c') and len(faces) > 0:
                    # 3. CROP FACES
                    print(f"\nCapturing {len(faces)} face(s)...")
                    self._crop_and_save_faces(frame, faces)
        
        except KeyboardInterrupt:
            print("\n\nInterrupted")
        
        finally:
            self.camera.release_camera()
            cv2.destroyAllWindows()
            self._print_summary()
    
    def _crop_and_save_faces(self, frame: np.ndarray, faces):
        """Crop and save detected faces"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        for idx, (x, y, w, h) in enumerate(faces):
            try:
                # Add padding
                padding = int(max(w, h) * 0.1)
                x_pad = max(0, x - padding)
                y_pad = max(0, y - padding)
                w_pad = w + 2 * padding
                h_pad = h + 2 * padding
                
                # 3. CROP FACE
                cropped_face = crop_image(frame, x_pad, y_pad, w_pad, h_pad)
                
                # Save
                filename = f"face_{timestamp}_{idx+1}.jpg"
                filepath = os.path.join(self.output_dir, filename)
                cv2.imwrite(filepath, cropped_face)
                
                self.faces_cropped += 1
                print(f"  Saved: {filename} ({cropped_face.shape[1]}x{cropped_face.shape[0]})")
                
            except Exception as e:
                print(f"  Error: {str(e)}")
    
    def _print_summary(self):
        print()
        print("=" * 70)
        print("Test Summary")
        print("=" * 70)
        print(f"Frames processed:  {self.frames_processed}")
        print(f"Faces detected:    {self.faces_detected}")
        print(f"Faces cropped:     {self.faces_cropped}")
        print(f"Output directory:  {self.output_dir}")
        print("=" * 70)
        print()
        print("Pipeline test completed!")
        print("Pipeline: Camera - Detect - Crop")
        print()


def run_single_test():
    """Quick single-frame test"""
    print("Running single-frame test...\n")
    
    tester = SimplePipelineTest()
    
    if not tester.camera.start_camera():
        print("Failed to start camera")
        return
    
    success, frame = tester.camera.capture_frame()
    if not success:
        print("Failed to capture frame")
        tester.camera.release_camera()
        return
    
    print(f"Frame captured: {frame.shape}")
    
    faces = tester.detect_faces_haar(frame)
    print(f"Detected {len(faces)} face(s)")
    
    if len(faces) > 0:
        tester._crop_and_save_faces(frame, faces)
        print(f"Cropped and saved {len(faces)} face(s)")
    else:
        print("No faces detected")
    
    tester.camera.release_camera()
    tester._print_summary()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Simplified Pipeline Test (Haar Cascade)")
    parser.add_argument('--mode', choices=['live', 'single'], default='live',
                        help='Test mode: live or single')
    
    args = parser.parse_args()
    
    if args.mode == 'live':
        tester = SimplePipelineTest()
        tester.run_live_test()
    else:
        run_single_test()
