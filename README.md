# PeakFit

AI-powered fitness and nutrition platform — personalized workouts, diet, and full progress tracking.

PeakFit V2 is a **Next.js** application at the repository root (App Router, Route Handlers, Prisma, Clerk). The previous CRA + Flask implementation remains in **Git history** on `main` and earlier commits; it is not kept in the working tree.

## Layout

```
PeakFit/
├── src/              # App, components, lib, services, utils, APIs
├── prisma/           # Schema and migrations
├── public/           # Static assets
├── tests/            # Vitest
├── scripts/          # Tooling (e.g. legacy DB migration)
├── docs/             # Architecture and delivery documentation
├── mobile/           # Phase 2 — Expo (reserved)
└── package.json
```

## Quick start

```bash
cp .env.example .env.local
# Set Clerk, DATABASE_URL, OpenRouter, Cloudinary
npm install
npx prisma generate
npm run dev
```

## Commands

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm test` | Unit tests |
| `npm run lint` | ESLint |
| `npm run db:migrate:dev` | Prisma migrate (when DB is ready) |

## API

- `GET /api/v1/health` — public health check

See [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md).

## Documentation

| Doc | Purpose |
|-----|---------|
| [`docs/PROJECT_AUDIT.md`](docs/PROJECT_AUDIT.md) | Legacy audit (historical) |
| [`docs/TECH_STACK.md`](docs/TECH_STACK.md) | Approved stack |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System design |
| [`docs/DATABASE_DOCUMENTATION.md`](docs/DATABASE_DOCUMENTATION.md) | Data model |
| [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md) | API contract |
| [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) | Milestones |
| [`docs/PROGRESS.md`](docs/PROGRESS.md) | Progress log |

## Deploy

[`render.yaml`](render.yaml) — single Render web service (repo root).

## Status

Milestone 2 foundation complete — [`docs/PROGRESS.md`](docs/PROGRESS.md). Milestone 3 not started.