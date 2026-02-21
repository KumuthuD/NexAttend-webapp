"""Viraj Jayasiri - Week 04 Day 18"""

# AI Configuration

import os

# ------------------------------------------------------------------
# Model Settings
# ------------------------------------------------------------------

# DeepFace model used for generating face embeddings
# Options: "Facenet", "Facenet512", "VGG-Face", "ArcFace", "DeepFace"
# Facenet gives 128-dim vectors - good balance of speed and accuracy
FACE_MODEL_NAME: str = os.getenv("FACE_MODEL", "Facenet")

# MTCNN minimum confidence to accept a detected face
# Lower = detects more faces but may pick up false positives
# 0.90 works well in normal classroom lighting
FACE_DETECTION_MIN_CONFIDENCE: float = float(
    os.getenv("FACE_DETECTION_MIN_CONFIDENCE", "0.90")
)


# ------------------------------------------------------------------
# Recognition Thresholds
# ------------------------------------------------------------------

# Cosine similarity score required to call it a match
# Range: 0.0 to 1.0 (higher = stricter)
# 0.70 means the two embeddings must be 70% similar
# Tested range: 0.65 (loose) - 0.80 (strict)
SIMILARITY_THRESHOLD: float = float(
    os.getenv("SIMILARITY_THRESHOLD", "0.70")
)

# Below this confidence the match is flagged as uncertain
# Used by anomaly detection (Day 26) to flag low-confidence records
LOW_CONFIDENCE_FLAG_THRESHOLD: float = float(
    os.getenv("LOW_CONFIDENCE_FLAG_THRESHOLD", "0.60")
)


# ------------------------------------------------------------------
# Face Cropping
# ------------------------------------------------------------------

# Padding added around the detected face box before passing to DeepFace
# 0.20 = 20% padding on each side - helps include full face context
FACE_CROP_PADDING: float = float(os.getenv("FACE_CROP_PADDING", "0.20"))


# ------------------------------------------------------------------
# Image Preprocessing
# ------------------------------------------------------------------

# Size DeepFace internally resizes face crops to (pixels)
# Facenet expects 160x160
FACE_INPUT_WIDTH: int = int(os.getenv("FACE_INPUT_WIDTH", "160"))
FACE_INPUT_HEIGHT: int = int(os.getenv("FACE_INPUT_HEIGHT", "160"))


# ------------------------------------------------------------------
# Camera / Frame Capture
# ------------------------------------------------------------------

# Default camera device index (0 = primary webcam)
DEFAULT_CAMERA_ID: int = int(os.getenv("DEFAULT_CAMERA_ID", "0"))

# Frame capture resolution
CAMERA_FRAME_WIDTH: int = int(os.getenv("CAMERA_FRAME_WIDTH", "640"))
CAMERA_FRAME_HEIGHT: int = int(os.getenv("CAMERA_FRAME_HEIGHT", "480"))
CAMERA_FPS: int = int(os.getenv("CAMERA_FPS", "30"))

# Frames per second to process during an attendance session
# Lower value reduces CPU load - 1 fps is enough for attendance
ATTENDANCE_CAPTURE_FPS: int = int(os.getenv("ATTENDANCE_CAPTURE_FPS", "1"))


# ------------------------------------------------------------------
# Storage Paths
# ------------------------------------------------------------------

# Directory where student face images are saved after registration
FACE_IMAGES_DIR: str = os.getenv("UPLOAD_DIR", "./data/face_images")

# Temp directory for intermediate processing files
TEMP_DIR: str = os.getenv("TEMP_DIR", "./data/temp")
