# AI Configuration Guide

Author: Viraj Jayasiri
Date: Week 06 Day 25
Branch: docs/ai-config-guide

---

## Overview

All AI-related settings live in one file:

```
backend/app/services/ai/ai_config.py
```

This file was introduced on Day 18 to stop hardcoded values being scattered across
multiple service files. Every constant in that file can also be overridden with an
environment variable, so staging and production can use different values without
touching code.

---

## How Environment Variable Overrides Work

Every constant follows the same pattern:

```python
SOME_CONSTANT: type = type(os.getenv("ENV_VAR_NAME", "default_value"))
```

`os.getenv` returns the env var string if it exists, or the default string if not.
The outer `float()` / `int()` cast converts it to the right type.

Example — if you set `SIMILARITY_THRESHOLD=0.75` in `.env`, that value is used
instead of the coded default of `0.70`.

---

## .env File Quick Start

Copy `.env.example` to `.env` and fill in the values you want to change.
Leave a line out to use the default from `ai_config.py`.

```bash
# .env  (only include values you actually want to override)
FACE_MODEL=Facenet
SIMILARITY_THRESHOLD=0.70
FACE_DETECTION_MIN_CONFIDENCE=0.90
DETECTION_DOWNSCALE_RATIO=0.5
DETECTION_FRAME_SKIP=3
QUALITY_BLUR_THRESHOLD=100.0
QUALITY_BRIGHTNESS_MIN=40.0
QUALITY_BRIGHTNESS_MAX=220.0
QUALITY_MIN_FACE_SIZE=80
DEFAULT_CAMERA_ID=0
CAMERA_FRAME_WIDTH=640
CAMERA_FRAME_HEIGHT=480
CAMERA_FPS=30
ATTENDANCE_CAPTURE_FPS=1
UPLOAD_DIR=./data/face_images
TEMP_DIR=./data/temp
```

---

## Constants Reference

### Model Settings

---

#### `FACE_MODEL_NAME`

```python
FACE_MODEL_NAME: str = os.getenv("FACE_MODEL", "Facenet")
```

Which DeepFace model generates the face embedding vectors.

| Model        | Embedding size | Speed  | Notes                       |
| ------------ | -------------- | ------ | --------------------------- |
| `Facenet`    | 128-dim        | Fast   | Default — good balance      |
| `Facenet512` | 512-dim        | Medium | More detail, larger vectors |
| `VGG-Face`   | 2622-dim       | Slow   | Very high accuracy          |
| `ArcFace`    | 512-dim        | Medium | State-of-the-art            |

**When to change:** Switch to `Facenet512` or `ArcFace` if you need higher accuracy
and can afford the slower processing time. Keep `Facenet` for normal use.

**Where it is used:**

- `FaceRecognizer.__init__()` sets `self.model_name`
- `SingleFaceRecognitionService.__init__()` passes it to `FaceRecognizer`

---

#### `FACE_DETECTION_MIN_CONFIDENCE`

```python
FACE_DETECTION_MIN_CONFIDENCE: float = float(
    os.getenv("FACE_DETECTION_MIN_CONFIDENCE", "0.90")
)
```

Minimum MTCNN confidence score (0.0 to 1.0) to accept a detected face box.

| Value  | Effect                                            |
| ------ | ------------------------------------------------- |
| `0.80` | More detections, more false positives             |
| `0.90` | Default — works well in normal classroom lighting |
| `0.95` | Stricter — used for face registration             |

**When to change:** Lower to `0.85` if faces are being missed in bad lighting.
Raise to `0.95` for registration where quality matters more.

---

### Recognition Thresholds

---

#### `SIMILARITY_THRESHOLD`

```python
SIMILARITY_THRESHOLD: float = float(
    os.getenv("SIMILARITY_THRESHOLD", "0.70")
)
```

Cosine similarity score (0.0 to 1.0) required to call two embeddings a match.
Higher value = stricter matching.

| Value  | Outcome                                          |
| ------ | ------------------------------------------------ |
| `0.65` | Loose — more matches, risk of false positives    |
| `0.70` | Default — balanced for classroom attendance      |
| `0.80` | Strict — fewer matches, risk of missing students |

**How it works:** After comparing a captured face embedding to a stored embedding,
if the resulting similarity score is above this threshold AND is the highest score
among all stored embeddings, the student is considered recognized.

**Where it is used:**

- `FaceRecognizer.__init__()` sets `self.threshold`
- `FaceRecognizer.find_match()` uses it for the match decision
- `SingleFaceRecognitionService.__init__()` passes it down

---

#### `LOW_CONFIDENCE_FLAG_THRESHOLD`

```python
LOW_CONFIDENCE_FLAG_THRESHOLD: float = float(
    os.getenv("LOW_CONFIDENCE_FLAG_THRESHOLD", "0.60")
)
```

If a match is found but the similarity score falls between this value and
`SIMILARITY_THRESHOLD`, the attendance record can be flagged as uncertain
for review. This is used by the anomaly detection module (Day 26).

**Example:** Score of `0.65` is above `LOW_CONFIDENCE_FLAG_THRESHOLD` (0.60)
but below `SIMILARITY_THRESHOLD` (0.70) — the record is flagged, not rejected
outright.

**When to change:** Lower this only if you want to flag more records. Normally
keep at `0.60`.

---

### Face Cropping

---

#### `FACE_CROP_PADDING`

```python
FACE_CROP_PADDING: float = float(os.getenv("FACE_CROP_PADDING", "0.20"))
```

Padding added around the MTCNN bounding box before passing the crop to DeepFace.
Value is a fraction of the face width/height.

`0.20` = 20% padding on each side.

**Why it matters:** MTCNN sometimes clips the edges of the face. Padding ensures
the full face — including forehead and chin — is included in the crop, which
improves embedding quality.

| Value  | Effect                                           |
| ------ | ------------------------------------------------ |
| `0.10` | Tight crop — faster, may miss face edges         |
| `0.20` | Default — includes enough context                |
| `0.30` | Generous crop — slower, includes more background |

**Where it is used:** `SingleFaceRecognitionService.crop_detected_face()`

---

### Image Preprocessing

---

#### `FACE_INPUT_WIDTH` / `FACE_INPUT_HEIGHT`

```python
FACE_INPUT_WIDTH: int = int(os.getenv("FACE_INPUT_WIDTH", "160"))
FACE_INPUT_HEIGHT: int = int(os.getenv("FACE_INPUT_HEIGHT", "160"))
```

The size DeepFace internally resizes face crops to before generating an embedding.
Facenet expects exactly `160 x 160` pixels.

**Do not change these** unless you switch to a different model.

- `Facenet` / `Facenet512` → 160x160
- `VGG-Face` → 224x224
- `ArcFace` → 112x112

---

### Camera / Frame Capture

---

#### `DEFAULT_CAMERA_ID`

```python
DEFAULT_CAMERA_ID: int = int(os.getenv("DEFAULT_CAMERA_ID", "0"))
```

OpenCV device index for the webcam. `0` is the primary (built-in) camera.
Use `1` or `2` for external cameras.

**How to find your camera index:**

```python
import cv2
for i in range(5):
    cap = cv2.VideoCapture(i)
    if cap.isOpened():
        print(f"Camera {i} is available")
        cap.release()
```

---

#### `CAMERA_FRAME_WIDTH` / `CAMERA_FRAME_HEIGHT`

```python
CAMERA_FRAME_WIDTH: int = int(os.getenv("CAMERA_FRAME_WIDTH", "640"))
CAMERA_FRAME_HEIGHT: int = int(os.getenv("CAMERA_FRAME_HEIGHT", "480"))
```

Resolution OpenCV requests from the webcam. Note: the camera may not support
every resolution and may round to the nearest supported size.

`640x480` is a safe default that most webcams support.

---

#### `CAMERA_FPS`

```python
CAMERA_FPS: int = int(os.getenv("CAMERA_FPS", "30"))
```

Target frame rate requested from the webcam hardware. This affects how fast
OpenCV reads frames from the device, not how fast the AI pipeline processes them.

---

#### `ATTENDANCE_CAPTURE_FPS`

```python
ATTENDANCE_CAPTURE_FPS: int = int(os.getenv("ATTENDANCE_CAPTURE_FPS", "1"))
```

How many frames per second the attendance capture loop sends to the AI pipeline.
Keeping this at `1` is intentional — faces are not moving fast enough to need
more frequent checks and it saves a lot of CPU.

**Relationship with `DETECTION_FRAME_SKIP`:** These two work at different levels.
`ATTENDANCE_CAPTURE_FPS` controls how often a frame is captured. `DETECTION_FRAME_SKIP`
controls how often the AI pipeline actually runs MTCNN on the captured frame.

---

### Storage Paths

---

#### `FACE_IMAGES_DIR`

```python
FACE_IMAGES_DIR: str = os.getenv("UPLOAD_DIR", "./data/face_images")
```

Directory where student face images are saved after registration.
The env var key is `UPLOAD_DIR` (shared with the general upload path setting).

Set this in `.env` to point to a persistent volume in production:

```bash
UPLOAD_DIR=/app/data/face_images
```

---

#### `TEMP_DIR`

```python
TEMP_DIR: str = os.getenv("TEMP_DIR", "./data/temp")
```

Scratch directory for any intermediate image files created during processing.
Safe to clear between sessions.

---

### Speed Optimization (Day 22)

These two constants were added in Week 05 Day 22 to reduce CPU load during
attendance sessions.

---

#### `DETECTION_DOWNSCALE_RATIO`

```python
DETECTION_DOWNSCALE_RATIO: float = float(
    os.getenv("DETECTION_DOWNSCALE_RATIO", "0.5")
)
```

Before running MTCNN, the frame is shrunk by this ratio. MTCNN runs on the
smaller image, then bounding box coordinates are scaled back up to original size.

| Value  | Frame size         | Speed gain               | Accuracy                    |
| ------ | ------------------ | ------------------------ | --------------------------- |
| `1.0`  | Original (640x480) | None — original behavior | Best                        |
| `0.75` | 480x360            | ~2x faster               | Near-identical              |
| `0.5`  | 320x240            | ~4x faster               | Slight drop for small faces |
| `0.25` | 160x120            | ~8x faster               | Not recommended             |

**Default `0.5`** is the recommended trade-off. Faces smaller than about
80px wide may be missed at this ratio — that is handled by `QUALITY_MIN_FACE_SIZE`.

**Where it is used:** `FaceDetector.detect_faces_downscaled()` (face_detector.py)

---

#### `DETECTION_FRAME_SKIP`

```python
DETECTION_FRAME_SKIP: int = int(os.getenv("DETECTION_FRAME_SKIP", "3"))
```

Only run MTCNN once every N frames. In between, the last detection result is reused.

| Value | MTCNN runs per second | Use case               |
| ----- | --------------------- | ---------------------- |
| `1`   | Every frame — no skip | High-precision mode    |
| `3`   | 1 in 3 frames         | Default — good balance |
| `5`   | 1 in 5 frames         | Low-power devices      |

**How it works in code:**

```python
# frame_count increments every frame
if frame_count % DETECTION_FRAME_SKIP == 0:
    last_faces = detector.detect_faces(frame)  # run MTCNN
else:
    pass  # reuse last_faces
```

**Where it is used:** `FaceDetector` frame skip logic or the capture loop.

---

### Face Quality Checks (Day 23)

These constants gate whether a detected face crop is good enough to send to
DeepFace for embedding generation. Bad-quality crops produce unreliable
embeddings, so they are rejected early.

---

#### `QUALITY_BLUR_THRESHOLD`

```python
QUALITY_BLUR_THRESHOLD: float = float(
    os.getenv("QUALITY_BLUR_THRESHOLD", "100.0")
)
```

Minimum Laplacian variance score for the face crop. The Laplacian operator
measures edge sharpness. A blurry image has few sharp edges, giving a low score.

```python
# how the check works
laplacian_var = cv2.Laplacian(gray_face, cv2.CV_64F).var()
is_sharp_enough = laplacian_var >= QUALITY_BLUR_THRESHOLD
```

| Value   | Effect                                               |
| ------- | ---------------------------------------------------- |
| `50.0`  | Accepts slightly blurry frames                       |
| `100.0` | Default — rejects motion blur, accepts normal webcam |
| `150.0` | Stricter — only very sharp faces pass                |

**Tip:** If you are getting too many "blurry" rejections in a good-lighting room,
lower this to `60.0` and test again.

---

#### `QUALITY_BRIGHTNESS_MIN` / `QUALITY_BRIGHTNESS_MAX`

```python
QUALITY_BRIGHTNESS_MIN: float = float(
    os.getenv("QUALITY_BRIGHTNESS_MIN", "40.0")
)
QUALITY_BRIGHTNESS_MAX: float = float(
    os.getenv("QUALITY_BRIGHTNESS_MAX", "220.0")
)
```

Acceptable range for the average pixel brightness of the face crop (grayscale, 0-255).

```python
# how the check works
gray_face = cv2.cvtColor(face_crop, cv2.COLOR_BGR2GRAY)
avg_brightness = gray_face.mean()
is_bright_enough = QUALITY_BRIGHTNESS_MIN <= avg_brightness <= QUALITY_BRIGHTNESS_MAX
```

| Constant | Default | Too low means     | Too high means                                 |
| -------- | ------- | ----------------- | ---------------------------------------------- |
| `MIN`    | 40.0    | Frame too dark    | Increase MIN if dim rooms are rejected wrongly |
| `MAX`    | 220.0   | Frame overexposed | Lower MAX if bright windows cause issues       |

**Where it is used:** `FaceDetector.detect_faces_with_quality()` (face_detector.py)

---

#### `QUALITY_MIN_FACE_SIZE`

```python
QUALITY_MIN_FACE_SIZE: int = int(os.getenv("QUALITY_MIN_FACE_SIZE", "80"))
```

Minimum width AND height of the detected face bounding box in pixels.
Faces smaller than this are too far from the camera or too small in the frame
to produce a reliable embedding.

```python
# how the check works
x, y, w, h = face["box"]
is_large_enough = w >= QUALITY_MIN_FACE_SIZE and h >= QUALITY_MIN_FACE_SIZE
```

| Value | Effect                                                          |
| ----- | --------------------------------------------------------------- |
| `50`  | Accepts small/distant faces                                     |
| `80`  | Default — rejects very small faces that MTCNN picks up as noise |
| `120` | Only accepts close-up faces                                     |

**Note:** This should be consistent with `DETECTION_DOWNSCALE_RATIO`.
At `0.5` downscale, a `160px` real face becomes `80px` in the scaled frame —
so the minimum size here applies to the original frame coordinates (after scaling back).

---

## How the Constants Connect to Services

```
ai_config.py
    |
    |-- FACE_MODEL_NAME
    |-- SIMILARITY_THRESHOLD          --> FaceRecognizer
    |
    |-- FACE_DETECTION_MIN_CONFIDENCE
    |-- FACE_CROP_PADDING             --> SingleFaceRecognitionService
    |-- FACE_MODEL_NAME
    |-- SIMILARITY_THRESHOLD
    |
    |-- DETECTION_DOWNSCALE_RATIO
    |-- DETECTION_FRAME_SKIP          --> face_detector.py (FaceDetector)
    |-- QUALITY_BLUR_THRESHOLD
    |-- QUALITY_BRIGHTNESS_MIN
    |-- QUALITY_BRIGHTNESS_MAX
    |-- QUALITY_MIN_FACE_SIZE
    |
    |-- DEFAULT_CAMERA_ID
    |-- CAMERA_FRAME_WIDTH            --> camera_service.py (CameraService)
    |-- CAMERA_FRAME_HEIGHT
    |-- CAMERA_FPS
    |-- ATTENDANCE_CAPTURE_FPS
    |
    |-- FACE_IMAGES_DIR
    |-- TEMP_DIR                      --> embedding_service.py / registration
```

All of these are also re-exported from `app/services/ai/__init__.py` so other
modules can do:

```python
from app.services.ai import SIMILARITY_THRESHOLD, QUALITY_BLUR_THRESHOLD
```

---

## Changing Values in Different Environments

### Local Development

Set values in `backend/.env`:

```bash
# .env
SIMILARITY_THRESHOLD=0.70
DETECTION_DOWNSCALE_RATIO=0.5
```

### Staging (Render)

Set environment variables in the Render dashboard under your service's
Environment tab. No `.env` file is needed — Render injects them directly.

### Production

Same as staging. Recommended production values:

```bash
SIMILARITY_THRESHOLD=0.72        # slightly stricter than dev
QUALITY_BLUR_THRESHOLD=80.0      # slightly more lenient for varied conditions
DETECTION_DOWNSCALE_RATIO=0.5    # keep the speed optimization on
DETECTION_FRAME_SKIP=3           # keep frame skip on
```

---

## Adding a New Config Constant

Follow the existing pattern in `ai_config.py`:

```python
# ------------------------------------------------------------------
# Section Name
# ------------------------------------------------------------------

# short comment explaining what this controls
NEW_CONSTANT: type = type(os.getenv("ENV_VAR_NAME", "default_value"))
```

Then export it in `app/services/ai/__init__.py`:

```python
from .ai_config import (
    ...,
    NEW_CONSTANT,
)

__all__ = [
    ...,
    'NEW_CONSTANT',
]
```

---

## Related Files

| File                                                         | Role                                                      |
| ------------------------------------------------------------ | --------------------------------------------------------- |
| `backend/app/services/ai/ai_config.py`                       | All AI constants defined here                             |
| `backend/app/services/ai/__init__.py`                        | Re-exports constants for other modules                    |
| `backend/app/services/ai/face_recognizer.py`                 | Uses model name and threshold                             |
| `backend/app/services/ai/single_face_recognition_service.py` | Uses detection confidence, padding, model, threshold      |
| `backend/app/services/face_detector.py`                      | Uses downscale ratio, frame skip, quality check constants |
| `backend/.env.example`                                       | Template for local env vars                               |

---

## Testing the Config

A quick sanity check to print all current values:

```python
# run from backend/ with: python -c "from tests.scripts import print_ai_config"
# or just run this inline

from app.services.ai.ai_config import (
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
    DETECTION_DOWNSCALE_RATIO,
    DETECTION_FRAME_SKIP,
    QUALITY_BLUR_THRESHOLD,
    QUALITY_BRIGHTNESS_MIN,
    QUALITY_BRIGHTNESS_MAX,
    QUALITY_MIN_FACE_SIZE,
)

print("--- AI Config Values ---")
print(f"Model:                  {FACE_MODEL_NAME}")
print(f"Detection confidence:   {FACE_DETECTION_MIN_CONFIDENCE}")
print(f"Similarity threshold:   {SIMILARITY_THRESHOLD}")
print(f"Low confidence flag:    {LOW_CONFIDENCE_FLAG_THRESHOLD}")
print(f"Crop padding:           {FACE_CROP_PADDING}")
print(f"Face input size:        {FACE_INPUT_WIDTH}x{FACE_INPUT_HEIGHT}")
print(f"Camera ID:              {DEFAULT_CAMERA_ID}")
print(f"Frame size:             {CAMERA_FRAME_WIDTH}x{CAMERA_FRAME_HEIGHT}")
print(f"Camera FPS:             {CAMERA_FPS}")
print(f"Attendance capture FPS: {ATTENDANCE_CAPTURE_FPS}")
print(f"Downscale ratio:        {DETECTION_DOWNSCALE_RATIO}")
print(f"Frame skip:             {DETECTION_FRAME_SKIP}")
print(f"Blur threshold:         {QUALITY_BLUR_THRESHOLD}")
print(f"Brightness min/max:     {QUALITY_BRIGHTNESS_MIN} / {QUALITY_BRIGHTNESS_MAX}")
print(f"Min face size:          {QUALITY_MIN_FACE_SIZE}px")
print(f"Face images dir:        {FACE_IMAGES_DIR}")
print(f"Temp dir:               {TEMP_DIR}")
```

Run it:

```bash
cd backend
python -c "exec(open('tests/scripts/print_ai_config.py').read())"
```

Or just paste the block above into a Python shell in the venv.

---

## Summary Table

| Constant                        | Default              | Env Var                         | Added  |
| ------------------------------- | -------------------- | ------------------------------- | ------ |
| `FACE_MODEL_NAME`               | `Facenet`            | `FACE_MODEL`                    | Day 18 |
| `FACE_DETECTION_MIN_CONFIDENCE` | `0.90`               | `FACE_DETECTION_MIN_CONFIDENCE` | Day 18 |
| `SIMILARITY_THRESHOLD`          | `0.70`               | `SIMILARITY_THRESHOLD`          | Day 18 |
| `LOW_CONFIDENCE_FLAG_THRESHOLD` | `0.60`               | `LOW_CONFIDENCE_FLAG_THRESHOLD` | Day 18 |
| `FACE_CROP_PADDING`             | `0.20`               | `FACE_CROP_PADDING`             | Day 18 |
| `FACE_INPUT_WIDTH`              | `160`                | `FACE_INPUT_WIDTH`              | Day 18 |
| `FACE_INPUT_HEIGHT`             | `160`                | `FACE_INPUT_HEIGHT`             | Day 18 |
| `DEFAULT_CAMERA_ID`             | `0`                  | `DEFAULT_CAMERA_ID`             | Day 18 |
| `CAMERA_FRAME_WIDTH`            | `640`                | `CAMERA_FRAME_WIDTH`            | Day 18 |
| `CAMERA_FRAME_HEIGHT`           | `480`                | `CAMERA_FRAME_HEIGHT`           | Day 18 |
| `CAMERA_FPS`                    | `30`                 | `CAMERA_FPS`                    | Day 18 |
| `ATTENDANCE_CAPTURE_FPS`        | `1`                  | `ATTENDANCE_CAPTURE_FPS`        | Day 18 |
| `FACE_IMAGES_DIR`               | `./data/face_images` | `UPLOAD_DIR`                    | Day 18 |
| `TEMP_DIR`                      | `./data/temp`        | `TEMP_DIR`                      | Day 18 |
| `DETECTION_DOWNSCALE_RATIO`     | `0.5`                | `DETECTION_DOWNSCALE_RATIO`     | Day 22 |
| `DETECTION_FRAME_SKIP`          | `3`                  | `DETECTION_FRAME_SKIP`          | Day 22 |
| `QUALITY_BLUR_THRESHOLD`        | `100.0`              | `QUALITY_BLUR_THRESHOLD`        | Day 23 |
| `QUALITY_BRIGHTNESS_MIN`        | `40.0`               | `QUALITY_BRIGHTNESS_MIN`        | Day 23 |
| `QUALITY_BRIGHTNESS_MAX`        | `220.0`              | `QUALITY_BRIGHTNESS_MAX`        | Day 23 |
| `QUALITY_MIN_FACE_SIZE`         | `80`                 | `QUALITY_MIN_FACE_SIZE`         | Day 23 |
