
import cv2
import numpy as np
from mtcnn import MTCNN
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FaceDetector:
    def __init__(self, min_face_size: int = 20):
        """
        Initialize MTCNN Face Detector.
        
        Args:
           min_face_size (int): Minimum face size to ingest.
        """
        try:
            self.detector = MTCNN(min_face_size=min_face_size)
            logger.info("FaceDetector (MTCNN) initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize FaceDetector: {e}")
            raise e

    def detect_faces(self, image: np.ndarray) -> list:
        """
        Detect faces in the given image.

        Args:
            image (np.ndarray): Input image in BGR format (OpenCV standard).

        Returns:
            list: List of dictionaries containing face details:
                  [{'box': [x, y, w, h], 'confidence': float, 'keypoints': dict}]
        """
        if image is None:
            logger.warning("Empty image passed to detect_faces.")
            return []

        # Convert BGR to RGB (MTCNN expects RGB)
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        try:
            results = self.detector.detect_faces(image_rgb)
            return results
        except Exception as e:
            logger.error(f"Error during face detection: {e}")
            return []

    def draw_faces(self, image: np.ndarray, faces: list) -> np.ndarray:
        """
        Draw bounding boxes and landmarks on the image.

        Args:
            image (np.ndarray): Original BGR image.
            faces (list): List of face results from detect_faces.

        Returns:
            np.ndarray: Image with drawn annotations.
        """
        annotated_image = image.copy()

        for face in faces:
            x, y, width, height = face['box']
            confidence = face['confidence']
            keypoints = face['keypoints']

            # Draw bounding box (Green)
            cv2.rectangle(annotated_image, (x, y), (x + width, y + height), (0, 255, 0), 2)
            
            # Draw confidence score
            text = f"{confidence:.2f}"
            cv2.putText(annotated_image, text, (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

            # Draw keypoints (Red dots)
            for key, point in keypoints.items():
                cv2.circle(annotated_image, point, 2, (0, 0, 255), 2)

        return annotated_image
