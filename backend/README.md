# task-management

TypeScript-based task management API with Express, Sequelize, PostgreSQL and Redis.

## Setup

1. **Install dependencies** (from `backend/`)
   ```bash
   cd backend && npm install
   ```

2. **Environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set `DB_PASSWORD` and any other values (PostgreSQL and Redis must be running).

3. **Run** (from `backend/`)
   ```bash
   npm run dev    # development (nodemon)
   npm run build && npm start   # production
   ```

## Scripts

| Script      | Description                |
|------------|----------------------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled app             |
| `npm run typecheck` | Type-check without emitting |

## Database and multitenancy

- **PostgreSQL** is configured via `DB_*` env vars; optional `DB_SSL` and `DB_SSL_REJECT_UNAUTHORIZED` for TLS.
- **Schema-based multitenancy**: each tenant uses a dedicated schema (e.g. `tenant_abc`) in the same database. Helpers live in `src/database/`:
  - `runInSchema(schema, async (tx) => { ... })` – run code with `search_path` set (use `tx` for all queries).
  - `getSchemaOptions(schema)` – use with Sequelize queries: `Model.findAll({ ...getSchemaOptions('tenant_1') })`.
  - `createSchema`, `ensureSchema`, `schemaExists`, `dropSchema`, `validateSchemaName`.
- **Migrations**: `src/database/migrations/` has global migrations (e.g. `tenants` table in `public`) and tenant migrations (e.g. `tasks` table per schema). They run automatically on app startup. Set optional `TENANT_SCHEMAS=tenant_a,tenant_b` to create and migrate those tenant schemas on startup.

## Project structure

```
backend/
├── src/
│   ├── index.ts      # Entry point, starts server
│   ├── app.ts        # Express app creation
│   ├── config/       # Env, database, Redis
│   ├── database/     # Schema helpers, migrations (multitenancy)
│   ├── interfaces/   # Shared TypeScript interfaces
│   └── routes/       # API routes (e.g. /api/health)
├── package.json
├── tsconfig.json
└── nodemon.json
```

## API

- `GET /api` – API info
- `GET /api/health` – Health check (DB + Redis status)