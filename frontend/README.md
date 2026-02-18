# Task Management — Frontend

React application for the Task Management app: Vite, TypeScript, and Axios for the backend API. Supports task list/create/complete and admin CSV export with status polling.

---

## Prerequisites

- Node.js 18+
- Backend API running (see [backend/README.md](../backend/README.md) and [root README](../README.md))

---

## Setup

Run these commands from the **frontend** directory (`frontend/`).

### 1. Install dependencies

```bash
npm install
```

### 2. Environment (optional)

The app works with defaults (`VITE_API_BASE_URL=http://localhost:3000/api`). To override:

```bash
cp .env.example .env
```

Edit `.env` if needed:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000
```

### 3. Run the app

```bash
npm run dev
```

The app is available at **http://localhost:5173**. Log in with the Tenant ID and User ID from the backend seed script (see [root README](../README.md)).

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

---

## Authentication and API

The frontend does not use a real auth provider. After “login” (e.g. Dev Login or Login page), it stores in `localStorage`:

- `tenantId` — sent as `x-tenant-id`
- `userId` — sent as `x-user-id`
- (optional) `authToken` — sent as `Authorization: Bearer ...`

The API client in `src/api/client.ts` attaches these headers to every request. The backend uses them for tenant isolation and user/role checks. See the [root README](../README.md) for API details.

---

## Features

- **Tasks**: List, create, and mark tasks complete. Data is scoped by tenant.
- **Admin export**: If the current user has role `admin`, an “Export CSV” section is shown. It triggers an export, polls `GET /api/exports/:id` every 2 seconds until completed or failed, then offers a download. The download URL is valid for 1 minute; after that it returns 404 (see root README).

---

## Project structure

```
frontend/
├── src/
│   ├── api/              # API client and endpoints
│   │   ├── client.ts     # Axios instance, interceptors (tenant/user headers)
│   │   ├── tasks.ts      # Task list, create, update
│   │   ├── users.ts      # Current user
│   │   ├── exports.ts    # Trigger export, get status, download file
│   │   └── index.ts
│   ├── components/       # UI components
│   │   ├── LoginPage.tsx
│   │   ├── DevLogin.tsx
│   │   ├── TaskList.tsx
│   │   ├── TaskItem.tsx
│   │   ├── CreateTaskForm.tsx
│   │   ├── AdminExportSection.tsx   # Export + polling + download
│   │   └── LoadingScreen.tsx
│   ├── contexts/         # React context
│   │   ├── AuthContext.tsx
│   │   ├── AuthContextState.ts
│   │   ├── useAuth.ts
│   │   └── index.ts
│   ├── config/
│   │   └── env.ts        # VITE_* env and defaults
│   ├── types/            # TypeScript types
│   │   ├── api.types.ts
│   │   ├── task.types.ts
│   │   ├── user.types.ts
│   │   └── export.types.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Environment variables

Variables must be prefixed with `VITE_` to be available in the app.

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000/api` |
| `VITE_API_TIMEOUT` | Request timeout (ms) | `10000` |

---

## Build and preview

```bash
npm run build
npm run preview
```

Preview serves the built app (default port may differ from 5173). Use this to test the production build against your backend.
