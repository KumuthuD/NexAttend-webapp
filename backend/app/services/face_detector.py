
"""
Face Detector Service
Wrapper class for MTCNN face detection.
Optimized for multiple face detection.

Kumuthu Dahanayake - Week 01 Day 4
Viraj Jayasiri - Week 02 Day 6 (Multi-face optimization)
Viraj Jayasiri - Week 04 Day 16 (Low-light optimization)
Viraj Jayasiri - Week 05 Day 22 (Speed optimization - downscale + frame skip)
Viraj Jayasiri - Week 05 Day 23 (Face quality check - blur, brightness)
"""

import cv2
import numpy as np
from mtcnn import MTCNN
import logging
from typing import List, Dict, Tuple, Optional
from app.services.lighting_optimizer import lighting_optimizer
# Removed app.services.ai.ai_config import to prevent circular dependency

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

            # for frame-skip optimisation (Day 22)
            self._frame_counter = 0
            self._last_result: List[Dict] = []

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

    def detect_faces_fast(
        self,
        image: np.ndarray,
        downscale_ratio: float = None,
        filter_confidence: bool = True,
        sort_by_size: bool = True
    ) -> List[Dict]:
        """
        Detect faces faster by shrinking the frame before MTCNN runs.
        Bounding box coordinates are scaled back to original size.

        downscale_ratio=0.5 halves each dimension -> image is 1/4 the pixels
        -> MTCNN processes ~4x fewer pixels -> roughly 3-4x faster.
        """
        if downscale_ratio is None:
            from app.services.ai.ai_config import DETECTION_DOWNSCALE_RATIO
            downscale_ratio = DETECTION_DOWNSCALE_RATIO

        if image is None or image.size == 0:
            logger.warning("Empty image passed to detect_faces_fast")
            return []

        if downscale_ratio <= 0 or downscale_ratio > 1.0:
            # fallback to normal detection if ratio is invalid
            return self.detect_faces(image, filter_confidence, sort_by_size)

        if downscale_ratio == 1.0:
            # no downscale needed, skip the resize step
            return self.detect_faces(image, filter_confidence, sort_by_size)

        try:
            orig_h, orig_w = image.shape[:2]
            small_w = int(orig_w * downscale_ratio)
            small_h = int(orig_h * downscale_ratio)

            # shrink frame for faster MTCNN pass
            small_frame = cv2.resize(image, (small_w, small_h), interpolation=cv2.INTER_LINEAR)

            # run standard detection on the small frame
            faces_small = self.detect_faces(small_frame, filter_confidence, sort_by_size)

            if not faces_small:
                return []

            # scale bounding boxes back to original resolution
            scale_x = orig_w / small_w
            scale_y = orig_h / small_h

            scaled_faces = []
            for face in faces_small:
                x, y, w, h = face["box"]
                scaled_face = dict(face)  # copy so we don't mutate the original
                scaled_face["box"] = [
                    int(x * scale_x),
                    int(y * scale_y),
                    int(w * scale_x),
                    int(h * scale_y)
                ]
                # keypoints also need scaling
                if "keypoints" in face and face["keypoints"]:
                    scaled_kp = {}
                    for kp_name, kp_point in face["keypoints"].items():
                        scaled_kp[kp_name] = (
                            int(kp_point[0] * scale_x),
                            int(kp_point[1] * scale_y)
                        )
                    scaled_face["keypoints"] = scaled_kp
                scaled_faces.append(scaled_face)

            logger.info(f"detect_faces_fast: {len(scaled_faces)} faces (downscale={downscale_ratio})")
            return scaled_faces

        except Exception as e:
            logger.error(f"Error in detect_faces_fast: {e}")
            return []

    def detect_faces_with_skip(
        self,
        image: np.ndarray,
        frame_skip: int = None,
        use_fast: bool = True,
        downscale_ratio: float = None
    ) -> List[Dict]:
        """
        Skip detection on most frames and reuse the last result.
        Runs actual detection only every frame_skip-th frame.

        Combines well with detect_faces_fast:
        - frame_skip=3 means detect on 1 of every 3 frames
        - downscale_ratio=0.5 makes that detection 3-4x faster
        Together: roughly 10-12x less CPU than the original path.
        """
        if frame_skip is None:
            from app.services.ai.ai_config import DETECTION_FRAME_SKIP
            frame_skip = DETECTION_FRAME_SKIP

        if downscale_ratio is None:
            from app.services.ai.ai_config import DETECTION_DOWNSCALE_RATIO
            downscale_ratio = DETECTION_DOWNSCALE_RATIO

        self._frame_counter += 1

        # run detection every frame_skip frames
        if self._frame_counter % frame_skip != 0:
            # return cached result from last real detection
            logger.debug(f"Frame {self._frame_counter}: skipped, returning cached result")
            return self._last_result

        # actual detection frame
        if use_fast:
            result = self.detect_faces_fast(image, downscale_ratio=downscale_ratio)
        else:
            result = self.detect_faces(image)

        self._last_result = result
        logger.info(f"Frame {self._frame_counter}: detected {len(result)} faces")
        return result

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
        Check if a cropped face image is good enough for recognition.
        Checks minimum resolution, blur, and brightness.
        Returns (passed, reason_string).
        """
        # import here so ai_config is only loaded when this method is called
        from app.services.ai.ai_config import (
            QUALITY_BLUR_THRESHOLD,
            QUALITY_BRIGHTNESS_MIN,
            QUALITY_BRIGHTNESS_MAX,
            QUALITY_MIN_FACE_SIZE,
        )

        if face_image is None or face_image.size == 0:
            return False, "empty image"

        h, w = face_image.shape[:2]

        # face must be large enough to hold useful detail
        if w < QUALITY_MIN_FACE_SIZE or h < QUALITY_MIN_FACE_SIZE:
            return False, f"face too small ({w}x{h}, min {QUALITY_MIN_FACE_SIZE}x{QUALITY_MIN_FACE_SIZE})"

        # convert to grayscale once - used for both blur and brightness
        gray = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)

        # blur check: Laplacian variance - low variance means flat/blurry
        blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
        if blur_score < QUALITY_BLUR_THRESHOLD:
            return False, f"too blurry (score {blur_score:.1f}, min {QUALITY_BLUR_THRESHOLD})"

        # brightness check: mean pixel value in grayscale
        brightness = float(np.mean(gray))
        if brightness < QUALITY_BRIGHTNESS_MIN:
            return False, f"too dark (brightness {brightness:.1f}, min {QUALITY_BRIGHTNESS_MIN})"
        if brightness > QUALITY_BRIGHTNESS_MAX:
            return False, f"too bright (brightness {brightness:.1f}, max {QUALITY_BRIGHTNESS_MAX})"

        return True, "ok"

    def detect_faces_with_quality(
        self,
        image: np.ndarray,
        padding: float = 0.2
    ) -> List[Dict]:
        """
        Detect faces then keep only those that pass the quality check.
        Each returned dict has the normal face keys plus:
          'quality_passed' : bool
          'quality_reason' : str  (why it was kept or would be rejected)

        Faces that fail quality are dropped and logged.
        """
        if image is None or image.size == 0:
            logger.warning("empty image passed to detect_faces_with_quality")
            return []

        faces = self.detect_faces(image)
        if not faces:
            return []

        # crop each face and run the quality check
        good_faces = []
        for face in faces:
            x, y, w, h = face["box"]

            # add padding so the crop matches what the recogniser will see
            pad_w = int(w * padding)
            pad_h = int(h * padding)
            x1 = max(0, x - pad_w)
            y1 = max(0, y - pad_h)
            x2 = min(image.shape[1], x + w + pad_w)
            y2 = min(image.shape[0], y + h + pad_h)

            crop = image[y1:y2, x1:x2]
            passed, reason = self.validate_face_quality(crop)

            face_out = dict(face)
            face_out["quality_passed"] = passed
            face_out["quality_reason"] = reason

            if passed:
                good_faces.append(face_out)
            else:
                logger.info(f"face at {face['box']} rejected: {reason}")

        logger.info(
            f"detect_faces_with_quality: {len(good_faces)}/{len(faces)} faces passed"
        )
        return good_faces


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
