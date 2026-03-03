"""
Anomaly Detection Service
Flags low-confidence face recognition results for manual review.

Kumuthu Dahanayake
Week 06 Day 26
"""

from app.services.ai.ai_config import LOW_CONFIDENCE_FLAG_THRESHOLD, SIMILARITY_THRESHOLD
import logging

logger = logging.getLogger(__name__)

def check_anomaly(confidence: float, student_id: str = None) -> dict:
    """
    Check if a recognition result should be flagged as anomalous.

    Args:
        confidence: The similarity score from face recognition (0.0 to 1.0).
        student_id: Optional student ID for logging context.

    Returns:
        dict with keys:
            is_flagged (bool): True if this result needs review.
            flag_reason (str | None): Human-readable reason.
    """
    # Matched but confidence is in the uncertain range
    if confidence >= LOW_CONFIDENCE_FLAG_THRESHOLD and confidence < SIMILARITY_THRESHOLD:
        reason = f"Low confidence match ({confidence:.2f} < threshold {SIMILARITY_THRESHOLD})"
        logger.warning(f"[Anomaly] Flagging student {student_id}: {reason}")
        return {"is_flagged": True, "flag_reason": reason}

    # Very high confidence — clean result
    logger.debug(f"[Anomaly] Clean result for student {student_id}: confidence={confidence:.2f}")
    return {"is_flagged": False, "flag_reason": None}
