
"""
Embedding Service
Business logic layer for Face Verification and Identification.

Kumuthu Dahanayake
Week 02 Day 7
"""

import logging
import numpy as np
from typing import List, Dict, Tuple, Optional
from app.services.face_recognizer import FaceRecognizer
from app.core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        """
        Initialize the Embedding Service with the FaceRecognizer engine.
        Loads threshold from config.
        """
        try:
            self.recognizer = FaceRecognizer(model_name=settings.FACE_MODEL)
            self.threshold = settings.SIMILARITY_THRESHOLD
            logger.info(f"EmbeddingService initialized (Threshold: {self.threshold})")
        except Exception as e:
            logger.error(f"Failed to initialize EmbeddingService: {e}")
            raise e

    def generate_embedding(self, face_image: np.ndarray) -> Optional[List[float]]:
        """
        Generate an embedding vector for a cropped face image.
        """
        return self.recognizer.get_embedding(face_image)

    def verify_identity(self, embedding1: List[float], embedding2: List[float]) -> Tuple[bool, float]:
        """
        Verify if two embeddings belong to the same person.
        
        Returns:
            (is_match: bool, distance: float)
        """
        if not embedding1 or not embedding2:
            return False, 1.0

        distance = self.recognizer.compute_similarity(embedding1, embedding2)
        is_match = distance < self.threshold
        
        return is_match, distance

    def identify_user(self, query_embedding: List[float], users_db: List[Dict]) -> Tuple[Optional[Dict], float]:
        """
        Identify a user from a database list by finding the best match.
        
        Args:
            query_embedding: The face embedding to search for.
            users_db: List of user dictionaries (must have 'embedding' key).
            
        Returns:
            (best_matched_user, best_distance)
            or (None, min_distance) if no match found.
        """
        if not query_embedding or not users_db:
            return None, 1.0

        best_match = None
        min_distance = 1.0  # Initialize with max distance (opposite)

        for user in users_db:
            if "embedding" not in user or not user["embedding"]:
                continue
                
            distance = self.recognizer.compute_similarity(query_embedding, user["embedding"])
            
            if distance < min_distance:
                min_distance = distance
                if distance < self.threshold:
                    best_match = user

        if best_match:
            logger.info(f"User identified: {best_match.get('name', 'Unknown')} (Dist: {min_distance:.4f})")
        else:
            logger.info(f"No match found. Best distance: {min_distance:.4f}")

        return best_match, min_distance

# Global instance
embedding_service = EmbeddingService()
