"""
Camera Service - OpenCV Webcam Operations
-----------------------------------------
Responsible for:
- Initializing and managing webcam connection
- Capturing frames from webcam
- Processing video stream
- Converting image formats (BGR to RGB)
- Saving captured images
- Real-time frame capture loop for attendance sessions

Author: Viraj
Date: Week 01 Day 3
Updated: Week 03 Day 11 - Added frame capture loop
"""

import cv2
import numpy as np
from typing import Tuple, Optional, Callable
import os
from datetime import datetime
import time
import threading


class CameraService:
    """
    Service class for handling webcam operations using OpenCV
    """
    
    def __init__(self, camera_id: int = 0):
        """
        Initialize the camera service
        
        Args:
            camera_id (int): Camera device ID (default: 0 for primary webcam)
        """
        self.camera_id = camera_id
        self.cap = None
        self.is_active = False
        self.loop_active = False
        self.loop_thread = None
        
    def start_camera(self) -> bool:
        """
        Initialize and start the webcam
        
        Returns:
            bool: True if camera started successfully, False otherwise
        """
        try:
            self.cap = cv2.VideoCapture(self.camera_id)
            
            if not self.cap.isOpened():
                print(f"Error: Could not open camera {self.camera_id}")
                return False
            
            # Set camera properties for better quality
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            self.cap.set(cv2.CAP_PROP_FPS, 30)
            
            self.is_active = True
            print(f"Camera {self.camera_id} started successfully")
            return True
            
        except Exception as e:
            print(f"Error starting camera: {str(e)}")
            return False
    
    def capture_frame(self) -> Tuple[bool, Optional[np.ndarray]]:
        """
        Capture a single frame from the webcam
        
        Returns:
            Tuple[bool, Optional[np.ndarray]]: 
                - Success status (True/False)
                - Captured frame as numpy array (or None if failed)
        """
        if self.cap is None or not self.is_active:
            print("Error: Camera not initialized. Call start_camera() first.")
            return False, None
        
        try:
            success, frame = self.cap.read()
            
            if not success:
                print("Error: Failed to capture frame")
                return False, None
            
            return True, frame
            
        except Exception as e:
            print(f"Error capturing frame: {str(e)}")
            return False, None
    
    def capture_multiple_frames(self, num_frames: int = 5) -> list:
        """
        Capture multiple frames from webcam
        
        Args:
            num_frames (int): Number of frames to capture
            
        Returns:
            list: List of captured frames
        """
        frames = []
        
        for i in range(num_frames):
            success, frame = self.capture_frame()
            if success:
                frames.append(frame)
        
        return frames
    
    def release_camera(self):
        """
        Release the webcam resources
        """
        # stop loop if running
        if self.loop_active:
            self.stop_capture_loop()
        
        if self.cap is not None:
            self.cap.release()
            self.is_active = False
            print("Camera released successfully")
    
    def save_image(self, frame: np.ndarray, path: str, filename: Optional[str] = None) -> str:
        """
        Save a captured frame as an image file
        
        Args:
            frame (np.ndarray): Frame to save
            path (str): Directory path to save the image
            filename (Optional[str]): Custom filename (if None, generates timestamp-based name)
            
        Returns:
            str: Full path to the saved image
        """
        try:
            # Create directory if it doesn't exist
            os.makedirs(path, exist_ok=True)
            
            # Generate filename if not provided
            if filename is None:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"frame_{timestamp}.jpg"
            
            # Ensure filename has .jpg extension
            if not filename.endswith(('.jpg', '.jpeg', '.png')):
                filename += '.jpg'
            
            full_path = os.path.join(path, filename)
            
            # Save the image
            cv2.imwrite(full_path, frame)
            print(f"Image saved successfully: {full_path}")
            
            return full_path
            
        except Exception as e:
            print(f"Error saving image: {str(e)}")
            return ""
    
    def convert_to_rgb(self, frame: np.ndarray) -> np.ndarray:
        """
        Convert BGR image to RGB format
        (OpenCV uses BGR by default, but most AI models expect RGB)
        
        Args:
            frame (np.ndarray): BGR image
            
        Returns:
            np.ndarray: RGB image
        """
        try:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            return rgb_frame
        except Exception as e:
            print(f"Error converting to RGB: {str(e)}")
            return frame
    
    def convert_to_grayscale(self, frame: np.ndarray) -> np.ndarray:
        """
        Convert image to grayscale
        
        Args:
            frame (np.ndarray): Color image
            
        Returns:
            np.ndarray: Grayscale image
        """
        try:
            gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            return gray_frame
        except Exception as e:
            print(f"Error converting to grayscale: {str(e)}")
            return frame
    
    def resize_frame(self, frame: np.ndarray, width: int, height: int) -> np.ndarray:
        """
        Resize frame to specified dimensions
        
        Args:
            frame (np.ndarray): Original frame
            width (int): Target width
            height (int): Target height
            
        Returns:
            np.ndarray: Resized frame
        """
        try:
            resized = cv2.resize(frame, (width, height))
            return resized
        except Exception as e:
            print(f"Error resizing frame: {str(e)}")
            return frame
    
    def get_frame_dimensions(self, frame: np.ndarray) -> Tuple[int, int]:
        """
        Get dimensions of a frame
        
        Args:
            frame (np.ndarray): Input frame
            
        Returns:
            Tuple[int, int]: (height, width)
        """
        return frame.shape[:2]
    
    def is_camera_active(self) -> bool:
        """
        Check if camera is currently active
        
        Returns:
            bool: True if camera is active, False otherwise
        """
        return self.is_active and self.cap is not None and self.cap.isOpened()
    
    def start_capture_loop(self, callback: Callable[[np.ndarray], None], fps: int = 1) -> bool:
        """
        Start real-time frame capture loop at specified fps
        Used for attendance marking sessions
        
        Args:
            callback (Callable): Function to call with each captured frame
            fps (int): Frames per second to capture (default: 1)
            
        Returns:
            bool: True if loop started successfully, False otherwise
            
        Example:
            def process_frame(frame):
                # detect faces, recognize students, mark attendance
                print(f"Processing frame: {frame.shape}")
            
            camera.start_capture_loop(process_frame, fps=1)
        """
        if not self.is_camera_active():
            print("Error: Camera not active. Call start_camera() first.")
            return False
        
        if self.loop_active:
            print("Warning: Capture loop already running")
            return False
        
        self.loop_active = True
        self.loop_thread = threading.Thread(
            target=self._capture_loop_worker,
            args=(callback, fps),
            daemon=True
        )
        self.loop_thread.start()
        print(f"Frame capture loop started at {fps} fps")
        return True
    
    def _capture_loop_worker(self, callback: Callable[[np.ndarray], None], fps: int):
        """
        Worker thread for frame capture loop
        Internal method - do not call directly
        
        Args:
            callback (Callable): Function to process each frame
            fps (int): Target frames per second
        """
        interval = 1.0 / fps  # time between frames in seconds
        
        print(f"Capture loop worker started (interval: {interval}s)")
        
        while self.loop_active:
            start_time = time.time()
            
            # capture frame
            success, frame = self.capture_frame()
            
            if success and frame is not None:
                try:
                    # call the callback function with the frame
                    callback(frame)
                except Exception as e:
                    print(f"Error in frame callback: {str(e)}")
            else:
                print("Warning: Failed to capture frame in loop")
            
            # wait for next frame based on fps
            elapsed = time.time() - start_time
            sleep_time = max(0, interval - elapsed)
            time.sleep(sleep_time)
        
        print("Capture loop worker stopped")
    
    def stop_capture_loop(self):
        """
        Stop the frame capture loop
        """
        if not self.loop_active:
            print("Warning: Capture loop not running")
            return
        
        print("Stopping capture loop...")
        self.loop_active = False
        
        # wait for thread to finish
        if self.loop_thread is not None:
            self.loop_thread.join(timeout=2.0)
            self.loop_thread = None
        
        print("Capture loop stopped")
    
    def is_loop_active(self) -> bool:
        """
        Check if frame capture loop is currently running
        
        Returns:
            bool: True if loop is active, False otherwise
        """
        return self.loop_active
    
    def __del__(self):
        """
        Destructor to ensure camera is released
        """
        self.release_camera()


# Convenience function for quick testing
def test_camera_service():
    """
    Test function to verify camera service functionality
    """
    print("=== Testing Camera Service ===")
    
    # Initialize camera service
    camera = CameraService(camera_id=0)
    
    # Start camera
    if not camera.start_camera():
        print("Failed to start camera. Exiting.")
        return
    
    # Capture a frame
    print("\nCapturing frame...")
    success, frame = camera.capture_frame()
    
    if success:
        print(f"✓ Frame captured successfully")
        print(f"  Frame shape: {frame.shape}")
        print(f"  Frame dimensions: {camera.get_frame_dimensions(frame)}")
        
        # Convert to RGB
        rgb_frame = camera.convert_to_rgb(frame)
        print(f"✓ Converted to RGB: {rgb_frame.shape}")
        
        # Save the frame
        save_path = camera.save_image(frame, "./test_captures")
        if save_path:
            print(f"✓ Image saved: {save_path}")
        
        # Test multiple frame capture
        print("\nCapturing 3 frames...")
        frames = camera.capture_multiple_frames(3)
        print(f"✓ Captured {len(frames)} frames")
        
    else:
        print("✗ Failed to capture frame")
    
    # Release camera
    camera.release_camera()
    print("\n=== Test Complete ===")


if __name__ == "__main__":
    # Run test if this file is executed directly
    test_camera_service()
