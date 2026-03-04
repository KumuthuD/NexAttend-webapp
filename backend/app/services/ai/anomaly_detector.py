"""Viraj Jayasiri - Week 06 Day 26
Fine-tune anomaly threshold for attendance records."""

from app.services.ai.ai_config import (
    SIMILARITY_THRESHOLD,
    LOW_CONFIDENCE_FLAG_THRESHOLD,
)


class AnomalyDetector:
    """
    Checks an attendance record's similarity score and decides
    whether it should be flagged as anomalous.

    Three outcomes for any given score:
      - score >= similarity_threshold       -> ACCEPTED  (confident match)
      - low_flag_threshold <= score < similarity_threshold -> FLAGGED   (uncertain, needs review)
      - score < low_flag_threshold          -> REJECTED  (too low to trust)
    """

    def __init__(
        self,
        similarity_threshold: float = SIMILARITY_THRESHOLD,
        low_confidence_threshold: float = LOW_CONFIDENCE_FLAG_THRESHOLD,
    ):
        # match threshold - same one FaceRecognizer uses to accept a match
        self.similarity_threshold = similarity_threshold

        # anything below this is an outright reject, not just a flag
        self.low_confidence_threshold = low_confidence_threshold

        # sanity check: flag threshold must be below match threshold
        if self.low_confidence_threshold >= self.similarity_threshold:
            raise ValueError(
                f"low_confidence_threshold ({self.low_confidence_threshold}) "
                f"must be less than similarity_threshold ({self.similarity_threshold})"
            )

    def check(self, similarity_score: float) -> dict:
        """
        Evaluate a single similarity score.

        Args:
            similarity_score: cosine similarity from FaceRecognizer (0.0 - 1.0)

        Returns:
            dict with:
              'status'  : 'accepted' | 'flagged' | 'rejected'
              'anomaly' : True if status is 'flagged' or 'rejected'
              'reason'  : short explanation string
              'score'   : the original score passed in
        """
        score = float(similarity_score)

        if score >= self.similarity_threshold:
            # confident - mark as accepted
            return {
                "status": "accepted",
                "anomaly": False,
                "reason": f"score {score:.4f} >= threshold {self.similarity_threshold}",
                "score": score,
            }

        if score >= self.low_confidence_threshold:
            # somewhere in the grey zone - flag for manual review
            return {
                "status": "flagged",
                "anomaly": True,
                "reason": (
                    f"score {score:.4f} is between low_confidence_threshold "
                    f"({self.low_confidence_threshold}) and similarity_threshold "
                    f"({self.similarity_threshold}) - needs review"
                ),
                "score": score,
            }

        # score is below even the low-confidence floor - outright reject
        return {
            "status": "rejected",
            "anomaly": True,
            "reason": f"score {score:.4f} < low_confidence_threshold {self.low_confidence_threshold}",
            "score": score,
        }

    def check_batch(self, records: list) -> list:
        """
        Run check() on a list of attendance record dicts.
        Each record must have a 'similarity' key.

        Returns the same list with 'anomaly_status', 'anomaly', and
        'anomaly_reason' fields added to each record dict.

        Args:
            records: list of dicts, each must contain 'similarity' (float)

        Returns:
            list of dicts with anomaly fields added in place
        """
        results = []
        for record in records:
            score = record.get("similarity", 0.0)
            outcome = self.check(score)

            # copy so we don't mutate the original dict
            enriched = dict(record)
            enriched["anomaly_status"] = outcome["status"]
            enriched["anomaly"] = outcome["anomaly"]
            enriched["anomaly_reason"] = outcome["reason"]
            results.append(enriched)

        return results

    def get_thresholds(self) -> dict:
        """Return the current threshold values - useful for logging and tests."""
        return {
            "similarity_threshold": self.similarity_threshold,
            "low_confidence_threshold": self.low_confidence_threshold,
        }
