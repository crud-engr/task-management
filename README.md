# task-management

Task management app: backend API and frontend.

## Structure

| Directory   | Description                |
|------------|----------------------------|
| `backend/` | Express API (Sequelize, PostgreSQL, Redis). See [backend/README.md](backend/README.md). |
| `frontend/`| React + Vite app. See [frontend/README.md](frontend/README.md). |

## Quick start

**Single command** (starts both backend and frontend):

```bash
npm run setup   # first time only
npm run dev     # start both apps
```

- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173

**Prerequisites**: PostgreSQL and Redis must be running. Copy `backend/.env.example` to `backend/.env` and set `DB_PASSWORD` and other values.
