# NexAttend — Frontend (React + Vite)

> React-based web application for the NexAttend AI attendance system.

---

## 🛠️ Tech Stack

| Tool | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite** | Build tool and dev server |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations and transitions |
| **face-api.js** | Client-side real-time face detection |
| **Axios** | HTTP requests to backend API |
| **React Router v7** | Client-side routing |
| **Recharts** | Analytics charts |
| **Lucide React** | Icon library |

---

## 📂 Folder Structure

```
web/
├── public/
│   └── models/                  # face-api.js model weights (TinyFaceDetector)
├── src/
│   ├── assets/                  # Images, logos
│   ├── components/
│   │   ├── common/
│   │   │   └── WebcamCapture.tsx  # Real-time face detection + recognition
│   │   ├── dashboard/
│   │   │   ├── ClassroomCard.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   └── StudentAttendanceOverview.tsx
│   │   ├── landing/             # Landing page sections
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── ThemeToggle.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx       # Global auth state (user, login, logout)
│   ├── pages/
│   │   ├── LandingPage.tsx       # Public homepage
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx     # Main dashboard (Teacher + Student)
│   │   └── ClassroomPage.tsx
│   └── services/
│       └── api.ts                # All API calls to the backend
├── .env                          # Environment variables (not committed)
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## ⚙️ Local Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create `.env` file
```env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Run development server
```bash
npm run dev
# App available at: http://localhost:5173
```

---

## 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| Dev server | `npm run dev` | Start local development |
| Production build | `npm run build` | Build for deployment |
| Type check | `npm run lint:build` | TypeScript check (no emit) |
| Preview build | `npm run preview` | Preview production build locally |

---

## 🌐 Deployment (Vercel)

The frontend is deployed on **Vercel**.

| Setting | Value |
|---|---|
| **Root Directory** | `web` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Environment Variable** | `VITE_API_BASE_URL=https://nexattend-backend.onrender.com` |

See the full guide: [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | ✅ | URL of the FastAPI backend |

> **Note:** All Vite environment variables must start with `VITE_` to be accessible in the browser.

---

## 🤖 face-api.js Integration

The `WebcamCapture` component uses `face-api.js` for **client-side** real-time face detection:
- Model files are stored in `public/models/` (TinyFaceDetector)
- Bounding boxes are drawn at **~30fps** on a `<canvas>` overlay
- The backend is called every few seconds for identity recognition

This two-layer approach ensures **smooth box tracking** even when the backend is slow.

---

*Part of the NexAttend project — Thiviru (Frontend Lead), Kumuthu (AI Integration)*
