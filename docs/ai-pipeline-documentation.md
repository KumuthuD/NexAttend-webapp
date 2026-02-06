# AI Pipeline Documentation

## Overview

NexAttend uses a multi-stage AI pipeline for face detection and recognition. The pipeline processes camera input through multiple stages to identify students and mark attendance automatically.

**Technology Stack:**
- MTCNN (Multi-task Cascaded Convolutional Networks) for face detection
- DeepFace with Facenet model for embedding generation
- Cosine similarity for face matching
- OpenCV for camera operations and image processing

---

## System Architecture

The AI pipeline consists of 5 core components that work together in sequence:

1. **Camera Service** - captures frames from webcam
2. **Image Processor** - preprocesses and prepares images
3. **Face Detector** - detects faces using MTCNN
4. **Face Recognizer** - generates embeddings using DeepFace
5. **Embedding Service** - compares and identifies faces

### Component Locations

```
backend/app/services/
├── ai/
│   ├── camera_service.py      # webcam capture and frame operations
│   ├── image_processor.py     # image preprocessing utilities
│   └── face_recognizer.py     # DeepFace wrapper for embeddings
├── face_detector.py           # MTCNN face detection
└── embedding_service.py       # face comparison and identification
```

---

## Pipeline Workflows

### 1. Registration Flow

The registration flow captures a student's face and stores their embedding in the database.

**Steps:**
1. Student opens webcam or uploads image
2. Camera service captures frame
3. Face detector finds face in frame
4. System validates exactly one face detected
5. Face crop extracted with padding
6. Face recognizer generates 128-dimensional embedding
7. Embedding saved to database with student record

**Validation Rules:**
- Exactly one face must be present
- Face confidence must be ≥ 0.95
- Minimum face size must be 50x50 pixels
- Image must be valid format (JPEG/PNG)

### 2. Recognition Flow (Attendance Marking)

The recognition flow identifies students in real-time during attendance sessions.

**Steps:**
1. Attendance session starts
2. Camera service captures frames continuously
3. Face detector finds all faces in frame
4. For each detected face:
   - Crop face region
   - Generate embedding
   - Compare against registered embeddings
   - If match found (distance < threshold):
     - Mark student as present
     - Log confidence score and timestamp
5. Display results in real-time
6. Session ends and saves attendance records

**Multi-Face Support:**
- Pipeline processes multiple faces simultaneously
- Sorts faces by size for better prioritization
- Filters by confidence threshold (0.90 default)
- Prevents duplicate attendance marking

---

## Component Details

### Camera Service

**Purpose:** Manage webcam connection and frame capture

**Key Functions:**
- `start_camera()` - initialize webcam connection
- `capture_frame()` - capture single frame as numpy array
- `capture_multiple_frames(n)` - capture n consecutive frames
- `release_camera()` - properly close webcam connection
- `convert_to_rgb()` - convert BGR to RGB for AI models
- `save_image()` - save frame to disk

**Configuration:**
- Default camera ID: 0 (primary webcam)
- Frame size: 640x480 pixels
- Frame rate: 30 fps

### Image Processor

**Purpose:** Preprocess images for optimal AI performance

**Key Functions:**
- `resize_image()` - resize to specific dimensions
- `resize_with_aspect_ratio()` - resize maintaining aspect ratio
- `bgr_to_rgb()` - convert color space for AI models
- `rgb_to_bgr()` - convert back for OpenCV display
- `convert_to_grayscale()` - grayscale conversion
- `crop_image()` - extract region of interest
- `rotate_image()` - rotate by angle
- `normalize_image()` - normalize pixel values
- `enhance_brightness()` - adjust brightness
- `enhance_contrast()` - adjust contrast
- `validate_image()` - check image validity

**Image Formats Supported:**
- BGR (OpenCV default)
- RGB (AI models)
- Grayscale
- Normalized arrays

### Face Detector

**Purpose:** Detect faces using MTCNN neural network

**Technology:** MTCNN (Multi-task Cascaded Convolutional Networks)
- 3-stage cascaded network
- Detects faces at multiple scales
- Returns bounding boxes and confidence scores
- Also provides facial landmarks (eyes, nose, mouth)

**Key Functions:**
- `detect_faces()` - find all faces in image
- `get_largest_face()` - get primary face
- `filter_by_confidence()` - filter low-confidence detections
- `crop_face()` - extract face region
- `get_face_locations()` - get bounding box coordinates
- `draw_faces()` - draw boxes on image for visualization

**Configuration:**
- Min face size: 20 pixels (registration: 50)
- Scale factor: 0.709 (for multi-scale detection)
- Min confidence: 0.90 (registration: 0.95)
- Steps threshold: [0.6, 0.7, 0.7] for 3 stages

**Output Format:**
```python
{
    'box': [x, y, width, height],
    'confidence': 0.95,
    'keypoints': {
        'left_eye': (x1, y1),
        'right_eye': (x2, y2),
        'nose': (x3, y3),
        'mouth_left': (x4, y4),
        'mouth_right': (x5, y5)
    }
}
```

### Face Recognizer

**Purpose:** Generate face embeddings using deep learning

**Technology:** DeepFace library with Facenet model
- Facenet model (default)
- 128-dimensional embedding vectors
- Pre-trained on large face datasets
- High accuracy for face verification

**Key Functions:**
- `get_embedding()` - generate 128-dim vector
- `compute_similarity()` - calculate cosine distance

**Available Models:**
- Facenet (128-dim) - default, fast and accurate
- VGG-Face (2622-dim) - very accurate, slower
- ArcFace (512-dim) - state-of-the-art, balanced

**Embedding Properties:**
- Fixed-length vectors
- Same person → similar embeddings (low distance)
- Different people → dissimilar embeddings (high distance)
- Invariant to lighting, angle, expression (within limits)

### Embedding Service

**Purpose:** Compare embeddings and identify students

**Key Functions:**
- `generate_embedding()` - wrapper for face recognizer
- `verify_identity()` - 1-to-1 verification
- `identify_user()` - 1-to-N identification

**Identification Logic:**
```
For each registered student:
    Calculate distance = cosine_similarity(query_embedding, student_embedding)
    If distance < threshold:
        Potential match found
Return student with minimum distance
```

**Thresholds:**
- Default threshold: 0.40 (configurable)
- Lower threshold = stricter matching (fewer false positives)
- Higher threshold = looser matching (fewer false negatives)
- Optimal threshold determined through testing

**Similarity Metrics:**
- Cosine distance (default)
- Range: 0 (identical) to 2 (opposite)
- Typical same person: 0.20 - 0.35
- Typical different people: 0.50+

---

## API Endpoints

### Face Registration

**Endpoint:** `POST /api/faces/register`

**Purpose:** Register a new student's face

**Request:**
- Multipart form data with image file
- Requires authentication token

**Response:**
```json
{
    "message": "Face registered successfully",
    "user_id": "507f1f77bcf86cd799439011"
}
```

**Error Cases:**
- No face detected
- Multiple faces detected
- Low quality image
- Face too small
- Invalid image format

### Face Detection (Testing)

**Endpoint:** `POST /api/faces/detect`

**Purpose:** Test face detection on image

**Request:**
- Image file

**Response:**
```json
{
    "num_faces": 2,
    "faces": [
        {
            "box": [100, 150, 200, 200],
            "confidence": 0.96
        }
    ]
}
```

---

## Configuration

### Environment Variables

```bash
# Face recognition settings
FACE_MODEL=Facenet              # DeepFace model to use
SIMILARITY_THRESHOLD=0.40       # Matching threshold
MIN_FACE_SIZE=20                # Minimum face size in pixels
MIN_CONFIDENCE=0.90             # Minimum detection confidence

# Camera settings
CAMERA_ID=0                     # Camera device ID
FRAME_WIDTH=640                 # Frame width in pixels
FRAME_HEIGHT=480                # Frame height in pixels
```

### Config File Location

```
backend/app/core/config.py
```

---

## Performance Metrics

### Detection Speed
- Single face detection: ~50-100ms
- Multi-face detection (5 faces): ~150-200ms
- Frame capture: ~30ms

### Recognition Accuracy
- Same person match rate: 95%+
- Different person rejection: 98%+
- Optimal threshold: 0.40

### Resource Usage
- Memory: ~500MB (models loaded)
- CPU: ~30-50% during active recognition
- GPU: Optional but recommended for faster processing

---

## Error Handling

### Common Issues

**No Face Detected**
- Check lighting conditions
- Ensure face is facing camera
- Move closer to camera
- Remove obstructions (masks, sunglasses)

**Multiple Faces Detected (Registration)**
- Registration requires only one person
- Ensure no one else in frame
- Check for faces in background/photos

**Low Confidence Score**
- Improve lighting
- Clean camera lens
- Reduce motion blur
- Ensure clear face visibility

**Failed to Generate Embedding**
- Check image quality
- Verify face crop is valid
- Check model files are loaded
- Review error logs

---

## Testing

### Test Scripts

Located in `backend/` directory:

1. **test_camera_service.py** - test webcam capture
2. **test_detector_class.py** - test face detection
3. **test_image_processor.py** - test image preprocessing
4. **test_recognition_pipeline.py** - test full pipeline
5. **test_threshold_local.py** - test similarity thresholds
6. **test_multi_face_detector.py** - test multiple face detection

### Running Tests

```bash
# Test camera
python test_camera_service.py

# Test face detection
python test_detector_class.py

# Test full pipeline
python test_recognition_pipeline.py

# Test multi-face detection
python test_multi_face_detector.py
```

---

## Future Improvements

### Planned Enhancements
1. GPU acceleration for faster processing
2. Face quality assessment (blur detection)
3. Liveness detection (anti-spoofing)
4. Age and expression analysis
5. Attendance pattern anomaly detection
6. Model fine-tuning on custom dataset

### Optimization Opportunities
1. Batch processing for multiple embeddings
2. Caching frequently accessed embeddings
3. Parallel processing for multi-face scenarios
4. Frame skipping for reduced CPU usage
5. Database indexing for faster queries

---

## Diagrams

See the following diagram files for visual representations:
- System architecture flow
- Registration process flow
- Recognition process flow
- Component interaction diagram

---

## Credits

**AI Pipeline Development:**
- Kumuthu Dahanayake - Lead
- Viraj Jayasiri - Implementation and optimization

**Week 1:** Core AI components
**Week 2:** Integration and optimization
**Day 10:** Documentation with diagrams
