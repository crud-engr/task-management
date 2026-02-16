# task-management

TypeScript-based task management API with Express, Sequelize, PostgreSQL, Bull and Redis.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set `DB_PASSWORD` and any other values (PostgreSQL and Redis must be running).

3. **Run**
   ```bash
   npm run dev    # development (ts-node-dev)
   npm run build && npm start   # production
   ```

## Scripts

| Script      | Description                |
|------------|----------------------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled app             |
| `npm run typecheck` | Type-check without emitting |

## Project structure

```
src/
├── index.ts          # Entry point, starts server
├── app.ts            # Express app creation
├── config/           # Env, database, Redis
├── interfaces/       # Shared TypeScript interfaces
├── routes/           # API routes (e.g. /api/health)
└── queues/           # Bull queue setup
```

## API

- `GET /api` – API info
- `GET /api/health` – Health check (DB + Redis status)