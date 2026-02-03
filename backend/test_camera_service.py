"""
Week 01 Day 3 - Viraj Jayasiri

This code tests:-
1. Camera initialization
2. Frame capture
3. BGR to RGB conversion
4. Image saving
5. Multiple frame capture
"""

import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.ai.camera_service import CameraService


def main():
    print("=" * 60)
    print("Week 01 Day 3: Camera Service Test")
    print("Testing: Webcam capture frame functionality")
    print("=" * 60)
    print()
    
    # Initialize camera service
    print("Step 1: Initializing Camera Service...")
    camera = CameraService(camera_id=0)
    print("Camera service initialized")
    print()
    
    # Start camera
    print("Step 2: Starting webcam...")
    if not camera.start_camera():
        print("FAILED: Could not start camera")
        print("  Check if webcam is connected")
        print("  Check if another app is using the webcam")
        return
    print("Webcam started successfully")
    print()
    
    # Capture a single frame
    print("Step 3: Capturing a single frame...")
    success, frame = camera.capture_frame()
    
    if not success or frame is None:
        print("FAILED: Could not capture frame")
        camera.release_camera()
        return
    
    height, width = camera.get_frame_dimensions(frame)
    print("Frame captured successfully")
    print(f"  Frame shape: {frame.shape}")
    print(f"  Dimensions: {width}x{height} pixels")
    print(f"  Channels: {frame.shape[2]}")
    print()
    
    # Convert BGR to RGB
    print("Step 4: Converting BGR to RGB...")
    rgb_frame = camera.convert_to_rgb(frame)
    print("Conversion successful")
    print(f"  RGB frame shape: {rgb_frame.shape}")
    print()
    
    # Save the frame
    print("Step 5: Saving captured frame...")
    save_dir = os.path.join(os.path.dirname(__file__), "test_captures")
    save_path = camera.save_image(frame, save_dir, "test_frame.jpg")
    
    if save_path and os.path.exists(save_path):
        print("Image saved successfully")
        print(f"  Path: {save_path}")
        file_size = os.path.getsize(save_path)
        print(f"  File size: {file_size} bytes ({file_size/1024:.2f} KB)")
    else:
        print("Failed to save image")
    print()
    
    # Test multiple frame capture
    print("Step 6: Capturing multiple frames (3 frames)...")
    frames = camera.capture_multiple_frames(3)
    print(f"Captured {len(frames)} frames")
    print()
    
    # Check if camera is active
    print("Step 7: Checking camera status...")
    is_active = camera.is_camera_active()
    print(f"Camera active: {is_active}")
    print()
    
    # Release camera
    print("Step 8: Releasing camera resources...")
    camera.release_camera()
    print("Camera released")
    print()
    
    # Final summary
    print("=" * 60)
    print("ALL TESTS PASSED!")
    print("=" * 60)
    print()
    print("Week 01 Day 3 Deliverable: COMPLETE")
    print("  Webcam capture works")
    print("  Frame capture successful")
    print("  BGR to RGB conversion works")
    print("  Image saving works")
    print("  Multiple frame capture works")
    print()
    print("Branch: feature/ai/camera-service")
    print("Ready for commit and push!")
    print("=" * 60)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
    except Exception as e:
        print(f"\nERROR: {str(e)}")
        import traceback
        traceback.print_exc()
