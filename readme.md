# 🗂️ Task Manager

A full-stack task manager built with **FastAPI** (backend) and **React + TypeScript** (frontend), following a clean layered architecture (MVC-style) — routers, services, repositories, models, schemas.

The frontend deliberately avoids the usual "generic AI dashboard" look: it uses an **editorial / field-notebook aesthetic** — cream paper, ink-black type, Fraunces serif display, and a single red accent.

---

## ✨ Features

- ✅ Create, list, update, and delete tasks
- ✅ Toggle task completion (done / open)
- ✅ Filter tasks: **all / open / done**
- ✅ Live stats (entries, open, done)
- ✅ Clean layered backend (router → service → repository → model)
- ✅ Automatic API docs (Swagger UI at `/docs`)
- ✅ Editorial, notebook-style UI (not the usual gradient dashboard)
- ✅ Vite dev proxy (no CORS setup needed in development)

---

## 🏗️ Tech Stack

### Backend
- **FastAPI** — web framework
- **SQLAlchemy 2.0** — ORM
- **Pydantic v2** — validation & serialization
- **Uvicorn** — ASGI server
- **SQLite** — zero-config database

### Frontend
- **React 18** + **TypeScript**
- **Vite** — dev server & bundler
- **Plain CSS** — no UI framework, fully hand-crafted

---

## 📁 Project Structure

```
task-manager/
├── backend/
│   ├── database.py                    # engine, SessionLocal, Base, get_db
│   ├── main.py                        # FastAPI app + router registration
│   ├── models/
│   │   └── task_model.py              # SQLAlchemy Task model
│   ├── schemas/
│   │   └── task_schema.py             # TaskCreate, TaskUpdate, TaskResponse
│   ├── repositories/
│   │   └── task_repository.py         # pure DB access
│   ├── services/
│   │   └── task_service.py            # business rules (404, etc.)
│   ├── routers/
│   │   └── task_router.py             # HTTP endpoints
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx                    # the whole UI
│       └── App.css                    # editorial styling
│
└── README.md
```

**Request flow:**

```
HTTP request → Router → Service → Repository → SQLAlchemy Model → SQLite
                                       ↑
                              Response (JSON)
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** and **npm**
- Git

Check versions:

```bash
python3 --version
node --version
npm --version
```

---

## 🖥️ Backend Setup

```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/task-manager.git
cd task-manager/backend

# 2. Create & activate a virtual environment
python3 -m venv venv
source venv/bin/activate          # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the server
uvicorn main:app --reload
```

Backend runs at: **http://127.0.0.1:8000**

- API docs (Swagger): **http://127.0.0.1:8000/docs**
- Alternative docs (ReDoc): **http://127.0.0.1:8000/redoc**

---

## 🎨 Frontend Setup

Open a **second terminal** (keep the backend running):

```bash
cd task-manager/frontend

# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

> ✅ The Vite dev server **proxies `/tasks`** to `http://127.0.0.1:8000` — so you **don't need any CORS configuration** in development.

---

## 🔌 API Endpoints

| Method | Endpoint           | Description       | Status codes         |
|--------|--------------------|-------------------|----------------------|
| GET    | `/`                | Root (health)     | `200`                |
| POST   | `/tasks`           | Create a task     | `201`, `422`         |
| GET    | `/tasks`           | List all tasks    | `200`                |
| GET    | `/tasks/{id}`      | Get one task      | `200`, `404`         |
| PUT    | `/tasks/{id}`      | Update a task     | `200`, `404`, `422`  |
| DELETE | `/tasks/{id}`      | Delete a task     | `204`, `404`         |

### Example requests

```bash
# Create
curl -X POST http://127.0.0.1:8000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy milk", "description": "2 liters"}'

# List
curl http://127.0.0.1:8000/tasks

# Get one
curl http://127.0.0.1:8000/tasks/1

# Update
curl -X PUT http://127.0.0.1:8000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy milk", "description": "2 liters", "completed": true}'

# Delete
curl -X DELETE http://127.0.0.1:8000/tasks/1 -i
```

### Example task object

```json
{
  "id": 1,
  "title": "Buy milk",
  "description": "2 liters",
  "completed": false,
  "created_at": "2026-10-27T14:32:00"
}
```

---

## 🧱 Architecture at a glance

| Layer          | File                              | Responsibility                       |
|----------------|-----------------------------------|--------------------------------------|
| **Router**     | `routers/task_router.py`          | HTTP: paths, status codes, `Depends` |
| **Service**    | `services/task_service.py`        | Business rules (raise 404, etc.)     |
| **Repository** | `repositories/task_repository.py` | Pure SQLAlchemy (queries, commits)   |
| **Model**      | `models/task_model.py`            | SQLAlchemy `Task` ↔ `tasks` table    |
| **Schema**     | `schemas/task_schema.py`          | Pydantic in/out validation           |
| **Database**   | `database.py`                     | Engine, session factory, `Base`, `get_db` |

---

## 🧠 Key Design Choices

- **`Depends(get_db)`** — guarantees one session per request, auto-closed on exception.
- **`response_model=TaskResponse`** — strips any fields not in the schema (safety boundary).
- **`server_default=func.now()`** — database sets `created_at`, no client tampering.
- **`from_attributes=True`** (Pydantic v2) — allows `TaskResponse` to serialize ORM objects.
- **Vite proxy** — avoids CORS in dev by routing `/tasks` to the backend.

---

## ⚙️ Database

- **Default:** SQLite, file `tasks.db` (auto-created on first run)
- Tables are created automatically at startup via:

```python
Base.metadata.create_all(bind=engine)
```

> ⚠️ **Production note:** `create_all()` is fine for learning / small projects, but for real production you should use **Alembic migrations** to handle schema changes safely.

---

## 🧪 Testing the API

Quickest smoke test without any extra tooling:

```bash
# 1. Create
curl -X POST http://127.0.0.1:8000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"test"}'

# 2. List
curl http://127.0.0.1:8000/tasks

# 3. Delete
curl -X DELETE http://127.0.0.1:8000/tasks/1 -i
```

Or open **http://127.0.0.1:8000/docs** and use **"Try it out"** on any endpoint.

---

## 🛠️ Troubleshooting

### `Address already in use` (port 8000)
A previous `uvicorn` is still running:

```bash
pkill -f "uvicorn main:app"
# or
kill -9 $(lsof -t -i:8000)
```

### `ModuleNotFoundError: database`
You're running from the wrong directory. Always run `uvicorn` from `backend/`:

```bash
cd backend
uvicorn main:app --reload
```

### `no such table: tasks`
The `Task` model wasn't imported before `create_all()`. Ensure `main.py` imports it:

```python
from models import task_model   # noqa: F401
```

### Frontend gets `404` for `/tasks`
- Make sure the backend is running on **http://127.0.0.1:8000**
- Check `vite.config.ts` proxy target matches that URL

### CORS errors
In **development** you shouldn't see any (the proxy handles it). If you deploy the frontend on a **different origin**, add CORS middleware in `main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📦 Build for Production

### Backend

```bash
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

(no `--reload` in production)

### Frontend

```bash
cd frontend
npm run build
```

Static files are output to `frontend/dist/` — serve them with Nginx, Caddy, or a static host.

---

## 🧩 What could be added next

- [ ] Alembic migrations (replace `create_all`)
- [ ] Authentication (JWT)
- [ ] Due dates, priorities, tags
- [ ] Pagination & search
- [ ] Inline title editing in the UI
- [ ] Optimistic updates on the frontend
- [ ] Pytest test suite using `dependency_overrides`

---

## 📄 License

MIT — free to use, modify, and share.