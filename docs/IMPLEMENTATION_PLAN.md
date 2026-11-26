# PeakFit V2 — Implementation Plan

**Last updated:** 2026-11-26  
**Status:** Milestone 1 complete — awaiting approval to start Milestone 2 (code)

---

## 1. Goals

1. Ship production-ready **Next.js** web app on **Render**.
2. **Full progress tracking** (sections A–J from product spec).
3. **Migrate all legacy PostgreSQL data** where mappable.
4. Preserve business intent of profile, workout/diet prefs, AI plans — without trainer features.
5. Prepare **API surface** for Expo (Phase 2).

---

## 2. Migration strategy

### Phase A — Parallel codebase
- Active Next.js app at **repository root**. Legacy CRA + Flask: Git history on `main` / pre-V2 commits.
- Legacy remains runnable for comparison until V2 parity.

### Phase B — Schema and Clerk
1. Provision new PostgreSQL on Render.
2. Apply Prisma migrations.
3. Configure Clerk application (Google/social as enabled).
4. Run **legacy export** script against `LEGACY_DATABASE_URL` (read-only).

### Phase C — Identity migration
1. For each `peakfit_users` row: create Clerk user via **Bulk Import / Migration API** (email required).
2. If hash import unsupported: send password reset / magic link campaign (document in runbook).
3. Insert `User` with `clerkUserId` + `legacyUserId`.

### Phase D — Data load
1. Profiles → `UserProfile`.
2. Latest workout plan per user → `WorkoutPreferences` (strip trainer fields).
3. Diet plan → `DietPreferences`.
4. Validate counts and sample records.

### Phase E — Cutover
1. Point Render to `web/` service.
2. Retire legacy API URLs after smoke tests.
3. Keep legacy DB snapshot read-only for rollback window (owner-managed).

**No destructive DB operations** without explicit approval.

---

## 3. Milestones

### Milestone 0 — Audit ✅
- Repository inspected; findings in `PROJECT_AUDIT.md`.
- Re-verified: 55 files, unchanged at `f1f014c`.

### Milestone 1 — Planning and documentation ✅
- `TECH_STACK.md`, `ARCHITECTURE.md`, `DATABASE_DOCUMENTATION.md`, `API_DOCUMENTATION.md`, this file, `PROGRESS.md`.

### Milestone 2 — Foundation
**Deliverables:**
- [ ] `web/` Next.js + TypeScript + Tailwind + shadcn/ui
- [ ] Prisma schema v1 (all core + progress tables)
- [ ] Local PostgreSQL / Docker connection doc
- [ ] Clerk middleware + sign-in/up routes
- [ ] Env validation module (Zod env schema)
- [x] ImageKit server helper (`src/lib/integrations/imagekit/client.ts`)
- [ ] OpenRouter client module (no default model hardcoded in code — require env)
- [ ] `GET /api/v1/health`
- [ ] Render `render.yaml` or documented build/start commands
- [ ] Migration script skeleton `scripts/migrate-legacy/`

**Acceptance:** App boots; health passes; Clerk login works in dev; prisma migrate applies.

### Milestone 3 — Core functionality
**Deliverables:**
- [ ] Profile CRUD
- [ ] Workout preferences upsert/read
- [ ] Diet preferences upsert/read
- [ ] AI: workout, diet, daily plan endpoints with Zod output parsing
- [ ] Rate limiting on AI routes
- [ ] Daily fitness page (consume AI + prefs)
- [ ] Legacy migration script executable (dry-run mode)

**Acceptance:** End-to-end: new user → set prefs → generate plan → see results.

### Milestone 4 — Full progress tracking
**Deliverables:**
- [ ] All progress models + APIs per `API_DOCUMENTATION.md`
- [ ] Workout session logging + PR logic + history
- [ ] Charts (weight, body comp, calories, steps, water, sleep, measurements)
- [ ] Progress photos upload flow
- [ ] Goals CRUD + progress computation
- [ ] Daily / weekly / monthly / yearly views
- [ ] TZ-aware daily aggregation

**Acceptance:** Every metric A–J functional; historical entries not overwritten on new insert.

### Milestone 5 — UI/UX
**Deliverables:**
- [ ] Dark-first theme (charcoal + gold accents)
- [ ] All 12 page areas from product spec
- [ ] Landing, dashboard, settings (real prefs: units, timezone)
- [ ] Legal pages (About, Contact, Privacy) — content from owner or placeholders marked for legal review
- [ ] Responsive nav; loading/empty/error states
- [ ] Remove trainer UI from any ported copy

**Acceptance:** Lighthouse/a11y spot-check; consistent design system.

### Milestone 6 — Testing and hardening
**Deliverables:**
- [ ] API integration tests (auth mocked)
- [ ] E2E: login, profile, log workout, add weight, generate AI (mocked in CI)
- [ ] Authorization tests (user A cannot read user B)
- [ ] Rate limit tests
- [ ] Run full legacy migration dry-run + one staging import

**Acceptance:** CI green; critical paths covered.

### Milestone 7 — Production readiness
**Deliverables:**
- [ ] Render production env checklist
- [ ] `prisma migrate deploy` in build pipeline
- [ ] Structured logging
- [ ] Owner-approved production deploy (agent does not push/deploy without approval)
- [ ] Update all docs; Phase 2 mobile API checklist

**Acceptance:** Owner sign-off on staging → production.

---

## 4. Page map (V2 routes)

| Page | App route (planned) |
|------|---------------------|
| Landing | `/` |
| Sign-in/up | `/sign-in`, `/sign-up` (Clerk) |
| Dashboard | `/dashboard` |
| Profile | `/profile` |
| Workout preferences | `/workouts/preferences` |
| Workout plans / logging | `/workouts`, `/workouts/[id]` |
| Diet preferences | `/diet/preferences` |
| Diet plans | `/diet` |
| Daily fitness | `/today` |
| Progress | `/progress` |
| Goals | `/goals` |
| Settings | `/settings` |

---

## 5. Risk register

| Risk | Mitigation |
|------|------------|
| Clerk password migration | Plan B: reset emails; document in migration runbook |
| OpenRouter model availability | Env fallback model; graceful error UI |
| Large progress schema scope | Milestone 4 split into weekly internal checkpoints |
| React 19 + Next compatibility | Pin versions after install smoke test |
| Legacy JSON inconsistency | Transform layer in migration script with logging |

---

## 6. Owner inputs still required

| Item | Blocks |
|------|--------|
| OpenRouter model IDs (incl. free tier) | Milestone 3 AI config |
| Clerk app created (keys in Render) | Milestone 2 |
| Legacy DB connection for export | Migration execution |
| Legal copy for Privacy/Terms | Milestone 5 go-live |
| Production deploy approval | Milestone 7 |

---

## 7. What happens next (after your approval)

Start **Milestone 2 — Foundation** only:
- Scaffold `web/`
- Legacy reference via `git show` / checked-out paths for migration scripts only.

**Do not** commit or push to GitHub (per project rules).