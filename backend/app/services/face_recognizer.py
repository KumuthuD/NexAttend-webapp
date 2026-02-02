
"""
Face Recognizer Service
Wrapper for DeepFace embedding generation and comparison.

Kumuthu Dahanayake
Week 01 Day 5
"""

import numpy as np
import logging
from deepface import DeepFace
from scipy.spatial.distance import cosine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FaceRecognizer:
    def __init__(self, model_name: str = "Facenet"):
        """
        Initialize Face Recognizer with a specific model.
        
        Args:
            model_name (str): Model to use (Facenet, VGG-Face, ArcFace, etc.)
                              Default is "Facenet" (128-dim).
        """
        self.model_name = model_name
        try:
            # We run a dummy representation to warm up the model loading
            # Creating a small dummy image
            dummy_img = np.zeros((160, 160, 3), dtype=np.uint8)
            DeepFace.represent(img_path=dummy_img, model_name=self.model_name, enforce_detection=False)
            logger.info(f"FaceRecognizer initialized with model: {self.model_name}")
        except Exception as e:
            logger.error(f"Failed to initialize FaceRecognizer: {e}")
            raise e

    def get_embedding(self, face_image: np.ndarray) -> list:
        """
        Generate embedding vector for a given face image.
        
        Args:
            face_image (np.ndarray): Cropped face image (BGR or RGB).
            
        Returns:
            list: Embedding vector (list of floats).
            None: If embedding generation fails.
        """
        if face_image is None or face_image.size == 0:
            logger.warning("Empty image passed to get_embedding.")
            return None

        try:
            # DeepFace.represent returns a list of dicts. We take the first one.
            # enforce_detection=False because we assume face_detector already cropped it.
            embedding_objs = DeepFace.represent(
                img_path=face_image,
                model_name=self.model_name,
                enforce_detection=False
            )
            
            if not embedding_objs:
                return None
                
            return embedding_objs[0]["embedding"]
            
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            return None

    def compute_similarity(self, embedding1: list, embedding2: list) -> float:
        """
        Compute cosine similarity between two embeddings.
        
        Args:
            embedding1 (list): First embedding vector.
            embedding2 (list): Second embedding vector.
            
        Returns:
            float: Cosine distance (0.0 = identical, 1.0 = opposite).
                   Lower is better. Typically < 0.4 is a match for Facenet.
        """
        try:
            if not embedding1 or not embedding2:
                return 1.0
            
            # cosine() returns distance (1 - similarity)
            return cosine(embedding1, embedding2)
        except Exception as e:
            logger.error(f"Error computing similarity: {e}")
            return 1.0
