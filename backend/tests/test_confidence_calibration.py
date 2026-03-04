"""
Week 06 Day 27 - Confidence Calibration Tool
----------------------------------------------
Tests for ConfidenceCalibrator:
  1. Class exists and imports cleanly
  2. Default anchors are built from ai_config thresholds
  3. calibrate() returns values in [0.0, 1.0]
  4. calibrate() is monotonically increasing
  5. Boundary scores map to expected values
  6. calibrate_with_label() returns all required keys and correct label bands
  7. calibrate_batch() adds calibration fields without mutating originals
  8. Custom anchors can be passed in
  9. Invalid anchors raise ValueError
 10. get_config() and get_anchors() return expected data

All tests are pure Python - no MTCNN or DeepFace needed.

Viraj Jayasiri
Week 06 Day 27
Branch: feature/ai/confidence-calibration
"""

import sys
import os

# add backend root to path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.append(backend_dir)

from dotenv import load_dotenv
load_dotenv(os.path.join(backend_dir, ".env"))


# ---------------------------------------------------------------
# Import / class existence tests
# ---------------------------------------------------------------
def test_calibrator_class_exists():
    """
    ConfidenceCalibrator must import cleanly and expose the expected methods.
    """
    from app.services.ai.confidence_calibrator import ConfidenceCalibrator

    assert callable(ConfidenceCalibrator), "ConfidenceCalibrator must be callable"
    assert hasattr(ConfidenceCalibrator, "calibrate"), "missing calibrate()"
    assert hasattr(ConfidenceCalibrator, "calibrate_with_label"), "missing calibrate_with_label()"
    assert hasattr(ConfidenceCalibrator, "calibrate_batch"), "missing calibrate_batch()"
    assert hasattr(ConfidenceCalibrator, "get_anchors"), "missing get_anchors()"
    assert hasattr(ConfidenceCalibrator, "get_config"), "missing get_config()"

    print("PASS - ConfidenceCalibrator class exists with all expected methods")


def test_calibrator_exported_from_init():
    """
    ConfidenceCalibrator must be accessible via app.services.ai.
    """
    from app.services.ai import ConfidenceCalibrator

    assert ConfidenceCalibrator is not None, \
        "ConfidenceCalibrator not found in app.services.ai"

    print("PASS - ConfidenceCalibrator exported from app.services.ai")


# ---------------------------------------------------------------
# Default anchor / threshold tests
# ---------------------------------------------------------------
def test_default_anchors_use_config_thresholds():
    """
    When no anchors are passed the calibrator must use SIMILARITY_THRESHOLD
    and LOW_CONFIDENCE_FLAG_THRESHOLD from ai_config.
    """
    from app.services.ai.confidence_calibrator import ConfidenceCalibrator
    from app.services.ai.ai_config import (
        SIMILARITY_THRESHOLD,
        LOW_CONFIDENCE_FLAG_THRESHOLD,
    )

    cal = ConfidenceCalibrator()
    config = cal.get_config()

    assert config["similarity_threshold"] == SIMILARITY_THRESHOLD, \
        f"Expected similarity_threshold={SIMILARITY_THRESHOLD}, got {config['similarity_threshold']}"
    assert config["low_confidence_threshold"] == LOW_CONFIDENCE_FLAG_THRESHOLD, \
        f"Expected low_confidence_threshold={LOW_CONFIDENCE_FLAG_THRESHOLD}, got {config['low_confidence_threshold']}"

    print(
        f"PASS - default anchors use config thresholds: "
        f"similarity={SIMILARITY_THRESHOLD}, low_conf={LOW_CONFIDENCE_FLAG_THRESHOLD}"
    )


def test_get_config_has_required_keys():
    """get_config() must return similarity_threshold, low_confidence_threshold, anchor_count."""
    from app.services.ai.confidence_calibrator import ConfidenceCalibrator

    cal = ConfidenceCalibrator()
    config = cal.get_config()

    for key in ("similarity_threshold", "low_confidence_threshold", "anchor_count"):
        assert key in config, f"get_config() missing key: {key}"

    assert config["anchor_count"] >= 2, \
        f"anchor_count must be at least 2, got {config['anchor_count']}"

    print(f"PASS - get_config() returned {config}")


# ---------------------------------------------------------------
# calibrate() output range and monotonicity tests
# ---------------------------------------------------------------
def test_calibrate_returns_float_in_range():
    """calibrate() must return a float between 0.0 and 1.0 for any valid input."""
    from app.services.ai.confidence_calibrator import ConfidenceCalibrator

    cal = ConfidenceCalibrator()

    test_scores = [0.0, 0.3, 0.55, 0.60, 0.65, 0.70, 0.75, 0.85, 0.95, 1.0]
    for score in test_scores:
        result = cal.calibrate(score)
        assert isinstance(result, float), \
            f"calibrate({score}) returned {type(result)}, expected float"
        assert 0.0 <= result <= 1.0, \
            f"calibrate({score}) = {result} is outside [0.0, 1.0]"

    print(f"PASS - calibrate() returns float in [0.0, 1.0] for {len(test_scores)} test scores")


def test_calibrate_is_monotonically_increasing():
    """
    Higher raw scores must produce higher or equal calibrated values.
    The calibration curve must never go backwards.
    """
    from app.services.ai.confidence_calibrator import ConfidenceCalibrator

    cal = ConfidenceCalibrator()

    # sample across the full range
    scores = [i / 20 for i in range(21)]  # 0.0, 0.05, 0.10, ... 1.0
    calibrated = [cal.calibrate(s) for s in scores]

    for i in range(1, len(calibrated)):
        assert calibrated[i] >= calibrated[i - 1], (
            f"Not monotonic at score={scores[i]:.2f}: "
            f"calibrated[{i}]={calibrated[i]} < calibrated[{i-1}]={calibrated[i-1]}"
        )

    print("PASS - calibrate() is monotonically increasing across the full range")


def test_calibrate_boundary_scores():
    """
    score=0.0 must give 0.0, score=1.0 must give 1.0 (default calibration).
    score at SIMILARITY_THRESHOLD must give 0.70.
    """
    from app.services.ai.confidence_calibrator import ConfidenceCalibrator
    from app.services.ai.ai_config import SIMILARITY_THRESHOLD

    cal = ConfidenceCalibrator()

    # endpoints
    assert cal.calibrate(0.0) == 0.0, "score=0.0 must calibrate to 0.0"
    assert cal.calibrate(1.0) == 1.0, "score=1.0 must calibrate to 1.0"

    # match threshold should give exactly 0.70 (it is an anchor)
    result = cal.calibrate(SIMILARITY_THRESHOLD)
    assert abs(result - 0.70) < 1e-6, (
        f"calibrate(SIMILARITY_THRESHOLD={SIMILARITY_THRESHOLD}) "
        f"expected 0.70, got {result}"
    )

    print(
        f"PASS - boundary scores correct: "
        f"0.0->0.0, 1.0->1.0, {SIMILARITY_THRESHOLD}->0.70"
    )


def test_calibrate_below_threshold_gives_low_confidence():
    """Scores well below SIMILARITY_THRESHOLD must give calibrated values below 0.70."""
    from app.services.ai.confidence_calibrator import ConfidenceCalibrator

    cal = ConfidenceCalibrator()

    # scores clearly below match threshold
    for score in [0.0, 0.20, 0.40, 0.55]:
        result = cal.calibrate(score)
        assert result < 0.70, (
            f"Score {score} below SIMILARITY_THRESHOLD should give calibrated < 0.70, "
            f"got {result}"
        )

    print("PASS - scores below SIMILARITY_THRESHOLD calibrate to < 0.70")


def test_calibrate_above_threshold_gives_high_confidence():
    """Scores at or above SIMILARITY_THRESHOLD must give calibrated values >= 0.70."""
    from app.services.ai.confidence_calibrator import ConfidenceCalibrator
    from app.services.ai.ai_config import SIMILARITY_THRESHOLD

    cal = ConfidenceCalibrator()

    for score in [SIMILARITY_THRESHOLD, 0.80, 0.90, 1.0]:
        result = cal.calibrate(score)
        assert result >= 0.70, (
            f"Score {score} >= SIMILARITY_THRESHOLD should give calibrated >= 0.70, "
            f"got {result}"
        )

    print("PASS - scores >= SIMILARITY_THRESHOLD calibrate to >= 0.70")


# ---------------------------------------------------------------
# calibrate_with_label() tests
# ---------------------------------------------------------------
def test_calibrate_with_label_keys():
    """calibrate_with_label() must return the four expected keys."""
    from app.services.ai.confidence_calibrator import ConfidenceCalibrator

    cal = ConfidenceCalibrator()
    result = cal.calibrate_with_label(0.75)

    required_keys = ("raw_score", "calibrated", "confidence_percent", "label")
    for key in required_keys:
        assert key in result, \
            f"calibrate_with_label() missing key: '{key}'"

    assert isinstance(result["raw_score"], float), "raw_score must be float"
    assert isinstance(result["calibrated"], float), "calibrated must be float"
    assert isinstance(result["confidence_percent"], float), "confidence_percent must be float"
    assert isinstance(result["label"], str), "label must be str"

    print(f"PASS - calibrate_with_label() keys correct: {result}")


def test_calibrate_with_label_bands():
    """
    Label values must match the defined confidence bands:
      < 40% -> 'low', 40-70% -> 'medium', 70-90% -> 'high', >= 90% -> 'very_high'
    Test by using the calibrator with known custom anchors.
    """
    from app.services.ai.confidence_calibrator import ConfidenceCalibrator

    # use custom anchors so we can predict exact calibrated values
    custom_anchors = [
        (0.00, 0.00),
        (0.25, 0.25),  # score=0.25 -> 25% calibrated -> 'low'
        (0.50, 0.55),  # score=0.50 -> 55% calibrated -> 'medium'
        (0.75, 0.80),  # score=0.75 -> 80% calibrated -> 'high'
        (0.95, 0.95),  # score=0.95 -> 95% calibrated -> 'very_high'
        (1.00, 1.00),
    ]
    cal = ConfidenceCalibrator(anchors=custom_anchors)

    assert cal.calibrate_with_label(0.25)["label"] == "low", \
        "calibrated=0.25 should be 'low'"
    assert cal.calibrate_with_label(0.50)["label"] == "medium", \
        "calibrated=0.55 should be 'medium'"
    assert cal.calibrate_with_label(0.75)["label"] == "high", \
        "calibrated=0.80 should be 'high'"
    assert cal.calibrate_with_label(0.95)["label"] == "very_high", \
        "calibrated=0.95 should be 'very_high'"

    print("PASS - calibrate_with_label() label bands are correct")


# ---------------------------------------------------------------
# calibrate_batch() tests
# ---------------------------------------------------------------
def test_calibrate_batch_adds_fields():
    """
    calibrate_batch() must add calibrated_confidence, confidence_percent,
    and confidence_label to each record, without removing existing keys.
    """
    from app.services.ai.confidence_calibrator import ConfidenceCalibrator

    cal = ConfidenceCalibrator()

    records = [
        {"student_id": "S001", "similarity": 0.85},
        {"student_id": "S002", "similarity": 0.65},
        {"student_id": "S003", "similarity": 0.40},
    ]

    results = cal.calibrate_batch(records)

    assert len(results) == 3, "calibrate_batch must return same number of records"

    for r in results:
        assert "calibrated_confidence" in r, "missing calibrated_confidence"
        assert "confidence_percent" in r, "missing confidence_percent"
        assert "confidence_label" in r, "missing confidence_label"
        # original keys must still be there
        assert "student_id" in r, "student_id was removed by calibrate_batch"
        assert "similarity" in r, "similarity was removed by calibrate_batch"

    # higher similarity must give higher calibrated confidence
    assert results[0]["calibrated_confidence"] > results[1]["calibrated_confidence"], \
        "S001 (sim=0.85) should have higher calibrated confidence than S002 (sim=0.65)"

    print("PASS - calibrate_batch() adds all calibration fields correctly")


def test_calibrate_batch_empty_list():
    """calibrate_batch([]) must return [] without raising."""
    from app.services.ai.confidence_calibrator import ConfidenceCalibrator

    cal = ConfidenceCalibrator()
    results = cal.calibrate_batch([])

    assert results == [], f"Expected empty list, got {results}"
    print("PASS - calibrate_batch() returns empty list for empty input")


def test_calibrate_batch_does_not_mutate_input():
    """calibrate_batch must not modify the original input dicts."""
    from app.services.ai.confidence_calibrator import ConfidenceCalibrator

    cal = ConfidenceCalibrator()
    original = {"student_id": "S001", "similarity": 0.80}
    records = [original]

    cal.calibrate_batch(records)

    # calibration keys must NOT appear in the original dict
    assert "calibrated_confidence" not in original, \
        "calibrate_batch mutated the original record dict"
    print("PASS - calibrate_batch() does not mutate original input dicts")


# ---------------------------------------------------------------
# Custom anchor tests
# ---------------------------------------------------------------
def test_custom_anchors_accepted():
    """Passing custom anchors must override the default calibration curve."""
    from app.services.ai.confidence_calibrator import ConfidenceCalibrator

    custom = [
        (0.00, 0.00),
        (0.50, 0.50),
        (1.00, 1.00),
    ]
    cal = ConfidenceCalibrator(anchors=custom)

    # with linear anchors, score=0.50 should give exactly 0.50
    result = cal.calibrate(0.50)
    assert abs(result - 0.50) < 1e-6, \
        f"Custom linear anchors: expected 0.50 got {result}"

    # score=0.25 should give 0.25
    result2 = cal.calibrate(0.25)
    assert abs(result2 - 0.25) < 1e-6, \
        f"Custom linear anchors: expected 0.25 got {result2}"

    print("PASS - custom anchors produce correct calibrated values")


def test_get_anchors_returns_list_of_dicts():
    """get_anchors() must return a list of dicts with 'raw' and 'calibrated' keys."""
    from app.services.ai.confidence_calibrator import ConfidenceCalibrator

    cal = ConfidenceCalibrator()
    anchors = cal.get_anchors()

    assert isinstance(anchors, list), "get_anchors() must return a list"
    assert len(anchors) >= 2, "must have at least 2 anchors"

    for anchor in anchors:
        assert "raw" in anchor, "anchor missing 'raw' key"
        assert "calibrated" in anchor, "anchor missing 'calibrated' key"

    print(f"PASS - get_anchors() returned {len(anchors)} anchors")


# ---------------------------------------------------------------
# Invalid input / validation tests
# ---------------------------------------------------------------
def test_invalid_anchors_raise():
    """ConfidenceCalibrator must raise ValueError for bad anchor configs."""
    from app.services.ai.confidence_calibrator import ConfidenceCalibrator

    # less than 2 anchors
    try:
        ConfidenceCalibrator(anchors=[(0.0, 0.0)])
        assert False, "Should have raised ValueError for < 2 anchors"
    except ValueError:
        pass

    # non-increasing raw scores
    try:
        ConfidenceCalibrator(anchors=[(0.0, 0.0), (0.5, 0.5), (0.3, 0.8), (1.0, 1.0)])
        assert False, "Should have raised ValueError for non-increasing raw scores"
    except ValueError:
        pass

    # raw score out of range
    try:
        ConfidenceCalibrator(anchors=[(0.0, 0.0), (1.5, 1.0)])
        assert False, "Should have raised ValueError for raw score > 1.0"
    except ValueError:
        pass

    print("PASS - ConfidenceCalibrator raises ValueError for invalid anchor configs")


def test_calibrate_clamps_out_of_range():
    """
    calibrate() must not crash or go out of [0, 1] if given a score
    just outside [0.0, 1.0] - it should clamp silently.
    """
    from app.services.ai.confidence_calibrator import ConfidenceCalibrator

    cal = ConfidenceCalibrator()

    # slightly out of range - should clamp, not crash
    result_low = cal.calibrate(-0.1)
    result_high = cal.calibrate(1.1)

    assert 0.0 <= result_low <= 1.0, f"Clamped negative score gave {result_low}"
    assert 0.0 <= result_high <= 1.0, f"Clamped >1.0 score gave {result_high}"

    print(f"PASS - calibrate() clamps out-of-range inputs safely: "
          f"-0.1->{result_low}, 1.1->{result_high}")


# ---------------------------------------------------------------
# Source file check
# ---------------------------------------------------------------
def test_calibrator_in_source():
    """confidence_calibrator.py must exist and contain the class + key methods."""
    calibrator_path = os.path.join(
        backend_dir, "app", "services", "ai", "confidence_calibrator.py"
    )
    assert os.path.exists(calibrator_path), "confidence_calibrator.py does not exist"

    with open(calibrator_path, "r") as f:
        source = f.read()

    assert "class ConfidenceCalibrator" in source, \
        "ConfidenceCalibrator class not in source"
    assert "def calibrate(" in source, "calibrate() method not in source"
    assert "def calibrate_batch(" in source, "calibrate_batch() method not in source"
    assert "def calibrate_with_label(" in source, \
        "calibrate_with_label() method not in source"
    assert "SIMILARITY_THRESHOLD" in source, \
        "SIMILARITY_THRESHOLD not referenced in source"
    assert "LOW_CONFIDENCE_FLAG_THRESHOLD" in source, \
        "LOW_CONFIDENCE_FLAG_THRESHOLD not referenced in source"

    print("PASS - confidence_calibrator.py source contains class and all required methods")


# ---------------------------------------------------------------
# Run all
# ---------------------------------------------------------------
if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("NEXATTEND - WEEK 6 DAY 27 - CONFIDENCE CALIBRATION TESTS")
    print("Viraj Jayasiri")
    print("=" * 60 + "\n")

    tests = [
        test_calibrator_class_exists,
        test_calibrator_exported_from_init,
        test_default_anchors_use_config_thresholds,
        test_get_config_has_required_keys,
        test_calibrate_returns_float_in_range,
        test_calibrate_is_monotonically_increasing,
        test_calibrate_boundary_scores,
        test_calibrate_below_threshold_gives_low_confidence,
        test_calibrate_above_threshold_gives_high_confidence,
        test_calibrate_with_label_keys,
        test_calibrate_with_label_bands,
        test_calibrate_batch_adds_fields,
        test_calibrate_batch_empty_list,
        test_calibrate_batch_does_not_mutate_input,
        test_custom_anchors_accepted,
        test_get_anchors_returns_list_of_dicts,
        test_invalid_anchors_raise,
        test_calibrate_clamps_out_of_range,
        test_calibrator_in_source,
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
