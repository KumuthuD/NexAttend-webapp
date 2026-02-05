"""Viraj Jayasiri - Week 02 Day 7"""

from deepface import DeepFace
import numpy as np
from typing import List, Optional, Tuple

class FaceRecognizer:
    def __init__(self, model_name: str = "Facenet"):
        self.model_name = model_name
        # if score is higher than this, it's a match
        self.threshold = 0.7
    
    def get_embedding(self, face_image: np.ndarray) -> List[float]:
        # get the embedding vector for the face
        # enforce_detection=False so it doesn't crash if no face found (but we should have faces)
        result = DeepFace.represent(
            face_image, 
            model_name=self.model_name,
            enforce_detection=False
        )
        # return the first face's embedding
        return result[0]["embedding"]
    
    def compare_embeddings(
        self, 
        embedding1: List[float], 
        embedding2: List[float]
    ) -> float:
        # calc cosine similarity using numpy
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        
        # dot product divided by magnitude of both
        similarity = np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
        return float(similarity)
    
    def compute_similarity(
        self, 
        embedding1: List[float], 
        embedding2: List[float]
    ) -> float:
        # alias for compare_embeddings to match other services
        return self.compare_embeddings(embedding1, embedding2)
    
    def find_match(
        self, 
        face_embedding: List[float], 
        stored_embeddings: List[dict]
    ) -> Optional[Tuple[str, float]]:
        # loop through all stored students
        best_match = None
        best_score = 0
        
        for stored in stored_embeddings:
            similarity = self.compare_embeddings(
                face_embedding, 
                stored["embedding"]
            )
            
            # check if it's a match and better than previous best
            if similarity > self.threshold and similarity > best_score:
                best_score = similarity
                best_match = stored["student_id"]
        
        if best_match:
            return (best_match, best_score)
        
        return None
