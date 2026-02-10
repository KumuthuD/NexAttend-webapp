"""
Single Face Recognition Service
--------------------------------
Complete pipeline for recognizing a single face from a frame.
This service orchestrates the full flow:
  1. Detect single face in frame
  2. Crop the face
  3. Generate embedding
  4. Compare against stored embeddings
  5. Return match result

Author: Viraj Jayasiri
Date: Week 03 Day 12
Branch: feature/ai/single-face-recognition
"""

import cv2
import numpy as np
from typing import List, Dict, Optional, Tuple
import logging

from app.services.face_detector import FaceDetector
from app.services.ai.face_recognizer import FaceRecognizer
from app.services.ai.image_processor import convert_bgr_to_rgb

# configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SingleFaceRecognitionService:
    """
    Service for single face detection and recognition pipeline
    """
    
    def __init__(
        self, 
        min_confidence: float = 0.90,
        similarity_threshold: float = 0.7,
        model_name: str = "Facenet"
    ):
        """
        Initialize the single face recognition service
        
        Args:
            min_confidence: minimum confidence for face detection
            similarity_threshold: minimum similarity score for match
            model_name: DeepFace model to use for embeddings
        """
        try:
            self.detector = FaceDetector(min_confidence=min_confidence)
            self.recognizer = FaceRecognizer(model_name=model_name)
            self.similarity_threshold = similarity_threshold
            
            logger.info(
                f"SingleFaceRecognitionService initialized "
                f"(confidence={min_confidence}, threshold={similarity_threshold}, model={model_name})"
            )
        except Exception as e:
            logger.error(f"Failed to initialize SingleFaceRecognitionService: {e}")
            raise e
    
    def detect_single_face(self, frame: np.ndarray) -> Optional[Dict]:
        """
        Detect the largest face in the frame
        
        Args:
            frame: input frame from camera (BGR format)
            
        Returns:
            face dict with 'box' and 'confidence' or None if no face found
        """
        if frame is None or frame.size == 0:
            logger.warning("Empty frame provided to detect_single_face")
            return None
        
        try:
            # get the largest face only
            face = self.detector.get_largest_face(frame)
            
            if face is None:
                logger.info("No face detected in frame")
                return None
            
            logger.info(f"Face detected with confidence: {face['confidence']:.4f}")
            return face
            
        except Exception as e:
            logger.error(f"Error detecting single face: {e}")
            return None
    
    def crop_detected_face(
        self, 
        frame: np.ndarray, 
        face_box: List[int],
        padding: float = 0.2
    ) -> Optional[np.ndarray]:
        """
        Crop the detected face from the frame with padding
        
        Args:
            frame: input frame (BGR format)
            face_box: bounding box [x, y, w, h]
            padding: padding around face as percentage (default 20%)
            
        Returns:
            cropped face image or None if failed
        """
        try:
            x, y, w, h = face_box
            
            # add padding
            pad_x = int(w * padding)
            pad_y = int(h * padding)
            
            # calculate padded coordinates
            x1 = max(0, x - pad_x)
            y1 = max(0, y - pad_y)
            x2 = min(frame.shape[1], x + w + pad_x)
            y2 = min(frame.shape[0], y + h + pad_y)
            
            # crop the face
            cropped_face = frame[y1:y2, x1:x2]
            
            if cropped_face.size == 0:
                logger.warning("Cropped face is empty")
                return None
            
            logger.info(f"Face cropped: {cropped_face.shape}")
            return cropped_face
            
        except Exception as e:
            logger.error(f"Error cropping face: {e}")
            return None
    
    def generate_embedding(self, face_image: np.ndarray) -> Optional[List[float]]:
        """
        Generate embedding vector for the cropped face
        
        Args:
            face_image: cropped face image (BGR or RGB)
            
        Returns:
            embedding vector (128 or 512 dims) or None if failed
        """
        try:
            # convert to RGB if needed (DeepFace expects RGB)
            if len(face_image.shape) == 3 and face_image.shape[2] == 3:
                face_rgb = convert_bgr_to_rgb(face_image)
            else:
                face_rgb = face_image
            
            # generate embedding
            embedding = self.recognizer.get_embedding(face_rgb)
            
            if embedding is None or len(embedding) == 0:
                logger.warning("Failed to generate embedding")
                return None
            
            logger.info(f"Embedding generated: {len(embedding)} dimensions")
            return embedding
            
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            return None
    
    def find_match(
        self, 
        query_embedding: List[float], 
        stored_embeddings: List[Dict]
    ) -> Optional[Dict]:
        """
        Find the best match for the query embedding from stored embeddings
        
        Args:
            query_embedding: embedding to search for
            stored_embeddings: list of dicts with 'student_id' and 'embedding' keys
            
        Returns:
            dict with 'student_id', 'confidence', 'similarity' or None if no match
        """
        if not query_embedding or not stored_embeddings:
            logger.warning("Empty query embedding or stored embeddings list")
            return None
        
        try:
            # use the recognizer's find_match method
            match_result = self.recognizer.find_match(query_embedding, stored_embeddings)
            
            if match_result is None:
                logger.info("No match found above threshold")
                return None
            
            student_id, similarity_score = match_result
            
            # convert similarity to confidence percentage
            confidence = similarity_score * 100
            
            logger.info(
                f"Match found: student_id={student_id}, "
                f"similarity={similarity_score:.4f}, confidence={confidence:.2f}%"
            )
            
            return {
                "student_id": student_id,
                "similarity": similarity_score,
                "confidence": confidence
            }
            
        except Exception as e:
            logger.error(f"Error finding match: {e}")
            return None
    
    def recognize_single_face(
        self, 
        frame: np.ndarray, 
        stored_embeddings: List[Dict]
    ) -> Dict:
        """
        Complete pipeline: detect -> crop -> embed -> match
        
        Args:
            frame: input frame from camera (BGR format)
            stored_embeddings: list of stored student embeddings from database
            
        Returns:
            dict with recognition result:
            {
                "success": bool,
                "face_detected": bool,
                "match_found": bool,
                "student_id": str or None,
                "confidence": float or None,
                "similarity": float or None,
                "message": str
            }
        """
        result = {
            "success": False,
            "face_detected": False,
            "match_found": False,
            "student_id": None,
            "confidence": None,
            "similarity": None,
            "message": ""
        }
        
        try:
            # step 1: detect single face
            face = self.detect_single_face(frame)
            
            if face is None:
                result["message"] = "No face detected in frame"
                logger.info(result["message"])
                return result
            
            result["face_detected"] = True
            face_box = face['box']
            
            # step 2: crop the detected face
            cropped_face = self.crop_detected_face(frame, face_box)
            
            if cropped_face is None:
                result["message"] = "Failed to crop detected face"
                logger.warning(result["message"])
                return result
            
            # step 3: generate embedding
            embedding = self.generate_embedding(cropped_face)
            
            if embedding is None:
                result["message"] = "Failed to generate face embedding"
                logger.warning(result["message"])
                return result
            
            # step 4: find match from stored embeddings
            match = self.find_match(embedding, stored_embeddings)
            
            if match is None:
                result["success"] = True
                result["message"] = "Face detected but no match found in database"
                logger.info(result["message"])
                return result
            
            # match found
            result["success"] = True
            result["match_found"] = True
            result["student_id"] = match["student_id"]
            result["confidence"] = match["confidence"]
            result["similarity"] = match["similarity"]
            result["message"] = f"Student recognized: {match['student_id']}"
            
            logger.info(result["message"])
            return result
            
        except Exception as e:
            result["message"] = f"Error in recognition pipeline: {str(e)}"
            logger.error(result["message"])
            return result
    
    def process_frame_for_attendance(
        self, 
        frame: np.ndarray, 
        classroom_embeddings: List[Dict]
    ) -> Optional[Dict]:
        """
        Simplified method for attendance marking
        Returns only matched student info or None
        
        Args:
            frame: input frame from camera
            classroom_embeddings: embeddings of students in this classroom
            
        Returns:
            dict with student_id and confidence or None
        """
        result = self.recognize_single_face(frame, classroom_embeddings)
        
        if result["match_found"]:
            return {
                "student_id": result["student_id"],
                "confidence": result["confidence"],
                "similarity": result["similarity"]
            }
        
        return None


# global instance for easy import
single_face_service = SingleFaceRecognitionService()
