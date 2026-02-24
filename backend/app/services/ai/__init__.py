"""
AI Services Module
==================
Exports camera service, image processing utilities, face recognition services,
and the AI configuration constants.
"""

from .camera_service import CameraService
from .face_recognizer import FaceRecognizer
from .single_face_recognition_service import (
    SingleFaceRecognitionService,
    get_single_face_service
)
from .ai_config import (
    FACE_MODEL_NAME,
    FACE_DETECTION_MIN_CONFIDENCE,
    SIMILARITY_THRESHOLD,
    LOW_CONFIDENCE_FLAG_THRESHOLD,
    FACE_CROP_PADDING,
    FACE_INPUT_WIDTH,
    FACE_INPUT_HEIGHT,
    DEFAULT_CAMERA_ID,
    CAMERA_FRAME_WIDTH,
    CAMERA_FRAME_HEIGHT,
    CAMERA_FPS,
    ATTENDANCE_CAPTURE_FPS,
    FACE_IMAGES_DIR,
    TEMP_DIR,
    # speed optimization constants (Week 05 Day 22)
    DETECTION_DOWNSCALE_RATIO,
    DETECTION_FRAME_SKIP
)
from app.services.lighting_optimizer import LightingOptimizer, lighting_optimizer
from .image_processor import (
    resize_image,
    resize_with_aspect_ratio,
    convert_bgr_to_rgb,
    convert_rgb_to_bgr,
    convert_to_grayscale,
    normalize_image,
    crop_image,
    rotate_image,
    flip_image,
    enhance_brightness_contrast,
    validate_image,
    get_image_info
)

__all__ = [
    'CameraService',
    'FaceRecognizer',
    'SingleFaceRecognitionService',
    'get_single_face_service',
    'LightingOptimizer',
    'lighting_optimizer',
    # ai config constants
    'FACE_MODEL_NAME',
    'FACE_DETECTION_MIN_CONFIDENCE',
    'SIMILARITY_THRESHOLD',
    'LOW_CONFIDENCE_FLAG_THRESHOLD',
    'FACE_CROP_PADDING',
    'FACE_INPUT_WIDTH',
    'FACE_INPUT_HEIGHT',
    'DEFAULT_CAMERA_ID',
    'CAMERA_FRAME_WIDTH',
    'CAMERA_FRAME_HEIGHT',
    'CAMERA_FPS',
    'ATTENDANCE_CAPTURE_FPS',
    'FACE_IMAGES_DIR',
    'TEMP_DIR',
    'DETECTION_DOWNSCALE_RATIO',
    'DETECTION_FRAME_SKIP',
    # image processor functions
    'resize_image',
    'resize_with_aspect_ratio',
    'convert_bgr_to_rgb',
    'convert_rgb_to_bgr',
    'convert_to_grayscale',
    'normalize_image',
    'crop_image',
    'rotate_image',
    'flip_image',
    'enhance_brightness_contrast',
    'validate_image',
    'get_image_info'
]
