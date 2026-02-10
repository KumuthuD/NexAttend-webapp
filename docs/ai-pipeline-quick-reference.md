# AI Pipeline Quick Reference

Quick reference guide for developers working with the NexAttend AI pipeline.

---

## File Structure

```
backend/app/services/
├── ai/
│   ├── camera_service.py       # Webcam operations
│   ├── image_processor.py      # Image preprocessing
│   └── face_recognizer.py      # DeepFace wrapper
├── face_detector.py            # MTCNN detection
└── embedding_service.py        # Face comparison
```

---

## Quick Code Examples

### 1. Capture Frame from Webcam

```python
from app.services.ai.camera_service import CameraService

camera = CameraService(camera_id=0)
camera.start_camera()

success, frame = camera.capture_frame()
if success:
    print(f"Frame captured: {frame.shape}")
    
camera.release_camera()
```

### 1b. Real-Time Frame Capture Loop (1 fps)

```python
from app.services.ai.camera_service import CameraService

def process_frame(frame):
    # process each frame for attendance marking
    print(f"Processing frame: {frame.shape}")
    # detect faces, recognize students, mark attendance

camera = CameraService(camera_id=0)
camera.start_camera()

# start loop at 1 fps
camera.start_capture_loop(callback=process_frame, fps=1)

# loop runs continuously until stopped
# ... attendance session in progress ...

# stop when session ends
camera.stop_capture_loop()
camera.release_camera()
```

### 2. Detect Faces in Image

```python
from app.services.face_detector import FaceDetector
import cv2

detector = FaceDetector(min_confidence=0.90)
image = cv2.imread("photo.jpg")

faces = detector.detect_faces(image)
print(f"Found {len(faces)} faces")

for face in faces:
    box = face['box']
    confidence = face['confidence']
    print(f"Face at {box} with confidence {confidence}")
```

### 3. Generate Face Embedding

```python
from app.services.face_recognizer import FaceRecognizer
import cv2

recognizer = FaceRecognizer(model_name="Facenet")
face_image = cv2.imread("face.jpg")

embedding = recognizer.get_embedding(face_image)
print(f"Embedding size: {len(embedding)}")
print(f"First 5 values: {embedding[:5]}")
```

### 4. Compare Two Embeddings

```python
from app.services.embedding_service import embedding_service

embedding1 = [0.1, 0.2, 0.3, ...]  # 128 values
embedding2 = [0.1, 0.21, 0.29, ...]  # 128 values

is_match, distance = embedding_service.verify_identity(embedding1, embedding2)

if is_match:
    print(f"Same person! Distance: {distance:.4f}")
else:
    print(f"Different person. Distance: {distance:.4f}")
```

### 5. Identify Student from Database

```python
from app.services.embedding_service import embedding_service

query_embedding = [...]  # From detected face

students_db = [
    {"id": "1", "name": "John", "embedding": [...]},
    {"id": "2", "name": "Jane", "embedding": [...]},
    # ... more students
]

matched_student, distance = embedding_service.identify_user(
    query_embedding, 
    students_db
)

if matched_student:
    print(f"Identified: {matched_student['name']} (distance: {distance:.4f})")
else:
    print("No match found")
```

### 6. Full Pipeline Example

```python
from app.services.ai.camera_service import CameraService
from app.services.face_detector import FaceDetector
from app.services.face_recognizer import FaceRecognizer
from app.services.embedding_service import embedding_service

# Initialize services
camera = CameraService()
detector = FaceDetector()
recognizer = FaceRecognizer()

# Start camera
camera.start_camera()

# Capture frame
success, frame = camera.capture_frame()

if success:
    # Detect faces
    faces = detector.detect_faces(frame)
    
    if len(faces) > 0:
        # Get first face
        face = faces[0]
        box = face['box']
        x, y, w, h = box
        
        # Crop face
        face_crop = frame[y:y+h, x:x+w]
        
        # Generate embedding
        embedding = recognizer.get_embedding(face_crop)
        
        if embedding:
            print(f"Successfully generated embedding: {len(embedding)} dimensions")
            
            # Compare with database for recognition
            # (shown in previous example)

# Cleanup
camera.release_camera()
```

---

## Configuration Values

### Face Detector (MTCNN)

```python
FaceDetector(
    min_face_size=20,           # Registration: 50
    scale_factor=0.709,
    min_confidence=0.90,        # Registration: 0.95
    steps_threshold=[0.6, 0.7, 0.7]
)
```

### Face Recognizer (DeepFace)

```python
FaceRecognizer(
    model_name="Facenet"        # Options: Facenet, VGG-Face, ArcFace
)
```

### Embedding Service

```python
# From environment/config
SIMILARITY_THRESHOLD=0.40       # Lower = stricter matching
FACE_MODEL="Facenet"
```

---

## API Endpoints

### Register Face

```bash
POST /api/faces/register
Content-Type: multipart/form-data
Authorization: Bearer <token>

# Body: image file

# Response:
{
    "message": "Face registered successfully",
    "user_id": "507f1f77bcf86cd799439011"
}
```

### Detect Faces

```bash
POST /api/faces/detect
Content-Type: multipart/form-data

# Body: image file

# Response:
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

## Common Issues and Solutions

### Issue: No webcam detected

```python
# Check available cameras
import cv2
for i in range(5):
    cap = cv2.VideoCapture(i)
    if cap.isOpened():
        print(f"Camera {i} is available")
        cap.release()
```

### Issue: Face not detected

**Solutions:**
- Improve lighting
- Move closer to camera
- Face camera directly
- Remove obstructions (mask, glasses)
- Check min_face_size parameter

### Issue: Low confidence scores

**Solutions:**
- Better lighting
- Higher resolution camera
- Clean lens
- Reduce motion blur
- Lower min_confidence threshold (carefully)

### Issue: Wrong person identified

**Solutions:**
- Lower similarity threshold (stricter)
- Re-register with better quality photos
- Add more registered faces
- Check for duplicate registrations

### Issue: Slow processing

**Solutions:**
- Reduce frame resolution
- Skip frames (process every 2nd frame)
- Use GPU for DeepFace
- Optimize database queries
- Cache embeddings in memory

---

## Performance Tips

### Speed Optimization

1. **Use GPU for DeepFace**
```python
# Install tensorflow-gpu
# pip install tensorflow-gpu
```

2. **Cache model loading**
```python
# Models loaded once at startup
detector = FaceDetector()  # Load MTCNN once
recognizer = FaceRecognizer()  # Load Facenet once
```

3. **Batch processing**
```python
# Process multiple faces at once instead of one-by-one
```

4. **Database indexing**
```mongodb
db.students.createIndex({ "classroom_id": 1 })
db.face_embeddings.createIndex({ "student_id": 1 })
```

### Accuracy Optimization

1. **Multiple angle registration**
- Register faces from different angles
- Capture in different lighting

2. **Regular re-registration**
- Update embeddings periodically
- Handle appearance changes

3. **Threshold tuning**
- Test with real data
- Balance false positives vs false negatives

---

## Testing Commands

```bash
# Test camera
python backend/test_camera_service.py

# Test face detection
python backend/test_detector_class.py

# Test full pipeline
python backend/test_recognition_pipeline.py

# Test multi-face
python backend/test_multi_face_detector.py

# Test threshold
python backend/test_threshold_local.py
```

---

## Environment Setup

```bash
# Create virtual environment
python -m venv venv

# Activate
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
cd backend
pip install -r requirements.txt

# Run tests
python test_recognition_pipeline.py
```

---

## Dependencies

```txt
opencv-python==4.8.1.78
mtcnn==0.1.1
deepface==0.0.79
tensorflow==2.13.0
numpy==1.24.3
scipy==1.11.2
```

---

## Useful Resources

**MTCNN Paper:**
- https://arxiv.org/abs/1604.02878

**Facenet Paper:**
- https://arxiv.org/abs/1503.03832

**DeepFace Library:**
- https://github.com/serengil/deepface

**OpenCV Documentation:**
- https://docs.opencv.org/

---

## Debugging Tips

### Enable debug logging

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Visualize intermediate results

```python
import cv2

# Show detected faces
for face in faces:
    x, y, w, h = face['box']
    cv2.rectangle(image, (x, y), (x+w, y+h), (0, 255, 0), 2)

cv2.imshow("Debug", image)
cv2.waitKey(0)
```

### Print embedding statistics

```python
import numpy as np

embedding_array = np.array(embedding)
print(f"Min: {embedding_array.min():.4f}")
print(f"Max: {embedding_array.max():.4f}")
print(f"Mean: {embedding_array.mean():.4f}")
print(f"Std: {embedding_array.std():.4f}")
```

---

Created by: Viraj Jayasiri  
Date: Week 2 Day 10  
Branch: docs/ai-pipeline
