# NexAttend — Backend (FastAPI)

> Python-based REST API and AI face recognition engine.

---

## 🛠️ Tech Stack

| Tool | Purpose |
|---|---|
| **FastAPI** | REST API framework |
| **Uvicorn** | ASGI server |
| **MongoDB + Motor** | Async database driver |
| **MTCNN** | Face detection |
| **DeepFace / FaceNet** | Face embedding & recognition |
| **face-api.js** | Client-side detection (frontend) |
| **JWT / bcrypt** | Authentication & password hashing |
| **Docker** | Containerization for deployment |

---

## 📂 Folder Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py          # Login, Register endpoints
│   │   │   ├── faces.py         # Face registration & recognition
│   │   │   ├── attendance.py    # Attendance session management
│   │   │   ├── dashboard.py     # Stats for teacher dashboard
│   │   │   └── students.py      # Student management
│   │   └── deps.py              # Dependency injection (DB, Auth)
│   ├── core/
│   │   └── config.py            # App settings (loaded from .env)
│   ├── database/
│   │   └── mongodb.py           # MongoDB connection
│   ├── models/                  # MongoDB document models
│   ├── schemas/                 # Pydantic request/response schemas
│   └── services/
│       ├── face_detector.py     # MTCNN face detection
│       ├── face_recognizer.py   # FaceNet embedding generation
│       ├── embedding_service.py # Similarity matching logic
│       └── lighting_optimizer.py # Low-light image enhancement
├── data/face_images/            # Uploaded face images
├── Dockerfile                   # Docker build config
├── requirements.txt             # Python dependencies
└── .env                         # Environment variables (not committed)
```

---

## ⚙️ Local Setup

### 1. Create virtual environment
```bash
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Create `.env` file
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=nexattend_db
MONGODB_TLS=False
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FACE_MODEL=Facenet
SIMILARITY_THRESHOLD=0.50
UPLOAD_DIR=./data/face_images
```

### 4. Run the server
```bash
uvicorn app.main:app --reload
```

- API Base: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/login` | Login, returns JWT token |
| `GET` | `/api/v1/auth/me` | Get current user info |

### Face Recognition
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/faces/register` | Register a student's face |
| `POST` | `/api/v1/faces/recognize-multi` | Recognize multiple faces in a frame |

### Attendance
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/attendance/start` | Start an attendance session |
| `POST` | `/api/v1/attendance/mark` | Mark a student present |
| `GET` | `/api/v1/attendance/session/:id` | Get session results |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/dashboard/stats` | Get total students, attendance rate, etc. |

---

## 🐳 Docker

Build and run locally with Docker:

```bash
# Build the image
docker build -t nexattend-backend .

# Run the container
docker run -p 8000:8000 --env-file .env nexattend-backend
```

---

## 🔑 Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGODB_URL` | ✅ | — | MongoDB connection string |
| `DATABASE_NAME` | ✅ | `nexattend_db` | MongoDB database name |
| `MONGODB_TLS` | ✅ | `True` | Enable TLS (True for Atlas) |
| `SECRET_KEY` | ✅ | — | App secret for security |
| `JWT_SECRET` | ✅ | — | JWT signing secret |
| `JWT_ALGORITHM` | ❌ | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ❌ | `30` | Token expiry in minutes |
| `FACE_MODEL` | ❌ | `Facenet` | DeepFace model name |
| `SIMILARITY_THRESHOLD` | ❌ | `0.50` | Face match threshold (lower = stricter) |
| `UPLOAD_DIR` | ❌ | `./data/face_images` | Face image storage path |

---

*Part of the NexAttend project — Kumuthu Dahanayake (AI/Backend)*
