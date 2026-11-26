# PeakFit

PeakFit is an individual fitness and nutrition platform: personalized workouts and meals, full progress tracking, and a dark-first web experience. **PeakFit V2** is a modern continuation of the original project—the previous Create React App + Flask app lives only in **Git history** (`main` and older commits), not in this branch’s working tree.

**Active branch:** `peakfit-v2` — single **Next.js** app at the repository root.

---

## Key features

**Planned / in progress (see milestone status below)**

- User authentication and protected routes (**Clerk**)
- Profile, workout and diet preferences
- AI-assisted plan generation (**OpenRouter**, server-side only)
- Profile and progress media (**Cloudinary**)
- Comprehensive progress tracking (weight, workouts, nutrition, goals, photos)
- Versioned REST APIs under `/api/v1` for web and future mobile clients

**Available today (Milestone 2 foundation)**

- Landing page, Clerk sign-in/sign-up, protected dashboard shell
- `GET /api/v1/health` — integration status (no secrets exposed)
- Prisma schema and initial migration SQL committed (apply when you approve a database)

---

## Technology stack

| Layer | Technology |
|--------|------------|
| Framework | **Next.js** 16 (App Router) |
| Language | **TypeScript** |
| UI | **Tailwind CSS** 4, **shadcn/ui** |
| Auth | **Clerk** (`@clerk/nextjs`) |
| Database | **PostgreSQL** |
| ORM | **Prisma** 6 |
| Validation | **Zod** |
| AI | **OpenRouter** (env-configured models) |
| Media | **Cloudinary** |
| Tests | **Vitest** |
| Hosting | **Render** (single web service; [`render.yaml`](render.yaml)) |

**Phase 2 (not started):** **Expo** + React Native — same APIs, Clerk, and PostgreSQL ([`mobile/README.md`](mobile/README.md)).

### Architecture (summary)

- **Monolith Next.js:** UI in `src/app/`, APIs in `src/app/api/v1/`, business logic in `src/lib/` and `src/services/` (Milestone 3+).
- **Identity:** Clerk `userId` → Prisma `User.clerkUserId` (planned in Milestone 3).
- **No separate Flask/CRA deploy** on this branch.

Details: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/TECH_STACK.md`](docs/TECH_STACK.md).

---

## Repository layout

```
PeakFit/
├── src/              # app, components, lib, services, utils, middleware
├── prisma/           # schema + migrations/
├── public/
├── tests/
├── scripts/          # e.g. legacy DB migration (Milestone 3+)
├── docs/             # audit, architecture, API, milestones
├── mobile/           # Phase 2 placeholder
├── package.json
├── .env.example
└── render.yaml
```

---

## Prerequisites

- **Node.js 20 LTS** (matches `render.yaml`)
- **npm** (lockfile: `package-lock.json`)
- Accounts for **required** services below (nothing is assumed configured)

---

## Local setup

```bash
git clone <your-repo-url>
cd peakfit
git checkout peakfit-v2   # if not already on V2 branch

cp .env.example .env.local
# Fill in required variables (see below)

npm install
npx prisma generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign-in routes: `/sign-in`, `/sign-up`.

**Build / test (no deploy):**

```bash
npm test
npm run lint
npm run build   # needs Clerk keys + DATABASE_URL for a full production build
```

---

## External services and environment variables

Secrets live in `.env.local` (local) or the **Render** service environment (production). Never commit `.env.local`.

### Required — development and production

| Service | Purpose | Suggested plan | Where to get credentials | Environment variables |
|---------|---------|----------------|--------------------------|------------------------|
| **[Clerk](https://dashboard.clerk.com)** | Auth, sessions, protected routes | Free tier for dev; Free or Pro for production | Clerk Dashboard → your application → **API Keys** | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` |
| **PostgreSQL** | App data (Prisma) | Free dev DB (Render Postgres, Neon, Supabase, or local Docker) | Your provider’s connection string UI | `DATABASE_URL` |

Also set:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` locally; your public URL on Render |

Clerk handles sign-in emails; this repo does **not** integrate a separate transactional email provider.

### Required for production deploy

| Service | Purpose | Suggested plan | Where | Notes |
|---------|---------|----------------|-------|-------|
| **[Render](https://render.com)** | Host Next.js (`npm run build` / `start`) | Free or Starter web service | New **Web Service**, repo root, branch `peakfit-v2` | Copy all env vars from `.env.example` into the service |
| **Render PostgreSQL** (recommended) | Same-vendor database | Free (time-limited) or paid | Render → **PostgreSQL** → connection string | Use as `DATABASE_URL` on the web service |

### Optional until Milestone 3+ (feature-gated in code)

| Service | Purpose | Suggested plan | Where to get credentials | Environment variables |
|---------|---------|----------------|--------------------------|------------------------|
| **[OpenRouter](https://openrouter.ai)** | AI workout/diet generation | Pay-as-you-go; free models if you choose them | API Keys + model list | `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`; optional `OPENROUTER_MODEL_FALLBACK`, `OPENROUTER_SITE_URL`, `OPENROUTER_APP_NAME` |
| **[Cloudinary](https://cloudinary.com)** | Image uploads | Free tier for dev | Dashboard → **API Keys** | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |

Until OpenRouter and Cloudinary are set, `/api/v1/health` reports **degraded** for those checks—expected before Milestone 3.

### Optional / later

| Item | When | Environment variables |
|------|------|------------------------|
| **Clerk webhooks** (user sync / delete) | Milestone 3+ when `/api/webhooks/clerk` exists | `CLERK_WEBHOOK_SECRET` |
| **Social login** (Google, etc.) | Anytime via Clerk dashboard | Configured in Clerk UI (no extra env in this repo today) |
| **Legacy PostgreSQL** (data migration) | One-time migration from old PeakFit DB | `LEGACY_DATABASE_URL` (read-only; see [`scripts/migrate-legacy/README.md`](scripts/migrate-legacy/README.md)) |
| **Expo / EAS** | Phase 2 mobile | Same Clerk app + API base URL; Expo account when you start mobile |

**Prisma** does not require its own cloud account—only `DATABASE_URL`.

---

## Database and Prisma

1. Create a **new** V2 database (do not use the legacy PeakFit DB for normal development).
2. Set `DATABASE_URL` in `.env.local`.
3. When you are ready to apply schema (owner-approved):

```bash
npx prisma generate          # also runs on postinstall / build
npm run db:migrate:dev       # local: creates/applies migrations
```

Production (after you approve migrations on Render):

```bash
npm run db:migrate:deploy    # typically in Render buildCommand — see render.yaml comment
```

Validate schema:

```bash
DATABASE_URL="postgresql://..." npx prisma validate
```

Schema and models: [`docs/DATABASE_DOCUMENTATION.md`](docs/DATABASE_DOCUMENTATION.md). Initial migration: `prisma/migrations/20251126000000_init/`.

---

## Development commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | `prisma generate` + production build |
| `npm run start` | Production server locally |
| `npm test` | Vitest (`tests/`) |
| `npm run lint` | ESLint |
| `npm run db:generate` | Regenerate Prisma Client |
| `npm run db:migrate:dev` | Prisma migrate (development) |
| `npm run db:migrate:deploy` | Prisma migrate (production) |

**API (current):** `GET /api/v1/health` — [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md) describes the full planned contract.

---

## Production deployment (Render)

1. Create **PostgreSQL** on Render; copy **Internal Database URL** (or external if required).
2. Create a **Web Service** from this repo:
   - **Root directory:** repository root (not a subfolder)
   - **Branch:** `peakfit-v2`
   - **Build:** `npm ci && npx prisma generate && npm run build` (add `npx prisma migrate deploy &&` when migrations are approved — see [`render.yaml`](render.yaml))
   - **Start:** `npm run start`
   - **Health check path:** `/api/v1/health`
3. Set environment variables (Clerk, `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, and Milestone 3+ keys as needed).
4. Deploy when ready (you control Git push; this README does not trigger deploys).

**Simplest setup:** Render Web Service + Render Postgres + Clerk + env vars above; add OpenRouter and Cloudinary when Milestone 3 ships.

---

## Milestone status and roadmap

| Milestone | Status |
|-----------|--------|
| 0 — Audit | Done |
| 1 — Planning & documentation | Done |
| 2 — Foundation (Next.js, Clerk, Prisma schema, health API) | Done |
| 3 — Core functionality (profile, prefs, AI) | **Not started** |
| 4 — Full progress tracking | Not started |
| 5 — UI/UX polish | Not started |
| 6 — Testing & hardening | Not started |
| 7 — Production readiness | Not started |

**Phase 2 — Mobile:** Expo + React Native, reusing `/api/v1`, Clerk, and PostgreSQL. Blocked until Phase 1 is stable. See [`mobile/README.md`](mobile/README.md) and [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md).

Live log: [`docs/PROGRESS.md`](docs/PROGRESS.md).

---

## Documentation index

| Document | Purpose |
|----------|---------|
| [`docs/PROJECT_AUDIT.md`](docs/PROJECT_AUDIT.md) | Historical legacy audit |
| [`docs/TECH_STACK.md`](docs/TECH_STACK.md) | Approved stack details |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System design |
| [`docs/DATABASE_DOCUMENTATION.md`](docs/DATABASE_DOCUMENTATION.md) | Data model |
| [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md) | API contract |
| [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) | Milestones |
| [`docs/PROGRESS.md`](docs/PROGRESS.md) | Delivery progress |