# Swiss Job Search Hub

A fullstack job search tracker and AI assistant for the Swiss tech market.

**Stack:** React + Vite · FastAPI · PostgreSQL · JWT auth · Docker

---

## Quick start (Docker)

```bash
# 1. Clone and enter the project
git clone https://github.com/marilenaManoli/Job-Search-Platform.git
cd Job-Search-Platform

# 2. Start everything
docker compose up --build

# 3. Open the app
open http://localhost:3000
```

The backend API is available at `http://localhost:8000`.  
Interactive API docs: `http://localhost:8000/docs`

---

## Local development (without Docker)

### PostgreSQL

You need a running PostgreSQL instance. With Docker:
```bash
docker run -d --name pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=jobsearch -p 5432:5432 postgres:16-alpine
```

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env — set DATABASE_URL to point to your local postgres

uvicorn app.main:app --reload
# API running at http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:5173
```

The Vite dev server proxies `/api/*` → `http://localhost:8000` automatically.

---

## Environment variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | asyncpg PostgreSQL URL | `postgresql+asyncpg://postgres:postgres@postgres:5432/jobsearch` |
| `SECRET_KEY` | JWT signing secret — **change in production** | — |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime | `10080` (7 days) |

---

## AI setup

### Option A — Anthropic API (Claude, paid)

1. Get a key at [console.anthropic.com](https://console.anthropic.com)
2. Register/log in → **Settings** → paste your `sk-ant-api...` key → Save
3. The key is stored in the database per user (not in the browser)

Enables: live web job search, cover letters, outreach, suggestions.

### Option B — Ollama (free, local)

```bash
ollama pull llama3
OLLAMA_ORIGINS=* ollama serve
```

Then in the app → **Settings** → switch to Ollama → enter model name → Save.

Enables: cover letters, outreach, suggestions, search strategy.  
Live web search (Find Jobs scan) requires Anthropic.

---

## Project structure

```
Job-Search-Platform/
├── backend/
│   ├── app/
│   │   ├── main.py          — FastAPI app, CORS, lifespan
│   │   ├── config.py        — pydantic-settings
│   │   ├── database.py      — async SQLAlchemy engine + session
│   │   ├── models.py        — User, Profile, Application, Goal
│   │   ├── schemas.py       — Pydantic request/response models
│   │   ├── auth.py          — bcrypt + JWT
│   │   ├── deps.py          — get_current_user dependency
│   │   └── routers/
│   │       ├── auth.py      — POST /auth/register, /login  GET /auth/me
│   │       ├── profile.py   — GET/PATCH /profile
│   │       ├── applications.py — CRUD /applications
│   │       ├── goals.py     — CRUD /goals + POST /goals/reset-week
│   │       └── ai.py        — POST /ai/scan, /cover-letter, /outreach, /suggestions
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/             — typed fetch wrappers (client, auth, applications, goals, profile, ai)
│   │   ├── context/         — AuthContext (JWT), ToastContext
│   │   ├── hooks/           — useProfile (shared profile state)
│   │   ├── components/      — Layout, Sidebar, ProtectedRoute, Spinner
│   │   └── pages/           — Login, Register, Dashboard, Tracker, Finder, Letters, Outreach, Suggestions, Goals, Profile, Settings
│   ├── index.html
│   ├── vite.config.js       — dev proxy /api → :8000
│   ├── nginx.conf           — prod: proxy /api → backend service
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## API reference

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create account, returns JWT |
| POST | `/auth/login` | Login, returns JWT |
| GET | `/auth/me` | Current user info |
| GET/PATCH | `/profile` | Get or update profile + AI settings |
| GET/POST | `/applications` | List or create applications |
| PATCH/DELETE | `/applications/{id}` | Update or delete |
| GET/POST | `/goals` | List or create goals |
| PATCH/DELETE | `/goals/{id}` | Update or delete |
| POST | `/goals/reset-week` | Uncheck all goals |
| POST | `/ai/scan` | Job scan (web search or strategy) |
| POST | `/ai/cover-letter` | Generate cover letter |
| POST | `/ai/outreach` | Generate outreach message |
| POST | `/ai/suggestions` | Analyse profile + tracker |

Full interactive docs: `http://localhost:8000/docs`
