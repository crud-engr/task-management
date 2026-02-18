# Task Management — Backend API

TypeScript-based REST API for the Task Management app: Express, Sequelize (PostgreSQL), Redis, and Bull for job queues.

---

## Prerequisites

- Node.js 18+
- PostgreSQL (running)
- Redis (running)

---

## Setup

Run these commands from the **backend** directory (`backend/`).

### 1. Install dependencies

```bash
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

Edit `.env` and set at least:

- `DB_PASSWORD` — PostgreSQL password for `DB_USER`
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_NAME` if not using defaults
- Redis: `REDIS_HOST`, `REDIS_PORT`, etc. if not using defaults

### 3. Create the database (first time)

```bash
npm run db:create
```

Creates the database named in `DB_NAME` (default: `task_management`). Connects to the default `postgres` database to run `CREATE DATABASE`.

### 4. Run migrations

```bash
npm run db:init
```

Runs global and tenant migrations. Optionally set `TENANT_SCHEMAS` (e.g. `TENANT_SCHEMAS=org_test`) so tenant schemas are created and migrated. The seed script uses `org_test`.

### 5. Seed test data (optional)

```bash
npm run db:seed-test
```

Creates or finds the tenant schema `org_test`, an organization, and an admin user. Prints **Tenant ID** and **User ID** for use in the frontend login. See the [root README](../README.md) for full setup.

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with nodemon (hot reload) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled app (`node dist/index.js`) |
| `npm run typecheck` | Type-check without emitting |
| `npm run db:create` | Create the PostgreSQL database |
| `npm run db:init` | Run global and tenant migrations |
| `npm run db:seed-test` | Seed test org and admin user; prints Tenant ID and User ID |

---

## Database and multitenancy

- **PostgreSQL** is configured via `DB_*` env vars. Optional: `DB_SSL`, `DB_SSL_REJECT_UNAUTHORIZED` for TLS.
- **Schema-based multitenancy**: each tenant has a dedicated schema (e.g. `org_test`) in the same database. Helpers in `src/database/`:
  - `runInSchema(schemaName, async (tx) => { ... })` — run code with `search_path` set; use `tx` for all queries.
  - `getSchemaOptions(schema)` — use with Sequelize: `Model.findAll({ ...getSchemaOptions('tenant_1') })`.
  - `createSchema`, `ensureSchema`, `schemaExists`, `dropSchema`, `validateSchemaName`.
- **Migrations**: `src/database/migrations/` — global migrations (e.g. organizations, exports in `public`) and tenant migrations (e.g. users, tasks per schema). Migrations run on app startup. Set `TENANT_SCHEMAS` to create and migrate tenant schemas on startup.

---

## Jobs (Bull + Redis)

- **tasks-export**: loads tasks from the tenant schema, writes a UTF-8 CSV to disk, updates the export record, then enqueues a delayed cleanup job.
- **cleanup-export-file**: runs after 1 minute and deletes the CSV file. The download URL (`GET /api/exports/:id/file`) is valid for **1 minute**; after that, requests return 404.

See the [root README](../README.md) for full API and export behaviour.

---

## Project structure

```
backend/
├── src/
│   ├── index.ts           # Entry point, starts server and job processor
│   ├── app.ts             # Express app, CORS, routes, error handling
│   ├── config/            # Env, database, Redis
│   ├── controllers/       # Request handlers (tasks, users, exports)
│   ├── database/          # Schema helpers, migrations (multitenancy)
│   ├── interfaces/        # Shared TypeScript interfaces
│   ├── jobs/              # Bull queue, processors (tasks-export, cleanup)
│   ├── middleware/        # Tenant/user extraction, loadTenant, loadUser, requireAdmin
│   ├── models/            # Sequelize models (Organization, User, Task, Export, JobStatus)
│   ├── routes/            # API routes (health, tasks, users, exports)
│   ├── services/          # e.g. csvExport
│   └── scripts/           # db:create, init-db, seed-test-data
├── package.json
├── tsconfig.json
└── nodemon.json
```

---

## API overview

All routes are under `/api`. The API expects `x-tenant-id` (and for some routes `x-user-id`). See the [root README](../README.md) for full request/response documentation.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api` | API info |
| GET | `/api/health` | Health check (DB + Redis) |
| GET | `/api/users/me` | Current user (requires tenant + user) |
| GET | `/api/tasks` | List tasks (tenant) |
| POST | `/api/tasks` | Create task (tenant + user) |
| PATCH | `/api/tasks/:id` | Update task status (tenant) |
| POST | `/api/tasks/export` | Trigger CSV export (tenant + admin) |
| GET | `/api/exports/:id` | Export status (tenant) |
| GET | `/api/exports/:id/file` | Download CSV (tenant); valid 1 min, then 404 |
