# NexAttend — AI-Powered Smart Attendance System

> **Automating attendance using real-time multi-face recognition in modern classrooms.**

[![CI](https://github.com/KumuthuD/NexAttend-webapp/actions/workflows/ci.yml/badge.svg)](https://github.com/KumuthuD/NexAttend-webapp/actions/workflows/ci.yml)

---

## 📋 What is NexAttend?

NexAttend is an AI-based attendance management system designed for educational institutions. Instead of manual roll-calls, a teacher simply opens the webcam and the system automatically detects and identifies multiple students at once using face recognition.

### Core Features

- 🤖 **Real-time multi-face recognition** — Detects and identifies multiple students in a single webcam frame
- 📊 **Teacher Dashboard** — Start sessions, view live stats, manage classrooms
- 📈 **Student Dashboard** — View personal attendance history and engagement scores
- 🔐 **Secure Authentication** — JWT-based login with role-based access (Teacher / Student)
- 📧 **Automated Notifications** — Email alerts for attendance status
- 🏆 **Gamification** — Motivation scoring to encourage consistent attendance

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS, Framer Motion |
| **Backend** | Python, FastAPI, Uvicorn |
| **AI Engine** | MTCNN (Face Detection), DeepFace / FaceNet (Recognition), face-api.js (Client-side) |
| **Database** | MongoDB Atlas (Cloud) |
| **Auth** | JWT (JSON Web Tokens), bcrypt |
| **Deployment** | Vercel (Frontend), Render (Backend), Docker |

---

## 📂 Project Structure

```
NexAttend-webapp/
├── backend/              # FastAPI backend + AI pipeline
│   ├── app/
│   │   ├── api/          # Route handlers (auth, faces, attendance, dashboard)
│   │   ├── core/         # Config, settings
│   │   ├── database/     # MongoDB connection
│   │   ├── models/       # Database models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── services/     # Business logic (face detector, embeddings, etc.)
│   ├── Dockerfile
│   └── requirements.txt
├── web/                  # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components (Dashboard, Login, etc.)
│   │   ├── contexts/     # Auth context
│   │   └── services/     # API service layer
│   └── public/models/    # face-api.js model weights
├── docs/                 # Documentation
│   ├── DEPLOYMENT.md     # Deployment guide
│   ├── ai-pipeline-documentation.md
│   └── attendance-flow.md
└── .github/workflows/    # GitHub Actions CI
    └── ci.yml
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js v18+
- Python 3.10+
- MongoDB running locally or Atlas connection string

### 1. Clone the repository
```bash
git clone https://github.com/KumuthuD/NexAttend-webapp.git
cd NexAttend-webapp
```

### 2. Set up the Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
```

Create `backend/.env`:
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=nexattend_db
MONGODB_TLS=False
SECRET_KEY=your-secret-key
JWT_SECRET=your-jwt-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FACE_MODEL=Facenet
SIMILARITY_THRESHOLD=0.50
UPLOAD_DIR=./data/face_images
```

Start the backend:
```bash
uvicorn app.main:app --reload
# API available at: http://localhost:8000
# Swagger docs at: http://localhost:8000/docs
```

### 3. Set up the Frontend
```bash
cd web
npm install
```

Create `web/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the frontend:
```bash
npm run dev
# App available at: http://localhost:5173
```

---

## 🌐 Deployed URLs

| Service | URL |
|---|---|
| **Frontend** | https://nexattend.vercel.app |
| **Backend API** | https://nexattend-backend.onrender.com |
| **API Docs (Swagger)** | https://nexattend-backend.onrender.com/docs |

---

## 📖 Documentation

| Doc | Description |
|---|---|
| [Deployment Guide](docs/DEPLOYMENT.md) | How to deploy frontend and backend |
| [AI Pipeline](docs/ai-pipeline-documentation.md) | How face recognition works |
| [Attendance Flow](docs/attendance-flow.md) | Attendance session flow diagram |
| [AI Performance](docs/ai-performance.md) | Model benchmarks and accuracy |

---

## 👥 Team

| Member | Role |
|---|---|
| **Kumuthu Dahanayake** | Team Lead, AI Integration |
| **Thiviru** | Frontend Lead |
| **Yasitha** | Frontend Developer |
| **Sudam** | Backend Lead |
| **Thisandu** | Backend Developer |
| **Viraj** | AI / Computer Vision |

---

## 🔄 Branching Strategy

```
main          → Production-ready code only
develop       → Integration branch (all features merge here first)
feature/*     → New features
bugfix/*      → Bug fixes
docs/*        → Documentation updates
```

---

*Built with ❤️ by the NexAttend Team — 8-Week Sprint Project*
