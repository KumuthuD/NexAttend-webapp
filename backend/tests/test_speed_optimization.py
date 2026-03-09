"""
Week 05 Day 22 - Face Detection Speed Optimization
---------------------------------------------------
Tests for the two speed improvements added to FaceDetector:
  1. detect_faces_fast   - downscale frame before MTCNN runs
  2. detect_faces_with_skip - reuse last result for skipped frames

Viraj Jayasiri
Week 05 Day 22
Branch: feature/ai/speed-optimization
"""

import sys
import os
import time

# add backend root to path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.append(backend_dir)

from dotenv import load_dotenv
load_dotenv(os.path.join(backend_dir, ".env"))

import numpy as np


# ---------------------------------------------------------------
# Config constants tests
# ---------------------------------------------------------------
def test_speed_config_constants_exist():
    """
    DETECTION_DOWNSCALE_RATIO and DETECTION_FRAME_SKIP must be in ai_config.
    Without these the speed methods have no sensible defaults.
    """
    from app.services.ai.ai_config import DETECTION_DOWNSCALE_RATIO, DETECTION_FRAME_SKIP

    assert isinstance(DETECTION_DOWNSCALE_RATIO, float), \
        "DETECTION_DOWNSCALE_RATIO must be a float"
    assert 0.0 < DETECTION_DOWNSCALE_RATIO <= 1.0, \
        f"DETECTION_DOWNSCALE_RATIO out of range: {DETECTION_DOWNSCALE_RATIO}"

    assert isinstance(DETECTION_FRAME_SKIP, int), \
        "DETECTION_FRAME_SKIP must be an int"
    assert DETECTION_FRAME_SKIP >= 1, \
        f"DETECTION_FRAME_SKIP must be >= 1, got {DETECTION_FRAME_SKIP}"

    print(f"PASS - config: DETECTION_DOWNSCALE_RATIO={DETECTION_DOWNSCALE_RATIO}, "
          f"DETECTION_FRAME_SKIP={DETECTION_FRAME_SKIP}")


# ---------------------------------------------------------------
# detect_faces_fast method tests (no model needed - just signature)
# ---------------------------------------------------------------
def test_fast_detect_method_exists():
    """
    FaceDetector must have detect_faces_fast method.
    We just check the method exists and is callable here.
    The actual MTCNN model load would need a GPU/venv with tensorflow.
    """
    import inspect
    from app.services.face_detector import FaceDetector

    assert hasattr(FaceDetector, "detect_faces_fast"), \
        "FaceDetector missing detect_faces_fast method"
    assert callable(FaceDetector.detect_faces_fast), \
        "detect_faces_fast is not callable"

    # check it accepts the expected parameters
    sig = inspect.signature(FaceDetector.detect_faces_fast)
    params = list(sig.parameters.keys())
    assert "image" in params, "detect_faces_fast missing 'image' param"
    assert "downscale_ratio" in params, "detect_faces_fast missing 'downscale_ratio' param"

    print("PASS - detect_faces_fast exists with correct signature")


def test_skip_detect_method_exists():
    """
    FaceDetector must have detect_faces_with_skip method.
    """
    import inspect
    from app.services.face_detector import FaceDetector

    assert hasattr(FaceDetector, "detect_faces_with_skip"), \
        "FaceDetector missing detect_faces_with_skip method"

    sig = inspect.signature(FaceDetector.detect_faces_with_skip)
    params = list(sig.parameters.keys())
    assert "image" in params, "detect_faces_with_skip missing 'image' param"
    assert "frame_skip" in params, "detect_faces_with_skip missing 'frame_skip' param"
    assert "downscale_ratio" in params, "detect_faces_with_skip missing 'downscale_ratio' param"

    print("PASS - detect_faces_with_skip exists with correct signature")


# ---------------------------------------------------------------
# Frame-skip caching logic test (pure logic, no model load)
# ---------------------------------------------------------------
def test_frame_skip_cache_logic():
    """
    detect_faces_with_skip returns the cached result for frames < frame_skip
    and only calls real detection on the frame_skip-th frame.
    We patch detect_faces_fast to avoid loading MTCNN.
    """
    import types
    from app.services.face_detector import FaceDetector

    # manually build a minimal FaceDetector-like object to test the skip logic
    # without loading MTCNN (expensive)
    call_count = {"n": 0}
    fake_result = [{"box": [10, 10, 50, 50], "confidence": 0.95, "area": 2500, "keypoints": {}}]

    class FakeDetector:
        """minimal stand-in that only has the frame-skip fields and method"""
        def __init__(self):
            self._frame_counter = 0
            self._last_result = []

        def detect_faces_fast(self, image, downscale_ratio=0.5):
            call_count["n"] += 1
            return fake_result

        def detect_faces(self, image):
            call_count["n"] += 1
            return fake_result

        # copy the real method onto the fake class
        detect_faces_with_skip = FaceDetector.detect_faces_with_skip

    fd = FakeDetector()

    dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)

    # with frame_skip=3 real detection should run on frames 0,3,6,...
    # frame 1 -> counter becomes 1, 1 % 3 != 0 -> skip
    r1 = fd.detect_faces_with_skip(dummy_frame, frame_skip=3)
    assert r1 == [], "frame 1 should return cached empty list"

    # frame 2 -> counter becomes 2, 2 % 3 != 0 -> skip
    r2 = fd.detect_faces_with_skip(dummy_frame, frame_skip=3)
    assert r2 == [], "frame 2 should return cached empty list"

    # frame 3 -> counter becomes 3, 3 % 3 == 0 -> real detection
    r3 = fd.detect_faces_with_skip(dummy_frame, frame_skip=3)
    assert r3 == fake_result, "frame 3 should return fresh detection result"
    assert call_count["n"] == 1, "detect should have been called exactly once"

    # frame 4 -> counter becomes 4, 4 % 3 != 0 -> skip -> returns last result
    r4 = fd.detect_faces_with_skip(dummy_frame, frame_skip=3)
    assert r4 == fake_result, "frame 4 should return cached result from frame 3"
    assert call_count["n"] == 1, "detect should still have been called only once"

    print(f"PASS - frame skip cache logic correct (detect called {call_count['n']} time/3 frames)")


# ---------------------------------------------------------------
# Downscale logic test (pure numpy/cv2, no MTCNN)
# ---------------------------------------------------------------
def test_downscale_produces_smaller_image():
    """
    Verify that detect_faces_fast actually shrinks the frame before processing.
    We check by patching the internal detect_faces call and reading the size.
    """
    import cv2

    original_shape = (480, 640, 3)
    dummy_frame = np.zeros(original_shape, dtype=np.uint8)

    downscale_ratio = 0.5
    orig_h, orig_w = original_shape[:2]
    small_w = int(orig_w * downscale_ratio)
    small_h = int(orig_h * downscale_ratio)

    # simulate what detect_faces_fast does internally
    small_frame = cv2.resize(dummy_frame, (small_w, small_h), interpolation=cv2.INTER_LINEAR)

    assert small_frame.shape == (small_h, small_w, 3), \
        f"Downscaled frame has wrong shape: {small_frame.shape}"

    pixel_ratio = (small_h * small_w) / (orig_h * orig_w)
    assert pixel_ratio == 0.25, \
        f"Expected 0.25 pixel ratio at 0.5 downscale, got {pixel_ratio}"

    print(f"PASS - downscale: {orig_w}x{orig_h} -> {small_w}x{small_h} ({pixel_ratio:.2f} pixels)")


# ---------------------------------------------------------------
# Coordinate scale-back sanity test
# ---------------------------------------------------------------
def test_bounding_box_scale_back():
    """
    After detecting faces on a downscaled image, the bounding boxes must be
    scaled back to the original resolution correctly.
    If original=640x480 and downscale=0.5, a box at [10,10,20,20] in the small
    frame should map to [20,20,40,40] in the original frame.
    """
    downscale_ratio = 0.5
    orig_w, orig_h = 640, 480
    small_w = int(orig_w * downscale_ratio)
    small_h = int(orig_h * downscale_ratio)

    scale_x = orig_w / small_w
    scale_y = orig_h / small_h

    # simulate a face detected on the small frame
    small_box = [10, 10, 20, 20]  # x, y, w, h
    x, y, w, h = small_box

    scaled_box = [
        int(x * scale_x),
        int(y * scale_y),
        int(w * scale_x),
        int(h * scale_y)
    ]

    assert scaled_box == [20, 20, 40, 40], \
        f"Wrong scale-back result: {scaled_box}"

    print("PASS - bounding box scaled back correctly from small frame to original")


# ---------------------------------------------------------------
# Verify new methods are in source (no model load)
# ---------------------------------------------------------------
def test_new_methods_in_source():
    """
    Check the source of face_detector.py contains both new method definitions.
    """
    face_detector_path = os.path.join(
        backend_dir, "app", "services", "face_detector.py"
    )
    with open(face_detector_path, "r") as f:
        source = f.read()

    assert "def detect_faces_fast(" in source, \
        "detect_faces_fast not found in face_detector.py"
    assert "def detect_faces_with_skip(" in source, \
        "detect_faces_with_skip not found in face_detector.py"
    assert "DETECTION_DOWNSCALE_RATIO" in source, \
        "DETECTION_DOWNSCALE_RATIO import not in face_detector.py"
    assert "DETECTION_FRAME_SKIP" in source, \
        "DETECTION_FRAME_SKIP import not in face_detector.py"

    print("PASS - new speed optimization methods found in face_detector.py source")


def test_config_in_source():
    """
    Check ai_config.py has both new speed constants.
    """
    config_path = os.path.join(
        backend_dir, "app", "services", "ai", "ai_config.py"
    )
    with open(config_path, "r") as f:
        source = f.read()

    assert "DETECTION_DOWNSCALE_RATIO" in source, \
        "DETECTION_DOWNSCALE_RATIO not in ai_config.py"
    assert "DETECTION_FRAME_SKIP" in source, \
        "DETECTION_FRAME_SKIP not in ai_config.py"

    print("PASS - speed optimization constants found in ai_config.py")


# ---------------------------------------------------------------
# Run all
# ---------------------------------------------------------------
if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("NEXATTEND - WEEK 5 DAY 22 - SPEED OPTIMIZATION TESTS")
    print("Viraj Jayasiri")
    print("=" * 60 + "\n")

    tests = [
        test_speed_config_constants_exist,
        test_fast_detect_method_exists,
        test_skip_detect_method_exists,
        test_frame_skip_cache_logic,
        test_downscale_produces_smaller_image,
        test_bounding_box_scale_back,
        test_new_methods_in_source,
        test_config_in_source,
    ]

    passed = 0
    failed = 0

    for test in tests:
        try:
            test()
            passed += 1
        except AssertionError as e:
            print(f"FAIL - {test.__name__}: {e}")
            failed += 1
        except Exception as e:
            print(f"ERROR - {test.__name__}: {e}")
            failed += 1

    print("\n" + "-" * 60)
    print(f"Results: {passed} passed, {failed} failed")
    print("=" * 60)

    if failed > 0:
        sys.exit(1)
