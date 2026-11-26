# PeakFit V2 — Implementation Status

**Last updated:** 2026-11-26 (login redirect + global UI scale pass)

See **`docs/FINAL_QA_REPORT.md`** for evidence-based QA results.

## Phase summary

| # | Phase | Status |
|---|--------|--------|
| 1 | Foundation | **Done** |
| 2 | User onboarding | **Done** (single-form UI; multi-step UX planned) |
| 3 | Dashboard | **Done** (live DB; weight chart; unified stat cards) |
| 4 | Workout management | **Done** (library page; session detail UI) |
| 5 | Diet & nutrition | **Done** (intake + expenditure, macros, Indian pref) |
| 6 | Progress tracking | **Done** (7 metric UIs in Progress hub) |
| 7 | AI | **Done** (OpenRouter + fallback, chat, plans UI) |
| 8 | Integration | **Done** |
| 9 | Testing | **Done** (36 Vitest + Playwright auth when E2E creds set) |
| 10 | Production prep | **Documented** |
| 11 | UI / design system | **Done** (scale + redirect pass) |

## Authentication redirects (2026-11-26)

| Behaviour | Status |
|-----------|--------|
| Post sign-in default → `/dashboard` (`ClerkProvider`, `SignIn`/`SignUp`, env fallbacks) | ✅ |
| Client `AuthSessionRedirect` after Clerk session (password + OAuth) | ✅ |
| Signed-in users on `/sign-in` or `/sign-up` → app (middleware + server page) | ✅ |
| Safe `redirect_url` validation (`lib/auth/safe-redirect.ts`) | ✅ |
| Post-auth destination respects onboarding (`resolvePostAuthDestination`) | ✅ |
| Onboarding gate on all `(app)` routes via layout + `x-pathname` middleware header | ✅ |
| Protected routes → Clerk `auth.protect()` (sign-in with return URL) | ✅ |

## UI scale (2026-11-26)

| Token / surface | Change |
|-----------------|--------|
| `--content-max-width` 90rem, page padding tokens | ✅ `globals.css` |
| `--header-height`, `--sidebar-width`, `--chart-min-height` | ✅ shared layout |
| Base type rhythm (`html` ~17px), `.field` min height | ✅ readability |
| `Button`, `Input`, `Label`, `Card` spacing | ✅ shadcn primitives |
| `PageHeader`, `StatCard`, `EmptyState`, `AppShell`, site header | ✅ app chrome |
| Colours / fonts / dark-first identity | ✅ unchanged |

## Design system (2026-11-26)

| Item | Status |
|------|--------|
| Dark-first tokens (`globals.css`) | ✅ |
| Space Grotesk headings + Geist body | ✅ |
| Semantic success / warning colours | ✅ |
| Shared layout: `PageHeader`, `StatCard`, `EmptyState` | ✅ |
| shadcn: Input, Badge, Label, Tabs, Skeleton, Separator | ✅ |
| App shell: sidebar (desktop) + bottom nav (mobile) | ✅ |
| Public footer + marketing pages | ✅ |
| Consistent `page-container` / `content-grid` | ✅ |

## Page-by-page UI checklist

Legend: ✅ Polished & wired · 🟡 Functional, consolidated route · ❌ Not built · 🔧 Blocked by backend

### Public website

| Route | Status | Notes |
|-------|--------|-------|
| `/` Landing | ✅ | Hero, feature strip, CTA, footer |
| `/features` | ✅ | Feature grid |
| `/about` | ✅ | Brand story |
| `/contact` | ✅ | Mailto-backed contact form (no ticket API) |
| `/privacy` | ✅ | Policy content |
| `/terms` | ✅ | Terms content |
| `/sign-in` | ✅ | Clerk + PeakFit branding |
| `/sign-up` | ✅ | Clerk + PeakFit branding |

### Onboarding

| Route | Status | Notes |
|-------|--------|-------|
| `/onboarding` | ✅ | 4-step wizard; same API writes as before |

### App shell & navigation

| Item | Status |
|------|--------|
| Sidebar + mobile bottom nav | ✅ |
| Clerk user menu | ✅ |
| Public header links (signed out) | ✅ |

### Dashboard & today

| Route | Status | Notes |
|-------|--------|-------|
| `/dashboard` | ✅ | Live stats, weight chart, macros, goals, workouts |
| `/today` | ✅ | AI generate + saved plans |

### Workouts

| Route | Status | Notes |
|-------|--------|-------|
| `/workouts` | ✅ | Log session, history, PRs |
| `/workouts/[id]` | ✅ | Session detail tables |
| `/workouts/library` | ✅ | Static exercise library |
| `/workouts/preferences` | ✅ | Preferences form |
| Exercise detail page | 🟡 | Covered by library cards (no per-exercise DB) |
| Live workout session UI | 🟡 | Create via form; no dedicated timer page |

### Nutrition

| Route | Status | Notes |
|-------|--------|-------|
| `/diet` | ✅ | Meals, expenditure, history |
| `/diet/plan` | ✅ | Week/month calendar, CRUD, daily totals |
| `/diet/preferences` | ✅ | |
| Per-food detail page | 🟡 | Meal list only; no food catalog DB |

### Progress

| Route | Status | Notes |
|-------|--------|-------|
| `/progress` | ✅ | Tabs: weight, water, sleep, steps, body fat, measurements, photos |

### AI

| Route / API | Status | Notes |
|-------------|--------|-------|
| `/assistant` | ✅ | Generate, chat, status panel, saved plans |
| `/assistant/plans/[id]` | ✅ | Rich workout/diet/daily/recommendations views |
| `POST /api/v1/ai/workout-plan` | ✅ | Zod + fallback + idempotency |
| `POST /api/v1/ai/diet-plan` | ✅ | Indian pref in prompt; calorie normalization |
| `POST /api/v1/ai/daily-plan` | ✅ | Combined workout + diet |
| `POST /api/v1/ai/recommendations` | ✅ | Progress-aware daily tips |
| `POST /api/v1/ai/chat` | ✅ | Session history in browser; 40 turns/hour audit rows |
| `GET /api/v1/ai/status` | ✅ | Public model IDs; `?probe=1` connectivity |
| `GET/DELETE /api/v1/ai/plans/[id]` | ✅ | User-scoped |
| `GET /api/v1/ai/plans` | ✅ | Excludes `chat_turn` audit noise |

### Profile & settings

| Route | Status | Notes |
|-------|--------|-------|
| `/profile` | ✅ | Profile editor |
| `/settings` | ✅ | Hub + privacy link |
| `/goals` | ✅ | Goals manager |
| Account self-delete | ✅ | Settings + `DELETE /api/v1/account` + Clerk delete |

### Responsive verification

| Breakpoint | Status | Notes |
|------------|--------|-------|
| Desktop ≥1440px | ✅ | `max-w-[90rem]` content |
| Laptop 1024–1439 | ✅ | Sidebar visible |
| Tablet 768–1023 | ✅ | Drawer nav + bottom bar hidden at lg |
| Mobile 320–767 | ✅ | Bottom nav, stacked cards |

## Database migrations (Aiven)

| Migration | Status |
|-----------|--------|
| `20251126000000_init` | Applied |
| `20251126140000_nutrition_indian_prefs` | Applied |
| `20251126180000_meal_planning` | Applied |

## Verification

| Command | Result (2026-11-26) |
|---------|---------------------|
| `npm run lint` | Pass |
| `npx tsc --noEmit` | Pass |
| `npx next build` | Pass (59+ API/app routes) |
| `npm test` | **37 passed** (+ auth redirect unit tests; load `.env.local` for DB integrations) |
| `npm run test:integration` | **7 passed** |
| `npm run test:e2e` | **38 public**; **+14 authenticated** when `E2E_CLERK_*` in `.env.local` |

## Blockers (manual)

- **OpenRouter free-tier rate limits** — primary/fallback may return 429 under load; retry later or upgrade quota
- **Clerk phone OTP** — enable in Clerk Dashboard if required
- **Authenticated Playwright** — add `E2E_CLERK_USER_EMAIL` / `E2E_CLERK_USER_PASSWORD` (dedicated password user) in `.env.local`
- **Per-food catalog** — no separate food DB; meals are free-form / planned titles

## AI integration (2026-11-26)

| Item | Status |
|------|--------|
| Env: `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_MODEL_FALLBACK` | ✅ Verified present in `.env.local` (values not logged) |
| Server-only API key usage | ✅ |
| Primary → fallback on 408/429/5xx only | ✅ |
| Zod schemas + calorie/macro normalization | ✅ `lib/validators/ai.ts` |
| Context uses profile + dashboard progress (no full name) | ✅ `ai-context.service.ts` |
| Idempotent saves (`clientRequestId`, 15 min window) | ✅ |
| Medical disclaimer in prompts + chat UI | ✅ |
| Vitest: validators, JSON parse, fallback mock, isolation | ✅ |
| Live probe | `RUN_OPENROUTER_PROBE=1 npm test -- connectivity.integration` |

## Security notes (audit)

- All `/api/v1/*` except health require Clerk middleware + `withAuth` user scoping
- Image upload: 5MB max, image MIME allowlist
- AI rate limit: 30 plans/hour/user; 40 chat turns/hour (audit via `chat_turn` rows)
- Secrets only via env (`.env.example` documents names)