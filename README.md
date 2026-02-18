# Task Management

A full-stack task management application with a React frontend and an Express API. It supports multi-tenant data isolation, role-based access (admin/member), and asynchronous CSV export with background jobs and polling.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Running the Application](#running-the-application)
- [Seeding Test Data](#seeding-test-data)
- [Technical Documentation](#technical-documentation)
  - [Authentication](#authentication)
  - [Task Management](#task-management)
  - [Jobs and Polling](#jobs-and-polling)
  - [CSV Export and Download URL Expiry](#csv-export-and-download-url-expiry)
- [API Reference](#api-reference)

---

## Project Structure

| Directory   | Description |
|------------|-------------|
| `backend/` | Express API with Sequelize (PostgreSQL), Redis, and Bull for job queues. See [backend/README.md](backend/README.md). |
| `frontend/` | React + Vite application. See [frontend/README.md](frontend/README.md). |

- **Backend base URL:** `http://localhost:3000`
- **Frontend dev server:** `http://localhost:5173`
- **API prefix:** `/api`

---

## Prerequisites

- **Node.js** 18 or higher
- **PostgreSQL** (running locally or remotely)
- **Redis** (for job queues)

Ensure PostgreSQL and Redis are running before starting the app.

---

## Local Setup

### Step 1: Install dependencies

From the **project root** (`task-management/`):

```bash
npm run setup
```

This installs root dependencies and runs `npm install` in both `backend` and `frontend`.

### Step 2: Configure the backend

1. Go to the **backend** directory:
   ```bash
   cd backend
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `backend/.env` and set at least:
   - `DB_PASSWORD` – PostgreSQL password for the user in `DB_USER`
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_NAME` if different from defaults
   - Redis settings (`REDIS_HOST`, `REDIS_PORT`, etc.) if not using defaults

### Step 3: Create the database (if needed)

From the **backend** directory:

```bash
npm run db:create
```

This creates the database named in `DB_NAME` (default: `task_management`). It connects to the default `postgres` database to run `CREATE DATABASE`.

### Step 4: Initialize the database (migrations)

From the **backend** directory:

```bash
npm run db:init
```

This runs global and tenant migrations. Optionally set `TENANT_SCHEMAS` in `.env` (e.g. `TENANT_SCHEMAS=org_test`) so that tenant schemas are created and migrated; the seed script uses `org_test`.

### Step 5: Seed test data

From the **backend** directory:

```bash
npm run db:seed-test
```

This script:

- Ensures the tenant schema `org_test` exists and is migrated
- Creates or finds an organization and an admin user
- Prints **Tenant ID** and **User ID** to the console

**Copy these two IDs.** You will use them in the frontend login to test the app (e.g. the dev login or login page).

### Step 6: Start the application

From the **project root**:

```bash
npm run dev
```

This starts both the backend and the frontend:

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

Open the frontend URL, log in with the Tenant ID and User ID from the seed output, and you can create tasks and (as admin) trigger CSV exports.

---

## Running the Application

| Goal | Where to run | Command |
|------|----------------|--------|
| Start both backend and frontend | **Project root** | `npm run dev` |
| Start backend only | **backend/** | `npm run dev` |
| Start frontend only | **frontend/** | `npm run dev` |
| Create database | **backend/** | `npm run db:create` |
| Run migrations | **backend/** | `npm run db:init` |
| Seed test tenant and admin | **backend/** | `npm run db:seed-test` |

---

## Seeding Test Data

To have data and a user to test with:

1. **Backend** – Ensure `.env` is configured and PostgreSQL/Redis are running.
2. From **backend/** run:
   - `npm run db:create` (once, if the database does not exist)
   - `npm run db:init` (run migrations; use `TENANT_SCHEMAS=org_test` if you want the seed schema created on init)
   - `npm run db:seed-test`
3. Use the printed **Tenant ID** and **User ID** in the frontend login.

The seed creates:

- One organization (tenant) with schema `org_test`
- One admin user: `admin@example.com` (role: `admin`)

You can then sign in in the UI and test task listing/creation/completion and, as admin, CSV export.

---

## Technical Documentation

### Authentication

The API does not use OAuth or JWT. For development and integration, authentication is **header-based**:

- **`x-tenant-id`** – UUID of the organization (tenant). Required for all API requests that use tenant data. The backend resolves this to a schema name and uses it for multi-tenant isolation.
- **`x-user-id`** – UUID of the user within that tenant. Required for endpoints that need the current user (e.g. create task, get current user, trigger export).

The frontend stores these (and optionally a placeholder token) in `localStorage` after “login” and sends them on every request via the API client. The backend middleware:

1. **extractTenantId / extractUserId** – Read the headers and attach `tenantId` and `userId` to the request.
2. **loadTenant** – Load the organization by `tenantId`, set `schemaName` for the tenant’s schema.
3. **loadUser** – Load the user from the tenant schema by `userId` and attach the user (including `role`) to the request.

Endpoints that require a logged-in user use the **requireTenantAndUser** middleware chain. The **requireAdmin** middleware additionally checks that the loaded user’s `role` is `admin` (e.g. for `POST /api/tasks/export`).

---

### Task Management

Tasks are stored **per tenant** in that tenant’s schema (e.g. `org_test.tasks`). Each task has:

- `id` (UUID), `title`, `description` (optional), `status` (`pending` | `completed`), `user_id` (creator), timestamps

Implemented behaviour:

- **List tasks** – `GET /api/tasks` with tenant context; returns all tasks for that tenant.
- **Create task** – `POST /api/tasks` with tenant + user; body: `title` (required), optional `description`; sets `status` to `pending` and `user_id` to the current user.
- **Complete task** – `PATCH /api/tasks/:id` with body `{ "status": "pending" | "completed" }` to update status.

All task endpoints that touch tenant data require the `x-tenant-id` header; create and export also require `x-user-id` (and for export, admin role).

---

### Jobs and Polling

Heavy or deferred work is done via **Bull** and **Redis**:

- **tasks-export** – Loads tasks from the tenant schema, generates a UTF-8 CSV file, saves it to disk, updates the export record to `completed` with `file_path`, and enqueues a delayed **cleanup** job.
- **cleanup-export-file** – Runs after a delay (see below) and deletes the CSV file from disk.

The frontend does **not** use WebSockets. After triggering an export, it **polls** `GET /api/exports/:id` every 2 seconds until the export `status` is `completed` or `failed`, then shows a download button or error. This keeps the implementation simple while still reflecting job progress.

---

### CSV Export and Download URL Expiry

- An admin user triggers an export via `POST /api/tasks/export`. The API creates an export record (status `pending`), enqueues a **tasks-export** job, and returns the export `id` and status (e.g. `202` with “Export job queued”).
- When the job runs, it generates the CSV and sets the export to `completed` and sets `file_path`. The download URL is: `GET /api/exports/:id/file` (relative to the API base).
- **The download URL is valid for 1 minute only.** One minute after the file is written, a **cleanup-export-file** job runs and removes the CSV file from disk. After that, any request to `GET /api/exports/:id/file` will result in a **404** response (export file not found). The export record may still show `completed` and `fileUrl`, but the file is no longer available. Users should download the CSV promptly after the export completes.

---

## API Reference

All endpoints are under the `/api` prefix. Unless noted, responses use this shape:

- Success: `{ "success": true, "data": ... }`
- Error: `{ "success": false, "error": "message" }`

Required headers for tenant/user-scoped endpoints:

- `x-tenant-id`: UUID of the organization
- `x-user-id`: UUID of the user (where “Auth” is required)

---

### General

#### `GET /api`

API info.

**Response:** `200`

```json
{
  "success": true,
  "message": "Task Management API",
  "version": "1.0.0",
  "docs": "/health"
}
```

---

#### `GET /api/health`

Health check: database and Redis connectivity.

**Response:** `200` (or `503` if both are down)

```json
{
  "status": "ok",
  "timestamp": "2025-02-18T12:00:00.000Z",
  "uptime": 123.45,
  "services": {
    "database": true,
    "redis": true
  }
}
```

`status` may be `ok`, `degraded` (one service down), or `error` (both down).

---

### Users

#### `GET /api/users/me`

Returns the current authenticated user. Requires tenant + user (both headers).

**Headers:** `x-tenant-id`, `x-user-id`

**Response:** `200`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Errors:** `400` missing headers, `404` tenant or user not found.

---

### Tasks

#### `GET /api/tasks`

List all tasks for the current tenant. Requires tenant context.

**Headers:** `x-tenant-id`

**Response:** `200`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Task title",
      "description": "Optional description",
      "status": "pending",
      "user_id": "uuid",
      "created_at": "2025-02-18T12:00:00.000Z",
      "updated_at": "2025-02-18T12:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/tasks`

Create a task. Requires tenant + user.

**Headers:** `x-tenant-id`, `x-user-id`

**Request body:**

```json
{
  "title": "Task title",
  "description": "Optional description"
}
```

- `title`: required, non-empty string, max 500 characters  
- `description`: optional string

**Response:** `201`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Task title",
    "description": "Optional description",
    "status": "pending",
    "user_id": "uuid",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Errors:** `400` validation (e.g. missing/invalid title), `404` tenant/user not found.

---

#### `PATCH /api/tasks/:id`

Update a task’s status (e.g. mark completed). Requires tenant context.

**Headers:** `x-tenant-id`

**Request body:**

```json
{
  "status": "pending"
}
```

or

```json
{
  "status": "completed"
}
```

**Response:** `200`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "...",
    "description": "...",
    "status": "completed",
    "user_id": "uuid",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Errors:** `400` invalid `id` or `status`, `404` task not found.

---

#### `POST /api/tasks/export`

Trigger an asynchronous CSV export of all tasks for the tenant. **Admin only.** Requires tenant + user with role `admin`.

**Headers:** `x-tenant-id`, `x-user-id`

**Request body:** none

**Response:** `202`

```json
{
  "success": true,
  "data": {
    "id": "export-uuid",
    "status": "pending",
    "message": "Export job queued"
  }
}
```

**Errors:** `401` no user, `403` not admin, `404` tenant/user not found.

The client should poll `GET /api/exports/:id` until `status` is `completed` or `failed`, then offer download via `GET /api/exports/:id/file` (see below). **The download URL is valid for 1 minute; after that, the file is removed and the download endpoint returns 404.**

---

### Exports

#### `GET /api/exports/:id`

Get the status of an export. Requires tenant context.

**Headers:** `x-tenant-id`

**Response:** `200`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "pending",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

When `status` is `completed` and a file exists, `data` also includes:

```json
"fileUrl": "/api/exports/{id}/file"
```

When `status` is `failed`, `data` may include:

```json
"error": "Error message"
```

**Errors:** `400` invalid UUID, `404` export not found or different tenant.

---

#### `GET /api/exports/:id/file`

Download the export CSV file. Requires tenant context. The file is generated by the **tasks-export** job and is **removed by a cleanup job 1 minute after creation**. After that, this endpoint returns **404**.

**Headers:** `x-tenant-id`

**Response:** `200`

- `Content-Type: text/csv; charset=utf-8`
- `Content-Disposition: attachment; filename="tasks-export-{id}.csv"`
- Body: CSV content (UTF-8)

**Errors:** `400` invalid UUID, `404` export not found, export not completed, or file already removed (e.g. after the 1-minute window).

---

## Summary of Scripts by Directory

| Script | Directory | Description |
|--------|-----------|-------------|
| `npm run setup` | **Project root** | Install all dependencies (root, backend, frontend) |
| `npm run dev` | **Project root** | Run backend and frontend together |
| `npm run dev` | **backend/** | Run API with nodemon |
| `npm run db:create` | **backend/** | Create the PostgreSQL database |
| `npm run db:init` | **backend/** | Run database migrations |
| `npm run db:seed-test` | **backend/** | Seed test org and admin user; prints Tenant ID and User ID |
| `npm run dev` | **frontend/** | Run Vite dev server |

This README and the steps above are intended to make local setup simple and to document how authentication, task management, jobs, polling, and the time-limited CSV download work in this full-stack task management application.
