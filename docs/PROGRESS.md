# PeakFit V2 — Progress Log

Track milestone completion here. Updated after each milestone.

---

## Overview

| Milestone | Name | Status | Completed |
|-----------|------|--------|-----------|
| 0 | Audit | **Done** | 2026-11-26 |
| 1 | Planning & documentation | **Done** | 2026-11-26 |
| 2 | Foundation | **Done** | 2026-11-26 |
| — | Repository restructure | **Done** | 2026-11-26 |
| — | Root hoist (Silver Store layout) | **Done** | 2026-11-26 |
| 3 | Core functionality | Not started | — |
| 4 | Full progress tracking | Not started | — |
| 5 | UI/UX | Not started | — |
| 6 | Testing & hardening | Not started | — |
| 7 | Production readiness | Not started | — |

**Phase 2 (Expo mobile):** Not started — blocked on Phase 1 stable.

---

## Milestone 0 — Audit

**Completed:** 2026-11-26

- Read-only inspection of entire repo (55 tracked source files).
- Documented architecture, APIs, bugs, security, reuse/replace matrix.
- Confirmed repo unchanged at commit `f1f014c`.
- Output: `PROJECT_AUDIT.md` (and summary presented to owner).

---

## Milestone 1 — Planning & documentation

**Completed:** 2026-11-26

**Owner decisions captured:**
- Stack: Next.js, TypeScript, Tailwind, shadcn, Prisma, Clerk, OpenRouter, Cloudinary, Render, Expo (Phase 2).
- Repo layout: **Recommended `web/`** alongside legacy.
- Data: **Full migration** from legacy PostgreSQL.
- Scope: Individual users only (no trainers).
- UI: Evolve dark + gold aesthetic.
- OpenRouter models: TBD by owner (env-driven).

**Artifacts created:**
1. `PROJECT_AUDIT.md`
2. `TECH_STACK.md`
3. `ARCHITECTURE.md`
4. `IMPLEMENTATION_PLAN.md`
5. `DATABASE_DOCUMENTATION.md`
6. `API_DOCUMENTATION.md`
7. `PROGRESS.md` (this file)

---

## Milestone 2 — Foundation

**Completed:** 2026-11-26

**Delivered:**
- New app in `web/` — **legacy `frontend/` and `backend/` untouched**
- Next.js 16.4.6, React 19, TypeScript, Tailwind 4, shadcn/ui (button, card)
- Prisma 6.19 schema (full V2 domain model) + SQL migration file `20251126000000_init` (not applied to any DB)
- Clerk: middleware, sign-in/up routes, protected `/dashboard`, server `auth()` header
- Env validation (`src/lib/env.ts`) — OpenRouter models **env-only**, no hardcoded IDs
- OpenRouter + Cloudinary server clients (config guards, no credentials in code)
- `GET /api/v1/health` — public health + integration status
- API helpers (`jsonSuccess`, `jsonError`, `requireUserId`)
- Dark + gold theme baseline, landing + dashboard shell
- `render.yaml`, `web/README.md`, `web/env.example`
- Legacy migration placeholder: `web/scripts/migrate-legacy/README.md`
- Vitest: **10 tests passing**; `npm run build` succeeds with placeholder Clerk env
- `PROGRESS.md` updated (this entry)

**Verification:**
- `npm test` — pass
- `npm run lint` — pass (0 errors)
- `npm run build` — pass
- No legacy files modified
- No `prisma migrate deploy` / no legacy DB connection

**Owner next steps for local dev:**
1. Copy `web/env.example` → `web/.env.local`
2. Add Clerk keys + V2 `DATABASE_URL`
3. Run `npm run db:migrate:dev` in `web/` when DB is ready
4. Add `OPENROUTER_MODEL` when model IDs are chosen
5. `npm run dev`

**Pending before Milestone 3:**
- OpenRouter free model IDs
- Clerk production instance on Render
- Apply initial migration to V2 PostgreSQL

---

## Repository restructure

**Completed:** 2026-11-26

- Earlier: temporary `legacy/` copy (removed in final cleanup; history preserved in Git).
- `docs/` — all seven project markdown files.
- `mobile/` — Phase 2 placeholder README.
- Root `README.md` and `.gitignore` updated for V2-only active build.
- Obsolete root Django `requirements.txt` removed from V2 branch.
- Empty root `frontend/` / `backend/` may remain on Windows until file handles released; see `MOVED.md` (safe to delete when unlocked).
- `web/` unchanged (no schema/auth code changes).

---

## Root hoist — Next.js at repository root

**Completed:** 2026-11-26

- Moved active app from `web/` to repo root (`src/`, `prisma/`, `public/`, `scripts/`, configs).
- Added `tests/` (Vitest), `src/services/`, `src/utils/`, placeholders in `context/`, `hooks/`, `types/`.
- Removed `web/` wrapper; `render.yaml` runs from repo root.
- Deleted unused Create Next App `public/*.svg` placeholders.
- ESLint ignores `docs/`, `mobile/`.
- No Prisma schema/migration edits; no auth/integration logic changes.

---

## Final cleanup — legacy removed from working tree

**Completed:** 2026-11-26 (branch `peakfit-v2`)

- Removed `legacy/` duplicate tree; pre-V2 code remains in Git history.
- Removed obsolete root Python/Django requirements from V2 branch.
- Dropped empty `src/context`, `src/hooks`, `src/types` placeholders.
- Single commit: `feat: modernize PeakFit with Next.js V2 foundation`.

---

## Milestone 3 — Core functionality

_Not started._

---

## Milestone 4 — Full progress tracking

_Not started._

---

## Milestone 5 — UI/UX

_Not started._

---

## Milestone 6 — Testing & hardening

_Not started._

---

## Milestone 7 — Production readiness

_Not started._

---

## Decision log (running)

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-11-26 | V2 in `web/` folder | Preserves legacy for migration/reference; single Render deploy root |
| 2026-11-26 | Full legacy DB migration | Owner requirement; script + Clerk identity mapping |
| 2026-11-26 | Drop trainer fields in V2 | Product scope: individual fitness only |
| 2026-11-26 | API prefix `/api/v1` | Mobile-ready versioning |
| 2026-11-26 | Append-only metric history | Product spec: never overwrite history on new measurements |
| 2026-11-26 | Prisma 6.19 (stable) | Avoid Prisma 8 RC in production foundation |
| 2026-11-26 | Disabled Next `cacheComponents` for M2 | Clerk + auth require runtime data; build must pass on Render |
| 2026-11-26 | Clerk header via `auth()` + Suspense | `@clerk/nextjs` Core 3 removes `<SignedIn>`/`<SignedOut>` in layout |
| 2026-11-26 | Migration SQL committed, not applied | No DB operations without owner DATABASE_URL + approval |