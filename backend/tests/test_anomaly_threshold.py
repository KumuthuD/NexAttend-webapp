"""
Week 06 Day 26 - Fine-tune Anomaly Threshold
---------------------------------------------
Tests for AnomalyDetector:
  1. Config constants are accessible and valid
  2. AnomalyDetector class exists and accepts custom thresholds
  3. check() returns the correct status for accepted/flagged/rejected scores
  4. check_batch() enriches a list of records correctly
  5. Invalid threshold config raises ValueError

All tests are pure Python - no MTCNN or DeepFace needed.

Viraj Jayasiri
Week 06 Day 26
Branch: feature/ai/anomaly-threshold
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
# Config constants tests
# ---------------------------------------------------------------
def test_anomaly_config_constants_exist():
    """
    LOW_CONFIDENCE_FLAG_THRESHOLD and SIMILARITY_THRESHOLD must be in ai_config.
    AnomalyDetector relies on both of them.
    """
    from app.services.ai.ai_config import (
        SIMILARITY_THRESHOLD,
        LOW_CONFIDENCE_FLAG_THRESHOLD,
    )

    assert isinstance(SIMILARITY_THRESHOLD, float), \
        "SIMILARITY_THRESHOLD must be a float"
    assert 0.0 < SIMILARITY_THRESHOLD <= 1.0, \
        f"SIMILARITY_THRESHOLD out of range: {SIMILARITY_THRESHOLD}"

    assert isinstance(LOW_CONFIDENCE_FLAG_THRESHOLD, float), \
        "LOW_CONFIDENCE_FLAG_THRESHOLD must be a float"
    assert 0.0 < LOW_CONFIDENCE_FLAG_THRESHOLD <= 1.0, \
        f"LOW_CONFIDENCE_FLAG_THRESHOLD out of range: {LOW_CONFIDENCE_FLAG_THRESHOLD}"

    # flag threshold must be below the match threshold
    assert LOW_CONFIDENCE_FLAG_THRESHOLD < SIMILARITY_THRESHOLD, (
        f"LOW_CONFIDENCE_FLAG_THRESHOLD ({LOW_CONFIDENCE_FLAG_THRESHOLD}) "
        f"must be < SIMILARITY_THRESHOLD ({SIMILARITY_THRESHOLD})"
    )

    print(
        f"PASS - config: SIMILARITY_THRESHOLD={SIMILARITY_THRESHOLD}, "
        f"LOW_CONFIDENCE_FLAG_THRESHOLD={LOW_CONFIDENCE_FLAG_THRESHOLD}"
    )


# ---------------------------------------------------------------
# Class existence and import test
# ---------------------------------------------------------------
def test_anomaly_detector_class_exists():
    """
    AnomalyDetector must import cleanly and have check() and check_batch().
    """
    from app.services.ai.anomaly_detector import AnomalyDetector

    assert callable(AnomalyDetector), "AnomalyDetector must be a callable class"
    assert hasattr(AnomalyDetector, "check"), "AnomalyDetector missing check() method"
    assert hasattr(AnomalyDetector, "check_batch"), "AnomalyDetector missing check_batch() method"
    assert hasattr(AnomalyDetector, "get_thresholds"), "AnomalyDetector missing get_thresholds() method"

    print("PASS - AnomalyDetector class exists with correct methods")


def test_anomaly_detector_exported_from_init():
    """
    AnomalyDetector must be accessible via app.services.ai (the package).
    This confirms __init__.py was updated.
    """
    from app.services.ai import AnomalyDetector

    assert AnomalyDetector is not None, "AnomalyDetector not found in app.services.ai"
    print("PASS - AnomalyDetector exported from app.services.ai")


# ---------------------------------------------------------------
# check() return value tests
# ---------------------------------------------------------------
def _make_detector():
    """helper - build AnomalyDetector with known thresholds for deterministic tests"""
    from app.services.ai.anomaly_detector import AnomalyDetector
    # use fixed values so tests don't depend on .env
    return AnomalyDetector(similarity_threshold=0.70, low_confidence_threshold=0.60)


def test_check_accepted():
    """
    Score at or above similarity_threshold must return status='accepted', anomaly=False.
    """
    det = _make_detector()

    result = det.check(0.70)  # exactly at boundary
    assert result["status"] == "accepted", \
        f"Expected 'accepted', got '{result['status']}'"
    assert result["anomaly"] is False, "accepted result must have anomaly=False"
    assert result["score"] == 0.70

    result2 = det.check(0.90)  # well above threshold
    assert result2["status"] == "accepted"
    assert result2["anomaly"] is False

    print(f"PASS - check(): accepted at score=0.70 and score=0.90")


def test_check_flagged():
    """
    Score between low_confidence_threshold and similarity_threshold
    must return status='flagged', anomaly=True.
    """
    det = _make_detector()

    result = det.check(0.65)  # in the grey zone [0.60, 0.70)
    assert result["status"] == "flagged", \
        f"Expected 'flagged', got '{result['status']}'"
    assert result["anomaly"] is True, "flagged result must have anomaly=True"
    assert result["score"] == 0.65

    # test the boundary at low_confidence_threshold
    result2 = det.check(0.60)  # exactly at low bound
    assert result2["status"] == "flagged", \
        "Score exactly at low_confidence_threshold should be 'flagged'"

    print(f"PASS - check(): flagged at score=0.65, score=0.60")


def test_check_rejected():
    """
    Score below low_confidence_threshold must return status='rejected', anomaly=True.
    """
    det = _make_detector()

    result = det.check(0.50)  # clearly below both thresholds
    assert result["status"] == "rejected", \
        f"Expected 'rejected', got '{result['status']}'"
    assert result["anomaly"] is True, "rejected result must have anomaly=True"
    assert result["score"] == 0.50

    result2 = det.check(0.0)  # zero similarity
    assert result2["status"] == "rejected"

    print(f"PASS - check(): rejected at score=0.50 and score=0.0")


def test_check_result_has_reason():
    """
    Every check() result must include a non-empty 'reason' string.
    """
    det = _make_detector()

    for score in [0.80, 0.65, 0.40]:
        result = det.check(score)
        assert "reason" in result, f"Missing 'reason' key for score={score}"
        assert isinstance(result["reason"], str), "reason must be a string"
        assert len(result["reason"]) > 0, "reason must not be empty"

    print("PASS - check(): reason string present for all outcomes")


# ---------------------------------------------------------------
# check_batch() tests
# ---------------------------------------------------------------
def test_check_batch_adds_fields():
    """
    check_batch() must add anomaly_status, anomaly, anomaly_reason to each record.
    Original keys must be preserved.
    """
    from app.services.ai.anomaly_detector import AnomalyDetector

    det = AnomalyDetector(similarity_threshold=0.70, low_confidence_threshold=0.60)

    records = [
        {"student_id": "S001", "similarity": 0.85},   # should be accepted
        {"student_id": "S002", "similarity": 0.64},   # should be flagged
        {"student_id": "S003", "similarity": 0.45},   # should be rejected
    ]

    results = det.check_batch(records)

    assert len(results) == 3, "check_batch must return same number of records"

    assert results[0]["anomaly_status"] == "accepted"
    assert results[0]["anomaly"] is False
    assert results[0]["student_id"] == "S001"  # original key preserved

    assert results[1]["anomaly_status"] == "flagged"
    assert results[1]["anomaly"] is True
    assert results[1]["student_id"] == "S002"

    assert results[2]["anomaly_status"] == "rejected"
    assert results[2]["anomaly"] is True
    assert results[2]["student_id"] == "S003"

    # anomaly_reason must be present on all
    for r in results:
        assert "anomaly_reason" in r, "anomaly_reason missing from batch result"

    print("PASS - check_batch(): correct status, anomaly flag, and reason for all 3 records")


def test_check_batch_empty_list():
    """
    check_batch with empty list must return empty list without raising.
    """
    from app.services.ai.anomaly_detector import AnomalyDetector

    det = AnomalyDetector(similarity_threshold=0.70, low_confidence_threshold=0.60)
    results = det.check_batch([])

    assert results == [], f"Expected empty list, got {results}"
    print("PASS - check_batch(): returns empty list for empty input")


def test_check_batch_does_not_mutate_input():
    """
    check_batch must not modify the original input dicts.
    """
    from app.services.ai.anomaly_detector import AnomalyDetector

    det = AnomalyDetector(similarity_threshold=0.70, low_confidence_threshold=0.60)
    original = {"student_id": "S001", "similarity": 0.80}
    records = [original]

    det.check_batch(records)

    # anomaly keys should NOT be in the original dict
    assert "anomaly" not in original, "check_batch mutated the original record dict"
    print("PASS - check_batch(): does not mutate original input dicts")


# ---------------------------------------------------------------
# Threshold validation test
# ---------------------------------------------------------------
def test_invalid_threshold_raises():
    """
    If low_confidence_threshold >= similarity_threshold, AnomalyDetector
    must raise ValueError at construction time.
    """
    from app.services.ai.anomaly_detector import AnomalyDetector
    import traceback

    try:
        # equal values should raise
        AnomalyDetector(similarity_threshold=0.70, low_confidence_threshold=0.70)
        assert False, "Should have raised ValueError for equal thresholds"
    except ValueError:
        pass  # expected

    try:
        # reversed values should also raise
        AnomalyDetector(similarity_threshold=0.60, low_confidence_threshold=0.70)
        assert False, "Should have raised ValueError for inverted thresholds"
    except ValueError:
        pass  # expected

    print("PASS - AnomalyDetector raises ValueError for invalid threshold config")


# ---------------------------------------------------------------
# get_thresholds() test
# ---------------------------------------------------------------
def test_get_thresholds():
    """
    get_thresholds() must return the values that were passed in.
    """
    from app.services.ai.anomaly_detector import AnomalyDetector

    det = AnomalyDetector(similarity_threshold=0.72, low_confidence_threshold=0.58)
    thresholds = det.get_thresholds()

    assert thresholds["similarity_threshold"] == 0.72
    assert thresholds["low_confidence_threshold"] == 0.58

    print(f"PASS - get_thresholds(): returned {thresholds}")


# ---------------------------------------------------------------
# Source file check
# ---------------------------------------------------------------
def test_anomaly_detector_in_source():
    """
    anomaly_detector.py must exist and contain the class and key methods.
    """
    anomaly_path = os.path.join(
        backend_dir, "app", "services", "ai", "anomaly_detector.py"
    )
    assert os.path.exists(anomaly_path), "anomaly_detector.py does not exist"

    with open(anomaly_path, "r") as f:
        source = f.read()

    assert "class AnomalyDetector" in source, "AnomalyDetector class not in source"
    assert "def check(" in source, "check() method not in source"
    assert "def check_batch(" in source, "check_batch() method not in source"
    assert "LOW_CONFIDENCE_FLAG_THRESHOLD" in source, \
        "LOW_CONFIDENCE_FLAG_THRESHOLD not imported in anomaly_detector.py"
    assert "SIMILARITY_THRESHOLD" in source, \
        "SIMILARITY_THRESHOLD not imported in anomaly_detector.py"

    print("PASS - anomaly_detector.py source contains class and both threshold imports")


# ---------------------------------------------------------------
# Run all
# ---------------------------------------------------------------
if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("NEXATTEND - WEEK 6 DAY 26 - ANOMALY THRESHOLD TESTS")
    print("Viraj Jayasiri")
    print("=" * 60 + "\n")

    tests = [
        test_anomaly_config_constants_exist,
        test_anomaly_detector_class_exists,
        test_anomaly_detector_exported_from_init,
        test_check_accepted,
        test_check_flagged,
        test_check_rejected,
        test_check_result_has_reason,
        test_check_batch_adds_fields,
        test_check_batch_empty_list,
        test_check_batch_does_not_mutate_input,
        test_invalid_threshold_raises,
        test_get_thresholds,
        test_anomaly_detector_in_source,
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
