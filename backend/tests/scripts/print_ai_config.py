"""Viraj Jayasiri - Week 06 Day 25
Print all current AI config values to verify env var overrides are working."""

import sys
import os

# add backend root to path so imports work when run from backend/ or tests/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from app.services.ai.ai_config import (
    FACE_MODEL_NAME,
    FACE_DETECTION_MIN_CONFIDENCE,
    SIMILARITY_THRESHOLD,
    LOW_CONFIDENCE_FLAG_THRESHOLD,
    FACE_CROP_PADDING,
    FACE_INPUT_WIDTH,
    FACE_INPUT_HEIGHT,
    DEFAULT_CAMERA_ID,
    CAMERA_FRAME_WIDTH,
    CAMERA_FRAME_HEIGHT,
    CAMERA_FPS,
    ATTENDANCE_CAPTURE_FPS,
    FACE_IMAGES_DIR,
    TEMP_DIR,
    DETECTION_DOWNSCALE_RATIO,
    DETECTION_FRAME_SKIP,
    QUALITY_BLUR_THRESHOLD,
    QUALITY_BRIGHTNESS_MIN,
    QUALITY_BRIGHTNESS_MAX,
    QUALITY_MIN_FACE_SIZE,
)


def print_section(title):
    print(f"\n  {title}")
    print(f"  {'-' * len(title)}")


def main():
    print("--- AI Config Current Values ---")

    print_section("Model Settings")
    print(f"  FACE_MODEL_NAME                : {FACE_MODEL_NAME}")
    print(f"  FACE_DETECTION_MIN_CONFIDENCE  : {FACE_DETECTION_MIN_CONFIDENCE}")

    print_section("Recognition Thresholds")
    print(f"  SIMILARITY_THRESHOLD           : {SIMILARITY_THRESHOLD}")
    print(f"  LOW_CONFIDENCE_FLAG_THRESHOLD  : {LOW_CONFIDENCE_FLAG_THRESHOLD}")

    print_section("Face Cropping")
    print(f"  FACE_CROP_PADDING              : {FACE_CROP_PADDING}")

    print_section("Image Preprocessing")
    print(f"  FACE_INPUT_WIDTH               : {FACE_INPUT_WIDTH}")
    print(f"  FACE_INPUT_HEIGHT              : {FACE_INPUT_HEIGHT}")

    print_section("Camera / Frame Capture")
    print(f"  DEFAULT_CAMERA_ID              : {DEFAULT_CAMERA_ID}")
    print(f"  CAMERA_FRAME_WIDTH             : {CAMERA_FRAME_WIDTH}")
    print(f"  CAMERA_FRAME_HEIGHT            : {CAMERA_FRAME_HEIGHT}")
    print(f"  CAMERA_FPS                     : {CAMERA_FPS}")
    print(f"  ATTENDANCE_CAPTURE_FPS         : {ATTENDANCE_CAPTURE_FPS}")

    print_section("Storage Paths")
    print(f"  FACE_IMAGES_DIR                : {FACE_IMAGES_DIR}")
    print(f"  TEMP_DIR                       : {TEMP_DIR}")

    print_section("Speed Optimization (Day 22)")
    print(f"  DETECTION_DOWNSCALE_RATIO      : {DETECTION_DOWNSCALE_RATIO}")
    print(f"  DETECTION_FRAME_SKIP           : {DETECTION_FRAME_SKIP}")

    print_section("Face Quality Checks (Day 23)")
    print(f"  QUALITY_BLUR_THRESHOLD         : {QUALITY_BLUR_THRESHOLD}")
    print(f"  QUALITY_BRIGHTNESS_MIN         : {QUALITY_BRIGHTNESS_MIN}")
    print(f"  QUALITY_BRIGHTNESS_MAX         : {QUALITY_BRIGHTNESS_MAX}")
    print(f"  QUALITY_MIN_FACE_SIZE          : {QUALITY_MIN_FACE_SIZE}")

    print()


if __name__ == "__main__":
    main()
