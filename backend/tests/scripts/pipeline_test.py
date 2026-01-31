"""
Full AI Pipeline Test - Week 1 Day 5
====================================
Test the complete pipeline: Camera → Detect → Crop Face

This script integrates:
1. CameraService - Capture frames from webcam
2. FaceDetector (MTCNN) - Detect faces in frames
3. ImageProcessor - Crop detected faces

Author: Viraj
Date: Week 01 Day 5
Branch: feature/ai/pipeline-test
"""

import cv2
import numpy as np
import sys
import os
from datetime import datetime

# Add parent directories to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.services.ai.camera_service import CameraService
from app.services.ai.image_processor import crop_image, convert_bgr_to_rgb
from app.services.face_detector import FaceDetector


class PipelineTest:
    """
    Full AI Pipeline Test Class
    Tests: Camera → Face Detection → Face Cropping
    """
    
    def __init__(self, output_dir: str = "test_captures/cropped_faces"):
        """
        Initialize pipeline test components
        
        Args:
            output_dir (str): Directory to save cropped faces
        """
        print("=" * 70)
        print("NexAttend - Full AI Pipeline Test")
        print("Week 1 Day 5: Camera → Detect → Crop Face")
        print("=" * 70)
        print()
        
        # Initialize components
        print("📷 Initializing Camera Service...")
        self.camera = CameraService(camera_id=0)
        
        print("🔍 Initializing Face Detector (MTCNN)...")
        self.detector = FaceDetector(min_face_size=40)
        
        print("✂️  Image Processor ready for cropping...")
        
        # Setup output directory
        self.output_dir = os.path.join(os.path.dirname(__file__), '..', '..', output_dir)
        os.makedirs(self.output_dir, exist_ok=True)
        print(f"💾 Output directory: {self.output_dir}")
        
        # Statistics
        self.frames_processed = 0
        self.faces_detected = 0
        self.faces_cropped = 0
        
        print()
        print("✅ All components initialized successfully!")
        print()
    
    def run_live_test(self):
        """
        Run live pipeline test with webcam feed
        Shows real-time detection and allows manual capture
        """
        print("Starting live camera test...")
        print()
        print("Controls:")
        print("  📸 Press 'c' to CAPTURE and CROP faces")
        print("  🛑 Press 'q' to QUIT")
        print()
        
        # Start camera
        if not self.camera.start_camera():
            print("❌ Failed to start camera. Exiting.")
            return
        
        print("🎥 Camera started! Processing frames...")
        print("-" * 70)
        
        try:
            while True:
                # 1. CAPTURE FRAME
                success, frame = self.camera.capture_frame()
                if not success:
                    print("⚠️  Failed to capture frame")
                    continue
                
                self.frames_processed += 1
                
                # 2. DETECT FACES
                # Note: FaceDetector already converts BGR to RGB internally
                faces = self.detector.detect_faces(frame)
                
                # Create annotated frame for display
                display_frame = frame.copy()
                
                if len(faces) > 0:
                    self.faces_detected += len(faces)
                    
                    # Draw detection results on display frame
                    for idx, face in enumerate(faces):
                        x, y, width, height = face['box']
                        confidence = face['confidence']
                        
                        # Draw bounding box (Green)
                        cv2.rectangle(display_frame, (x, y), (x + width, y + height), (0, 255, 0), 2)
                        
                        # Draw confidence score
                        text = f"Face {idx+1}: {confidence:.2f}"
                        cv2.putText(display_frame, text, (x, y - 10),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
                        
                        # Draw facial landmarks (eyes, nose, mouth)
                        if 'keypoints' in face:
                            for key, point in face['keypoints'].items():
                                cv2.circle(display_frame, point, 3, (0, 0, 255), -1)
                    
                    # Display face count
                    count_text = f"Faces detected: {len(faces)}"
                    cv2.putText(display_frame, count_text, (10, 30),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                else:
                    # Display "No faces" message
                    cv2.putText(display_frame, "No faces detected", (10, 30),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                
                # Show frame
                cv2.imshow('NexAttend - Pipeline Test (Press C to Capture, Q to Quit)', display_frame)
                
                # Handle key presses
                key = cv2.waitKey(1) & 0xFF
                
                if key == ord('q'):
                    print("\n🛑 Quit requested. Stopping...")
                    break
                
                elif key == ord('c') and len(faces) > 0:
                    # 3. CROP FACES when 'c' is pressed
                    print(f"\n📸 Capturing frame with {len(faces)} face(s)...")
                    self._crop_and_save_faces(frame, faces)
        
        except KeyboardInterrupt:
            print("\n\n⚠️  Interrupted by user")
        
        finally:
            # Cleanup
            self.camera.release_camera()
            cv2.destroyAllWindows()
            self._print_summary()
    
    def _crop_and_save_faces(self, frame: np.ndarray, faces: list):
        """
        Crop detected faces and save them to disk
        
        Args:
            frame (np.ndarray): Original frame (BGR)
            faces (list): List of detected faces from MTCNN
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        for idx, face in enumerate(faces):
            try:
                # Get bounding box coordinates
                x, y, width, height = face['box']
                confidence = face['confidence']
                
                # Add padding to crop (10% on each side)
                padding = int(max(width, height) * 0.1)
                x_pad = max(0, x - padding)
                y_pad = max(0, y - padding)
                w_pad = width + 2 * padding
                h_pad = height + 2 * padding
                
                # 3. CROP FACE using image_processor
                cropped_face = crop_image(frame, x_pad, y_pad, w_pad, h_pad)
                
                # Generate filename
                filename = f"face_{timestamp}_{idx+1}_conf{confidence:.2f}.jpg"
                filepath = os.path.join(self.output_dir, filename)
                
                # Save cropped face
                cv2.imwrite(filepath, cropped_face)
                
                self.faces_cropped += 1
                
                print(f"  ✅ Saved: {filename} ({cropped_face.shape[1]}x{cropped_face.shape[0]})")
                
            except Exception as e:
                print(f"  ❌ Error cropping face {idx+1}: {str(e)}")
    
    def _print_summary(self):
        """
        Print test summary statistics
        """
        print()
        print("=" * 70)
        print("Test Summary")
        print("=" * 70)
        print(f"Total frames processed:  {self.frames_processed}")
        print(f"Total faces detected:    {self.faces_detected}")
        print(f"Total faces cropped:     {self.faces_cropped}")
        print(f"Output directory:        {self.output_dir}")
        print("=" * 70)
        print()
        print("✅ Pipeline test completed successfully!")
        print()
        print("Pipeline: Camera ✓ → Detect ✓ → Crop ✓")
        print()


def run_single_frame_test():
    """
    Run a single-frame test (capture one frame, detect, crop)
    Useful for quick testing without live camera
    """
    print("Running single-frame test...")
    
    tester = PipelineTest()
    
    # Start camera
    if not tester.camera.start_camera():
        print("❌ Failed to start camera")
        return
    
    # Capture one frame
    success, frame = tester.camera.capture_frame()
    if not success:
        print("❌ Failed to capture frame")
        tester.camera.release_camera()
        return
    
    print(f"✅ Frame captured: {frame.shape}")
    
    # Detect faces
    faces = tester.detector.detect_faces(frame)
    print(f"✅ Detected {len(faces)} face(s)")
    
    if len(faces) > 0:
        # Crop and save
        tester._crop_and_save_faces(frame, faces)
        print(f"✅ Cropped and saved {len(faces)} face(s)")
    else:
        print("⚠️  No faces detected in frame")
    
    # Cleanup
    tester.camera.release_camera()
    tester._print_summary()


if __name__ == "__main__":
    """
    Main entry point
    """
    import argparse
    
    parser = argparse.ArgumentParser(description="NexAttend Full Pipeline Test")
    parser.add_argument('--mode', choices=['live', 'single'], default='live',
                        help='Test mode: live (webcam) or single (one frame)')
    
    args = parser.parse_args()
    
    if args.mode == 'live':
        tester = PipelineTest()
        tester.run_live_test()
    else:
        run_single_frame_test()
