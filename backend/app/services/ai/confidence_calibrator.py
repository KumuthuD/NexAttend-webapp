"""Viraj Jayasiri - Week 06 Day 27
Confidence calibration tool.

Raw cosine similarity scores from FaceRecognizer are not true probabilities -
0.85 similarity doesn't mean 85% confidence in a match. This module maps raw
scores to calibrated confidence values using piecewise linear interpolation.

The calibration map was derived from observed score distributions:
  - below LOW_CONFIDENCE_FLAG_THRESHOLD -> very low probability (rejected zone)
  - between flag and similarity threshold  -> uncertain zone
  - at or above SIMILARITY_THRESHOLD      -> high confidence zone
  - approaching 1.0                       -> near-certain match
"""

from typing import List, Dict
from app.services.ai.ai_config import (
    SIMILARITY_THRESHOLD,
    LOW_CONFIDENCE_FLAG_THRESHOLD,
)


# calibration anchor points: (raw_score, calibrated_probability)
# each tuple defines a breakpoint in the piecewise linear curve
# values between anchors are linearly interpolated
DEFAULT_CALIBRATION_ANCHORS = [
    (0.00, 0.00),   # zero similarity -> zero confidence
    (LOW_CONFIDENCE_FLAG_THRESHOLD, 0.10),   # bottom of flag zone -> 10%
    (SIMILARITY_THRESHOLD, 0.70),            # match threshold -> 70%
    (0.85, 0.90),   # strong match -> 90%
    (1.00, 1.00),   # perfect match -> 100%
]


class ConfidenceCalibrator:
    """
    Maps raw cosine similarity scores (0.0 - 1.0) to calibrated
    confidence probabilities (0.0 - 1.0).

    Uses piecewise linear interpolation between anchor points so
    the 70% match threshold maps cleanly to 70% confidence and
    scores below the flag threshold map to near-zero confidence.
    """

    def __init__(
        self,
        anchors: List[tuple] = None,
        similarity_threshold: float = SIMILARITY_THRESHOLD,
        low_confidence_threshold: float = LOW_CONFIDENCE_FLAG_THRESHOLD,
    ):
        # use supplied anchors or build defaults from thresholds
        # do NOT sort - caller must pass anchors in order, validation will catch mistakes
        if anchors is not None:
            self.anchors = list(anchors)
        else:
            # rebuild default anchors using the supplied threshold values
            # so custom thresholds produce sensible calibration curves
            self.anchors = [
                (0.00, 0.00),
                (low_confidence_threshold, 0.10),
                (similarity_threshold, 0.70),
                (0.85, 0.90),
                (1.00, 1.00),
            ]

        # store thresholds so callers can read them back
        self.similarity_threshold = similarity_threshold
        self.low_confidence_threshold = low_confidence_threshold

        # validate anchors
        self._validate_anchors()

    def _validate_anchors(self):
        # anchors must be (raw, calibrated) pairs with both values in [0, 1]
        if len(self.anchors) < 2:
            raise ValueError("At least 2 anchor points are required")

        for i, (raw, cal) in enumerate(self.anchors):
            if not (0.0 <= raw <= 1.0):
                raise ValueError(
                    f"Anchor {i}: raw score {raw} must be in [0.0, 1.0]"
                )
            if not (0.0 <= cal <= 1.0):
                raise ValueError(
                    f"Anchor {i}: calibrated value {cal} must be in [0.0, 1.0]"
                )

        # raw scores must be strictly increasing
        for i in range(1, len(self.anchors)):
            if self.anchors[i][0] <= self.anchors[i - 1][0]:
                raise ValueError(
                    f"Anchor raw scores must be strictly increasing - "
                    f"anchor {i} ({self.anchors[i][0]}) <= anchor {i-1} "
                    f"({self.anchors[i-1][0]})"
                )

    def calibrate(self, raw_score: float) -> float:
        """
        Convert a raw similarity score to a calibrated confidence probability.

        Args:
            raw_score: cosine similarity from FaceRecognizer (0.0 - 1.0)

        Returns:
            calibrated confidence as a float in [0.0, 1.0]
        """
        score = float(raw_score)

        # clamp to valid range
        score = max(0.0, min(1.0, score))

        # find surrounding anchors and interpolate
        for i in range(1, len(self.anchors)):
            lo_raw, lo_cal = self.anchors[i - 1]
            hi_raw, hi_cal = self.anchors[i]

            if score <= hi_raw:
                # score falls in this segment
                segment_width = hi_raw - lo_raw
                if segment_width == 0.0:
                    return lo_cal
                # linear interpolation
                t = (score - lo_raw) / segment_width
                return round(lo_cal + t * (hi_cal - lo_cal), 6)

        # score is above all anchors - return max calibrated value
        return self.anchors[-1][1]

    def calibrate_with_label(self, raw_score: float) -> dict:
        """
        Calibrate a score and also attach a human-readable confidence label.

        Args:
            raw_score: cosine similarity from FaceRecognizer (0.0 - 1.0)

        Returns:
            dict with:
              'raw_score'          : original score
              'calibrated'         : calibrated probability (0.0 - 1.0)
              'confidence_percent' : calibrated * 100, rounded to 1 dp
              'label'              : 'low' | 'medium' | 'high' | 'very_high'
        """
        calibrated = self.calibrate(raw_score)
        pct = round(calibrated * 100, 1)

        # label bands
        if calibrated < 0.40:
            label = "low"
        elif calibrated < 0.70:
            label = "medium"
        elif calibrated < 0.90:
            label = "high"
        else:
            label = "very_high"

        return {
            "raw_score": float(raw_score),
            "calibrated": calibrated,
            "confidence_percent": pct,
            "label": label,
        }

    def calibrate_batch(self, records: list) -> list:
        """
        Run calibrate_with_label() on a list of attendance record dicts.
        Each record must have a 'similarity' key.

        Adds 'calibrated_confidence', 'confidence_percent', and
        'confidence_label' to each record without mutating the originals.

        Args:
            records: list of dicts, each must contain 'similarity' (float)

        Returns:
            list of dicts with calibration fields added
        """
        results = []
        for record in records:
            raw = float(record.get("similarity", 0.0))
            cal = self.calibrate_with_label(raw)

            enriched = dict(record)
            enriched["calibrated_confidence"] = cal["calibrated"]
            enriched["confidence_percent"] = cal["confidence_percent"]
            enriched["confidence_label"] = cal["label"]
            results.append(enriched)

        return results

    def get_anchors(self) -> List[dict]:
        """Return the calibration anchors as a list of dicts - useful for tests."""
        return [
            {"raw": raw, "calibrated": cal}
            for raw, cal in self.anchors
        ]

    def get_config(self) -> dict:
        """Return current thresholds and anchor count - useful for logging."""
        return {
            "similarity_threshold": self.similarity_threshold,
            "low_confidence_threshold": self.low_confidence_threshold,
            "anchor_count": len(self.anchors),
        }
