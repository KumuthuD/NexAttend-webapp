
"""
Face Detector Service
Wrapper class for MTCNN face detection.
Optimized for multiple face detection.

Kumuthu Dahanayake - Week 01 Day 4
Viraj Jayasiri - Week 02 Day 6 (Multi-face optimization)
Viraj Jayasiri - Week 04 Day 16 (Low-light optimization)
"""

import cv2
import numpy as np
from mtcnn import MTCNN
import logging
from typing import List, Dict, Tuple, Optional
from app.services.lighting_optimizer import lighting_optimizer

# configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FaceDetector:
    def __init__(
        self, 
        min_face_size: int = 20,
        scale_factor: float = 0.709,
        steps_threshold: List[float] = None,
        min_confidence: float = 0.90,
        enable_lighting_optimization: bool = True
    ):
        """
        Initialize MTCNN Face Detector with optimized settings for multiple faces.
        """
        try:
            # optimized MTCNN parameters for multiple face detection
            self.detector = MTCNN(
                min_face_size=min_face_size,
                scale_factor=scale_factor,
                steps_threshold=steps_threshold or [0.6, 0.7, 0.7]
            )
            self.min_confidence = min_confidence
            self.min_face_size = min_face_size
            self.enable_lighting_optimization = enable_lighting_optimization
            logger.info(f"FaceDetector initialized (min_face_size={min_face_size}, min_confidence={min_confidence}, lighting_opt={enable_lighting_optimization})")
        except Exception as e:
            logger.error(f"Failed to initialize FaceDetector: {e}")
            raise e

    def detect_faces(
        self, 
        image: np.ndarray,
        filter_confidence: bool = True,
        sort_by_size: bool = True
    ) -> List[Dict]:
        """
        Detect multiple faces in the given image with optimization.
        """
        if image is None or image.size == 0:
            logger.warning("Empty image passed to detect_faces")
            return []

        try:
            # apply lighting optimization for better detection in low-light
            processed_image = image
            if self.enable_lighting_optimization:
                processed_image = lighting_optimizer.optimize_for_detection(image)
            
            # convert BGR to RGB (MTCNN expects RGB)
            image_rgb = cv2.cvtColor(processed_image, cv2.COLOR_BGR2RGB)

            # run detection
            results = self.detector.detect_faces(image_rgb)

            if not results:
                return []

            # filter by confidence threshold
            if filter_confidence:
                results = [
                    face for face in results 
                    if face['confidence'] >= self.min_confidence
                ]

            # filter by minimum face size
            results = self._filter_by_size(results)

            # add face area for sorting
            for face in results:
                x, y, w, h = face['box']
                face['area'] = w * h

            # sort by face area (largest first)
            if sort_by_size and results:
                results.sort(key=lambda x: x['area'], reverse=True)

            logger.info(f"Detected {len(results)} valid faces")
            return results

        except Exception as e:
            logger.error(f"Error during face detection: {e}")
            return []

    def detect_faces_batch(
        self,
        images: List[np.ndarray],
        filter_confidence: bool = True
    ) -> List[List[Dict]]:
        """
        Detect faces in multiple images (batch processing).
        Useful for processing video frames efficiently.
        """
        if not images:
            logger.warning("Empty image list passed to detect_faces_batch")
            return []

        results = []
        for idx, image in enumerate(images):
            faces = self.detect_faces(image, filter_confidence=filter_confidence)
            results.append(faces)
            logger.debug(f"Processed image {idx+1}/{len(images)}: {len(faces)} faces")

        return results

    def _filter_by_size(self, faces: List[Dict]) -> List[Dict]:
        """
        Filter faces by minimum size threshold.
        """
        filtered = []
        for face in faces:
            x, y, w, h = face['box']
            if w >= self.min_face_size and h >= self.min_face_size:
                filtered.append(face)
            else:
                logger.debug(f"Filtered small face: {w}x{h} (min: {self.min_face_size})")
        
        return filtered

    def get_largest_face(self, image: np.ndarray) -> Optional[Dict]:
        """
        Get only the largest face in the image.
        Useful for single-person registration.
        """
        faces = self.detect_faces(image, sort_by_size=True)
        return faces[0] if faces else None

    def crop_faces(
        self,
        image: np.ndarray,
        faces: List[Dict],
        padding: float = 0.2
    ) -> List[np.ndarray]:
        """
        Crop all detected faces from the image with padding.
        """
        cropped_faces = []
        
        for face in faces:
            x, y, w, h = face['box']
            
            # calculate padding
            pad_w = int(w * padding)
            pad_h = int(h * padding)
            
            # apply padding with boundary checks
            x1 = max(0, x - pad_w)
            y1 = max(0, y - pad_h)
            x2 = min(image.shape[1], x + w + pad_w)
            y2 = min(image.shape[0], y + h + pad_h)
            
            # crop face
            cropped = image[y1:y2, x1:x2]
            cropped_faces.append(cropped)
        
        logger.debug(f"Cropped {len(cropped_faces)} faces")
        return cropped_faces

    def validate_face_quality(self, face_image: np.ndarray) -> Tuple[bool, str]:
        """
        Check if face image has good quality for recognition.
        Checks: blur detection, brightness, minimum resolution.
        """
        if face_image is None or face_image.size == 0:
            return False, "Empty image"

        h, w = face_image.shape[:2]
        
        # check minimum resolution
        if w < 80 or h < 80:
            return False, f"Face too small ({w}x{h}, min 80x80)"

        # check blur using Laplacian variance
        gray = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        if laplacian_var < 100:
            return False, f"Image too blurry (variance: {laplacian_var:.1f})"

        # check brightness
        brightness = np.mean(gray)
        if brightness < 40:
            return False, f"Image too dark (brightness: {brightness:.1f})"
        if brightness > 220:
            return False, f"Image too bright (brightness: {brightness:.1f})"

        return True, "Valid face quality"


    def draw_faces(self, image: np.ndarray, faces: List[Dict]) -> np.ndarray:
        """
        Draw bounding boxes and landmarks on the image with enhanced visualization.
        """
        annotated_image = image.copy()

        for idx, face in enumerate(faces):
            x, y, width, height = face['box']
            confidence = face['confidence']
            keypoints = face['keypoints']

            # draw bounding box (green for high confidence, yellow for medium)
            color = (0, 255, 0) if confidence >= 0.95 else (0, 255, 255)
            cv2.rectangle(annotated_image, (x, y), (x + width, y + height), color, 2)
            
            # draw face number and confidence score
            text = f"#{idx+1} {confidence:.2f}"
            cv2.putText(annotated_image, text, (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            
            # draw face area at bottom
            area = face.get('area', width * height)
            area_text = f"{area}px"
            cv2.putText(annotated_image, area_text, (x, y + height + 20),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 1)

            # draw keypoints (red dots)
            for key, point in keypoints.items():
                cv2.circle(annotated_image, point, 2, (0, 0, 255), 2)

        # draw total count at top
        count_text = f"Faces: {len(faces)}"
        cv2.putText(annotated_image, count_text, (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        return annotated_image

    def get_face_count(self, image: np.ndarray) -> int:
        """
        Quick method to get face count without full processing.
        """
        faces = self.detect_faces(image, filter_confidence=True)
        return len(faces)

    def filter_overlapping_faces(
        self,
        faces: List[Dict],
        overlap_threshold: float = 0.5
    ) -> List[Dict]:
        """
        Remove overlapping face detections using Non-Maximum Suppression.
        Keeps the face with highest confidence when overlap detected.
        """
        if len(faces) <= 1:
            return faces

        # sort by confidence descending
        faces_sorted = sorted(faces, key=lambda x: x['confidence'], reverse=True)
        
        filtered_faces = []
        
        for face in faces_sorted:
            # check if this face overlaps with any already selected face
            is_overlapping = False
            
            for selected_face in filtered_faces:
                iou = self._calculate_iou(face['box'], selected_face['box'])
                if iou > overlap_threshold:
                    is_overlapping = True
                    break
            
            if not is_overlapping:
                filtered_faces.append(face)
        
        logger.debug(f"Filtered {len(faces)} -> {len(filtered_faces)} faces (removed overlaps)")
        return filtered_faces

    def _calculate_iou(self, box1: List[int], box2: List[int]) -> float:
        """
        Calculate Intersection over Union (IoU) between two boxes.

        Returns:
            float: IoU value (0.0 to 1.0)
        """
        x1, y1, w1, h1 = box1
        x2, y2, w2, h2 = box2

        # calculate intersection
        x_left = max(x1, x2)
        y_top = max(y1, y2)
        x_right = min(x1 + w1, x2 + w2)
        y_bottom = min(y1 + h1, y2 + h2)

        if x_right < x_left or y_bottom < y_top:
            return 0.0

        intersection_area = (x_right - x_left) * (y_bottom - y_top)

        # calculate union
        box1_area = w1 * h1
        box2_area = w2 * h2
        union_area = box1_area + box2_area - intersection_area

        iou = intersection_area / union_area if union_area > 0 else 0.0
        return iou
