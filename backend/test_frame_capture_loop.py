"""
Week 03 Day 11 - Viraj Jayasiri

Test script for frame capture loop functionality
Tests real-time frame capture at 1 fps for attendance sessions

This verifies:
1. Loop starts and runs at correct fps
2. Callback function receives frames
3. Loop can be stopped properly
4. Multiple frames captured over time
"""

import sys
import os
import time

# add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.ai.camera_service import CameraService


# global counter for testing
frame_count = 0
start_time = None


def process_frame(frame):
    """
    Callback function that processes each captured frame
    This simulates what the attendance service would do
    """
    global frame_count, start_time
    
    if start_time is None:
        start_time = time.time()
    
    frame_count += 1
    elapsed = time.time() - start_time
    
    print(f"[Frame {frame_count}] Captured at {elapsed:.2f}s - Shape: {frame.shape}")
    
    # in real attendance system this would:
    # - detect faces
    # - generate embeddings
    # - match against registered students
    # - mark attendance


def test_frame_capture_loop():
    """
    Test the frame capture loop at 1 fps
    """
    global frame_count, start_time
    
    print("=" * 70)
    print("Week 03 Day 11: Frame Capture Loop Test")
    print("Testing: Real-time frame capture at 1 fps")
    print("=" * 70)
    print()
    
    # initialize camera
    print("Step 1: Initializing Camera Service...")
    camera = CameraService(camera_id=0)
    
    # start camera
    print("Step 2: Starting webcam...")
    if not camera.start_camera():
        print("FAILED: Could not start camera")
        return
    print("Webcam started successfully")
    print()
    
    # start capture loop at 1 fps
    print("Step 3: Starting frame capture loop at 1 fps...")
    print("Will capture frames for 5 seconds...")
    print("-" * 70)
    
    success = camera.start_capture_loop(callback=process_frame, fps=1)
    
    if not success:
        print("FAILED: Could not start capture loop")
        camera.release_camera()
        return
    
    # let loop run for 5 seconds
    time.sleep(5)
    
    print("-" * 70)
    print()
    
    # stop the loop
    print("Step 4: Stopping capture loop...")
    camera.stop_capture_loop()
    print()
    
    # verify results
    print("Step 5: Verifying results...")
    print(f"Total frames captured: {frame_count}")
    print(f"Expected frames (1 fps x 5s): ~5 frames")
    print(f"Total time elapsed: {time.time() - start_time:.2f}s")
    
    if frame_count >= 4 and frame_count <= 6:
        print("SUCCESS: Frame capture loop working correctly")
    else:
        print("WARNING: Frame count outside expected range")
    
    print()
    
    # clean up
    print("Step 6: Releasing camera...")
    camera.release_camera()
    
    print()
    print("=" * 70)
    print("Test Complete")
    print("=" * 70)


def test_loop_control():
    """
    Test starting and stopping the loop multiple times
    """
    print()
    print("=" * 70)
    print("Additional Test: Loop Control")
    print("=" * 70)
    print()
    
    camera = CameraService(camera_id=0)
    
    if not camera.start_camera():
        print("FAILED: Could not start camera")
        return
    
    def simple_callback(frame):
        print(f"Frame received: {frame.shape}")
    
    # test starting loop
    print("Test 1: Starting loop...")
    assert camera.start_capture_loop(simple_callback, fps=1) == True
    assert camera.is_loop_active() == True
    time.sleep(2)
    
    # test stopping loop
    print("Test 2: Stopping loop...")
    camera.stop_capture_loop()
    assert camera.is_loop_active() == False
    time.sleep(1)
    
    # test restarting loop
    print("Test 3: Restarting loop...")
    assert camera.start_capture_loop(simple_callback, fps=1) == True
    time.sleep(2)
    camera.stop_capture_loop()
    
    camera.release_camera()
    
    print("SUCCESS: Loop control working correctly")
    print()


if __name__ == "__main__":
    # run main test
    test_frame_capture_loop()
    
    # run additional control test
    test_loop_control()
