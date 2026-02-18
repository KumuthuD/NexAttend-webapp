"""
AI Services Module
==================
Exports camera service, image processing utilities, face recognition services
"""

from .camera_service import CameraService
from .face_recognizer import FaceRecognizer
from .single_face_recognition_service import (
    SingleFaceRecognitionService,
    single_face_service
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
    'single_face_service',
    'LightingOptimizer',
    'lighting_optimizer',
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
