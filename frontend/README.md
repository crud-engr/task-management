# Task Management Frontend

A modern task management application built with Vite, React, and TypeScript.

## Features

- ⚡️ Vite for fast development and building
- ⚛️ React 18 with TypeScript
- 🔧 Axios for API communication
- 📦 TypeScript with strict type checking
- 🎯 Path aliases configured (`@/` for `src/`)
- 🔐 Environment-based configuration

## Project Structure

```
task-management-FE/
├── src/
│   ├── api/              # API client configuration
│   │   ├── client.ts     # Axios instance and API client class
│   │   └── index.ts      # API exports
│   ├── config/           # Configuration files
│   │   └── env.ts        # Environment variables
│   ├── types/            # TypeScript type definitions
│   │   └── api.types.ts  # API-related types
│   ├── App.tsx           # Main App component
│   ├── main.tsx          # Application entry point
│   ├── index.css         # Global styles
│   └── vite-env.d.ts     # Vite environment types
├── .env                  # Environment variables (create from .env.example)
├── .env.example          # Example environment variables
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your API configuration:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

### Preview

Preview the production build:
```bash
npm run preview
```

## TypeScript Configuration

- Strict type checking enabled
- Path aliases configured (`@/` maps to `src/`)
- React JSX transform enabled
- Modern ES2020 target

## Environment Variables

All environment variables must be prefixed with `VITE_` to be accessible in the application.

- `VITE_API_BASE_URL`: Base URL for the API (default: `http://localhost:3000/api`)
- `VITE_API_TIMEOUT`: Request timeout in milliseconds (default: `10000`)

## License

MIT
