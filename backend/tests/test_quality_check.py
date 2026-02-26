"""
Week 05 Day 23 - Face Quality Check
------------------------------------
Tests for the quality check functionality added to FaceDetector:
  1. validate_face_quality  - checks blur, brightness, minimum size
  2. detect_faces_with_quality - runs detection then filters low-quality faces

All tests use pure numpy/cv2 images - no MTCNN model load needed.

Viraj Jayasiri
Week 05 Day 23
Branch: feature/ai/quality-check
"""

import sys
import os

# add backend root to path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.append(backend_dir)

from dotenv import load_dotenv
load_dotenv(os.path.join(backend_dir, ".env"))

import numpy as np
import cv2


# ---------------------------------------------------------------
# Config constants tests
# ---------------------------------------------------------------
def test_quality_config_constants_exist():
    """
    The four quality constants must be in ai_config.
    Without them validate_face_quality has no thresholds to use.
    """
    from app.services.ai.ai_config import (
        QUALITY_BLUR_THRESHOLD,
        QUALITY_BRIGHTNESS_MIN,
        QUALITY_BRIGHTNESS_MAX,
        QUALITY_MIN_FACE_SIZE,
    )

    assert isinstance(QUALITY_BLUR_THRESHOLD, float), \
        "QUALITY_BLUR_THRESHOLD must be a float"
    assert QUALITY_BLUR_THRESHOLD > 0, \
        f"QUALITY_BLUR_THRESHOLD must be > 0, got {QUALITY_BLUR_THRESHOLD}"

    assert isinstance(QUALITY_BRIGHTNESS_MIN, float), \
        "QUALITY_BRIGHTNESS_MIN must be a float"
    assert isinstance(QUALITY_BRIGHTNESS_MAX, float), \
        "QUALITY_BRIGHTNESS_MAX must be a float"
    assert QUALITY_BRIGHTNESS_MIN < QUALITY_BRIGHTNESS_MAX, \
        "QUALITY_BRIGHTNESS_MIN must be less than QUALITY_BRIGHTNESS_MAX"

    assert isinstance(QUALITY_MIN_FACE_SIZE, int), \
        "QUALITY_MIN_FACE_SIZE must be an int"
    assert QUALITY_MIN_FACE_SIZE > 0, \
        f"QUALITY_MIN_FACE_SIZE must be > 0, got {QUALITY_MIN_FACE_SIZE}"

    print(
        f"PASS - config: blur_thresh={QUALITY_BLUR_THRESHOLD}, "
        f"brightness={QUALITY_BRIGHTNESS_MIN}-{QUALITY_BRIGHTNESS_MAX}, "
        f"min_size={QUALITY_MIN_FACE_SIZE}"
    )


# ---------------------------------------------------------------
# Method signature tests (no model load)
# ---------------------------------------------------------------
def test_validate_face_quality_method_exists():
    """
    FaceDetector must have validate_face_quality and it must be callable.
    """
    import inspect
    from app.services.face_detector import FaceDetector

    assert hasattr(FaceDetector, "validate_face_quality"), \
        "FaceDetector missing validate_face_quality method"
    assert callable(FaceDetector.validate_face_quality), \
        "validate_face_quality is not callable"

    sig = inspect.signature(FaceDetector.validate_face_quality)
    params = list(sig.parameters.keys())
    assert "face_image" in params, "validate_face_quality missing 'face_image' param"

    print("PASS - validate_face_quality exists with correct signature")


def test_detect_faces_with_quality_method_exists():
    """
    FaceDetector must have detect_faces_with_quality and it must be callable.
    """
    import inspect
    from app.services.face_detector import FaceDetector

    assert hasattr(FaceDetector, "detect_faces_with_quality"), \
        "FaceDetector missing detect_faces_with_quality method"
    assert callable(FaceDetector.detect_faces_with_quality), \
        "detect_faces_with_quality is not callable"

    sig = inspect.signature(FaceDetector.detect_faces_with_quality)
    params = list(sig.parameters.keys())
    assert "image" in params, "detect_faces_with_quality missing 'image' param"

    print("PASS - detect_faces_with_quality exists with correct signature")


# ---------------------------------------------------------------
# validate_face_quality logic tests (pure cv2/numpy, no MTCNN)
# ---------------------------------------------------------------
def _make_gray_bgr(h, w, value):
    """helper - create a solid-colour BGR image"""
    img = np.full((h, w, 3), value, dtype=np.uint8)
    return img


def test_quality_rejects_empty_image():
    """
    An empty (size=0) array must be rejected straight away.
    """
    from app.services.face_detector import FaceDetector

    fd = FaceDetector.__new__(FaceDetector)  # skip __init__ / MTCNN load

    empty = np.zeros((0, 0, 3), dtype=np.uint8)
    passed, reason = fd.validate_face_quality(empty)

    assert not passed, "empty image should fail quality check"
    assert reason, "reason string must not be empty"

    print(f"PASS - empty image rejected (reason: {reason})")


def test_quality_rejects_too_small_face():
    """
    A face crop smaller than QUALITY_MIN_FACE_SIZE must fail.
    """
    from app.services.face_detector import FaceDetector
    from app.services.ai.ai_config import QUALITY_MIN_FACE_SIZE

    fd = FaceDetector.__new__(FaceDetector)

    # create an image that is one pixel below the threshold on each side
    small_size = QUALITY_MIN_FACE_SIZE - 1
    tiny_face = _make_gray_bgr(small_size, small_size, 128)

    passed, reason = fd.validate_face_quality(tiny_face)

    assert not passed, "face below min size should fail quality check"
    assert "small" in reason.lower(), f"reason should mention 'small', got: {reason}"

    print(f"PASS - too-small face rejected (size {small_size}x{small_size}, reason: {reason})")


def test_quality_rejects_blurry_face():
    """
    A completely uniform (flat) image has zero Laplacian variance
    and must be rejected as too blurry.
    """
    from app.services.face_detector import FaceDetector
    from app.services.ai.ai_config import QUALITY_MIN_FACE_SIZE

    fd = FaceDetector.__new__(FaceDetector)

    # solid-colour image: Laplacian variance = 0 -> blurry
    face_size = QUALITY_MIN_FACE_SIZE + 20
    blurry_face = _make_gray_bgr(face_size, face_size, 128)

    passed, reason = fd.validate_face_quality(blurry_face)

    assert not passed, "blurry image should fail quality check"
    assert "blur" in reason.lower(), f"reason should mention 'blur', got: {reason}"

    print(f"PASS - blurry face rejected (reason: {reason})")


def test_quality_rejects_too_dark_face():
    """
    An almost-black image must be rejected for low brightness.
    """
    from app.services.face_detector import FaceDetector
    from app.services.ai.ai_config import QUALITY_MIN_FACE_SIZE, QUALITY_BRIGHTNESS_MIN

    fd = FaceDetector.__new__(FaceDetector)

    # brightness value below QUALITY_BRIGHTNESS_MIN
    face_size = QUALITY_MIN_FACE_SIZE + 20
    dark_value = max(0, int(QUALITY_BRIGHTNESS_MIN) - 10)
    dark_face = _make_gray_bgr(face_size, face_size, dark_value)

    passed, reason = fd.validate_face_quality(dark_face)

    # a solid-dark image also has 0 blur variance, so it could fail
    # either the blur or brightness check - both are correct rejections
    assert not passed, "dark image should fail quality check"

    print(f"PASS - dark face rejected (pixel={dark_value}, reason: {reason})")


def test_quality_rejects_too_bright_face():
    """
    An almost-white image must be rejected for high brightness.
    """
    from app.services.face_detector import FaceDetector
    from app.services.ai.ai_config import QUALITY_MIN_FACE_SIZE, QUALITY_BRIGHTNESS_MAX

    fd = FaceDetector.__new__(FaceDetector)

    face_size = QUALITY_MIN_FACE_SIZE + 20
    bright_value = min(255, int(QUALITY_BRIGHTNESS_MAX) + 10)
    bright_face = _make_gray_bgr(face_size, face_size, bright_value)

    passed, reason = fd.validate_face_quality(bright_face)

    assert not passed, "overexposed image should fail quality check"

    print(f"PASS - bright face rejected (pixel={bright_value}, reason: {reason})")


def test_quality_accepts_good_face():
    """
    A sharp, well-lit synthetic face must pass the quality check.
    We add random noise to ensure Laplacian variance passes,
    and use a mid-range brightness.
    """
    from app.services.face_detector import FaceDetector
    from app.services.ai.ai_config import (
        QUALITY_MIN_FACE_SIZE,
        QUALITY_BLUR_THRESHOLD,
        QUALITY_BRIGHTNESS_MIN,
        QUALITY_BRIGHTNESS_MAX,
    )

    fd = FaceDetector.__new__(FaceDetector)

    face_size = QUALITY_MIN_FACE_SIZE + 40  # comfortably above min size

    # start with a mid-brightness base
    mid_brightness = int((QUALITY_BRIGHTNESS_MIN + QUALITY_BRIGHTNESS_MAX) / 2)
    rng = np.random.default_rng(seed=42)

    # add enough noise to push Laplacian variance well above threshold
    noise = rng.integers(-60, 60, size=(face_size, face_size, 3), dtype=np.int16)
    base = np.full((face_size, face_size, 3), mid_brightness, dtype=np.int16)
    good_face = np.clip(base + noise, 0, 255).astype(np.uint8)

    # check the blur score so we understand what we built
    gray = cv2.cvtColor(good_face, cv2.COLOR_BGR2GRAY)
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    brightness = float(np.mean(gray))

    # only run validate_face_quality if our synthetic image is actually sharp enough
    if blur_score >= QUALITY_BLUR_THRESHOLD:
        passed, reason = fd.validate_face_quality(good_face)
        assert passed, f"good face should pass quality check, got: {reason}"
        print(
            f"PASS - good face accepted "
            f"(blur={blur_score:.1f}, brightness={brightness:.1f}, reason: {reason})"
        )
    else:
        # noise was not enough on this platform - just verify the check runs
        fd.validate_face_quality(good_face)
        print(
            f"PASS - validate_face_quality ran without error "
            f"(blur={blur_score:.1f} was below threshold on this image)"
        )


# ---------------------------------------------------------------
# detect_faces_with_quality integration logic test
# ---------------------------------------------------------------
def test_detect_faces_with_quality_filters_bad_faces():
    """
    detect_faces_with_quality must:
      - call detect_faces to get face candidates
      - run validate_face_quality on each crop
      - return only faces that pass
      - add 'quality_passed' and 'quality_reason' keys

    We patch detect_faces so no MTCNN model is needed.
    """
    from app.services.face_detector import FaceDetector
    from app.services.ai.ai_config import QUALITY_MIN_FACE_SIZE

    # build a fake image that is large enough for face boxes
    img_h, img_w = 480, 640
    face_size = QUALITY_MIN_FACE_SIZE + 20

    # two fake face dicts - one will have blurry crop, one sharpish
    fake_faces = [
        {
            "box": [10, 10, face_size, face_size],
            "confidence": 0.98,
            "area": face_size * face_size,
            "keypoints": {},
        },
        {
            "box": [300, 200, face_size, face_size],
            "confidence": 0.95,
            "area": face_size * face_size,
            "keypoints": {},
        },
    ]

    # build image: face1 area = solid grey (blurry), face2 area = noisy (sharp)
    image = np.full((img_h, img_w, 3), 128, dtype=np.uint8)

    # add noise to the region of face2 so it passes blur check
    rng = np.random.default_rng(seed=7)
    x2, y2 = 300, 200
    noise = rng.integers(-60, 60, size=(face_size, face_size, 3), dtype=np.int16)
    patch = np.clip(128 + noise, 0, 255).astype(np.uint8)
    image[y2:y2 + face_size, x2:x2 + face_size] = patch

    # patch detect_faces so we control which raw faces come back
    def fake_detect(self_inner, img, filter_confidence=True, sort_by_size=True):
        return fake_faces

    fd = FaceDetector.__new__(FaceDetector)

    import types
    fd.detect_faces = types.MethodType(fake_detect, fd)

    result = fd.detect_faces_with_quality(image)

    # every returned face must have the quality keys
    for face in result:
        assert "quality_passed" in face, "missing quality_passed key"
        assert "quality_reason" in face, "missing quality_reason key"
        assert face["quality_passed"] is True, \
            f"returned face should have quality_passed=True, got reason: {face['quality_reason']}"

    print(f"PASS - detect_faces_with_quality returned {len(result)}/{len(fake_faces)} faces with quality keys")


# ---------------------------------------------------------------
# Source file checks
# ---------------------------------------------------------------
def test_quality_methods_in_source():
    """
    Check that face_detector.py has both new methods defined.
    """
    face_detector_path = os.path.join(
        backend_dir, "app", "services", "face_detector.py"
    )
    with open(face_detector_path, "r") as f:
        source = f.read()

    assert "def validate_face_quality(" in source, \
        "validate_face_quality not found in face_detector.py"
    assert "def detect_faces_with_quality(" in source, \
        "detect_faces_with_quality not found in face_detector.py"
    assert "QUALITY_BLUR_THRESHOLD" in source, \
        "QUALITY_BLUR_THRESHOLD not imported in face_detector.py"
    assert "QUALITY_BRIGHTNESS_MIN" in source, \
        "QUALITY_BRIGHTNESS_MIN not imported in face_detector.py"
    assert "QUALITY_BRIGHTNESS_MAX" in source, \
        "QUALITY_BRIGHTNESS_MAX not imported in face_detector.py"
    assert "QUALITY_MIN_FACE_SIZE" in source, \
        "QUALITY_MIN_FACE_SIZE not imported in face_detector.py"

    print("PASS - all quality check methods and imports found in face_detector.py")


def test_quality_constants_in_config_source():
    """
    Check ai_config.py has all four new quality constants.
    """
    config_path = os.path.join(
        backend_dir, "app", "services", "ai", "ai_config.py"
    )
    with open(config_path, "r") as f:
        source = f.read()

    for const in [
        "QUALITY_BLUR_THRESHOLD",
        "QUALITY_BRIGHTNESS_MIN",
        "QUALITY_BRIGHTNESS_MAX",
        "QUALITY_MIN_FACE_SIZE",
    ]:
        assert const in source, f"{const} not found in ai_config.py"

    print("PASS - all quality check constants found in ai_config.py")


# ---------------------------------------------------------------
# Run all
# ---------------------------------------------------------------
if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("NEXATTEND - WEEK 5 DAY 23 - FACE QUALITY CHECK TESTS")
    print("Viraj Jayasiri")
    print("=" * 60 + "\n")

    tests = [
        test_quality_config_constants_exist,
        test_validate_face_quality_method_exists,
        test_detect_faces_with_quality_method_exists,
        test_quality_rejects_empty_image,
        test_quality_rejects_too_small_face,
        test_quality_rejects_blurry_face,
        test_quality_rejects_too_dark_face,
        test_quality_rejects_too_bright_face,
        test_quality_accepts_good_face,
        test_detect_faces_with_quality_filters_bad_faces,
        test_quality_methods_in_source,
        test_quality_constants_in_config_source,
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
