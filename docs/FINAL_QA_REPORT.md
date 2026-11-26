# PeakFit V2 — Final QA Report

**Audit date:** 2026-11-26  
**Evidence:** Commands run in-repo after fixes (see Verification).

## Executive summary

| Area | Result |
|------|--------|
| Production build | **Pass** |
| ESLint | **Pass** |
| Vitest (unit + integration) | **36 passed**, 1 skipped (with `DATABASE_URL` from `.env.local`) |
| TypeScript | **Pass** (`npx tsc --noEmit`) |
| Playwright E2E | **38 passed** |
| Critical fix applied | API routes now return **JSON 401** (was HTML 404) |
| Authenticated Playwright | **Ready** — `@clerk/testing` + `storageState`; set `E2E_CLERK_USER_EMAIL` / `PASSWORD` in `.env.local` |
| Meal planning | ✅ `/diet/plan` + `PlannedMeal` migration |
| Account deletion | ✅ Self-serve in Settings |

---

## 1. Route inventory (73 build entries)

### Public app pages (11)
| Route | QA status |
|-------|-----------|
| `/` | ✅ E2E render + responsive overflow |
| `/features` | ✅ |
| `/about` | ✅ |
| `/contact` | ✅ form → mailto |
| `/privacy`, `/terms` | ✅ |
| `/sign-in`, `/sign-up` | ✅ Clerk embed |

### Authenticated app pages (23)
| Route | QA status | Notes |
|-------|-----------|-------|
| `/onboarding` | 🟡 | E2E redirects to sign-in; 4-step wizard validated in code |
| `/dashboard` | 🟡 | Live DB; E2E auth redirect |
| `/today` | 🟡 | AI actions + saved plans |
| `/workouts`, `/workouts/[id]`, `/workouts/library`, `/workouts/preferences` | 🟡 | Session integration test passes |
| `/diet`, `/diet/plan`, `/diet/preferences` | 🟡 | Logging + meal calendar CRUD |
| `/progress` | 🟡 | 7 metric tabs + photos |
| `/goals` | 🟡 | CRUD via API |
| `/assistant`, `/assistant/plans/[id]` | 🟡 | Chat + plan detail UI |
| `/profile`, `/settings` | 🟡 | Profile editor; settings hub |

🟡 = Requires signed-in manual or Clerk test harness; unauthenticated redirect verified by Playwright.

### API routes (45 under `/api/v1`)
- All non-health routes use **`withAuth`** or **`listHandler` / `createHandler`** (static audit: `tests/api/security-static.test.ts`).
- **Health** is public without secrets in response body.
- Unauthenticated access → **401 JSON** (middleware fix — regression covered in E2E).

---

## 2. User journey verification

| # | Journey | Automated evidence |
|---|---------|-------------------|
| 1 | Registration / login / onboarding | E2E: public auth pages; onboarding gated in app layout |
| 2 | Profile updates | API `PATCH /api/v1/profile` (auth required) |
| 3 | Dashboard statistics | `getDashboardSummary` — no mock stats in RSC |
| 4 | Workout logging & history | **Integration:** `workout-session.integration.test.ts` |
| 5 | Exercise / set management | Nested workout APIs + integration session test |
| 6 | Nutrition logging | **Integration:** `user-journey.integration.test.ts` |
| 6b | Meal planning calendar | **Integration:** `meal-plan.integration.test.ts`; E2E API in `authenticated/journeys.spec.ts` |
| 7 | Weight / body fat / measurements | Progress hub + weight isolation test |
| 8 | Steps / sleep / water | Progress API + hub UI |
| 9 | Progress photos | ImageKit upload route + hub |
| 10 | PRs & goals | PR recompute in session test; goals in journey test |
| 11 | AI workout / diet | AI validators + OpenRouter client tests |
| 12 | AI chat | `POST /api/v1/ai/chat` + UI component |
| 13 | Saved AI plans | **Integration:** `ai-plan-isolation.integration.test.ts` |
| 14 | Settings | Settings hub + **account deletion** (`account-delete.integration.test.ts`) |

**DB integration tests** create isolated `User` rows with `clerkUserId` prefix `test-*` / `qa-*` and **clean up** after assertions (no production data destroyed).

---

## 3. Responsive UI (Playwright)

| Viewport | Pages checked | Horizontal overflow |
|----------|---------------|-------------------|
| 375px mobile | `/`, `/features`, `/sign-in` | **None** |
| 768px tablet | same | **None** |
| 1024px laptop | same | **None** |
| 1440px desktop | same | **None** |

**Layout fix:** `overflow-x-hidden` on `body`, `min-w-0` on `main` (app shell already uses `min-w-0`).

Authenticated app pages at 375px **not** covered in E2E (Clerk blocker).

---

## 4. Security audit

| Control | Status | Evidence |
|---------|--------|----------|
| API authentication | ✅ Fixed + tested | Middleware `JSON 401`; 8 E2E API tests |
| User ownership (weight) | ✅ | `isolation.integration.test.ts` |
| User ownership (AI plans) | ✅ | `ai-plan-isolation.integration.test.ts` |
| AI plan delete IDOR hardening | ✅ Fixed | `deleteMany({ id, userId })` |
| Static route auth coverage | ✅ | 45 API files audited |
| Upload limits / MIME | ✅ | `media/upload` 5MB + allowlist |
| AI PII minimization | ✅ | `ai-context.service.ts` (no full name) |
| AI rate limits | ✅ | 30 plans/hr; 40 chat turns/hr |
| Error leakage | ✅ | API uses `jsonError` shapes; health logs generic message |
| Secrets in health | ✅ | Static test: health route has no key env refs |

---

## 5. Issues found & resolved this pass

### Critical — API returned HTML 404 instead of 401
- **Symptom:** `curl /api/v1/profile` → 404 HTML when signed out.
- **Fix:** `src/middleware.ts` — API routes return `NextResponse.json` **401** before page `auth.protect()`.
- **Regression:** Playwright `public-and-security.spec.ts` (8 endpoints).

### Medium — AI plan delete used `id` only
- **Fix:** `deleteMany({ id, userId })` in `deleteGeneratedPlan`.

### Low — Horizontal scroll risk
- **Fix:** Body overflow + main `min-w-0`.

---

## 6. Automated testing summary

| Suite | Command | Result |
|-------|---------|--------|
| Lint | `npm run lint` | Pass |
| Unit + integration | `npm test` (load `.env.local`) | **36 passed**, 1 skipped (`RUN_OPENROUTER_PROBE`) |
| Security static | `npm run test:security` | 2 passed |
| Integration only | `npm run test:integration` (load `.env.local`) | **7 passed** (incl. meal-plan, account-delete) |
| TypeScript | `npx tsc --noEmit` | Pass |
| Playwright | `npm run test:e2e` | **38 passed** (webServer: `npm run dev`) |
| Production build | `npx next build` | Pass |

### Skipped / manual

| Test | Reason |
|------|--------|
| `connectivity.integration.test.ts` | Set `RUN_OPENROUTER_PROBE=1` + `.env.local` |
| `e2e/authenticated/*` | Skipped until `E2E_CLERK_USER_EMAIL` + `E2E_CLERK_USER_PASSWORD` in `.env.local` (not committed) |
| OpenRouter generation under rate limit | External quota |

### Authenticated E2E setup (local)

1. Create a **dedicated** Clerk user (password strategy) in your dev instance.
2. Add to `.env.local` (never commit):
   - `E2E_CLERK_USER_EMAIL=...`
   - `E2E_CLERK_USER_PASSWORD=...`
3. Run `npm run test:e2e` — runs `e2e/auth.setup.ts` → saves `e2e/.auth/user.json` (gitignored).
4. Optional disposable deletion E2E: `E2E_CLERK_DISPOSABLE_*` → `e2e/authenticated/account-delete.spec.ts` (never use the primary E2E user).
5. Integration tests use synthetic `qa-*` / `test-*` Clerk IDs (no Clerk API delete).

---

## 7. Known gaps (genuine blockers)

1. **E2E credentials not in repo** — Add `E2E_CLERK_*` locally to execute authenticated Playwright (harness is implemented).
2. **OpenRouter free tier** — May 429; fallback configured; not a code defect.
3. **Clerk delete in integration tests** — Skipped for `qa-*` / `test-*` clerk IDs (DB-only delete).

---

## 8. Recommended pre-deploy checklist

1. Run `DATABASE_URL=... npm run test:integration`
2. Run `npm run test:e2e` with dev server
3. Manual smoke: sign in → onboarding → log weight + meal + workout → AI generate → view plan
4. Optional: `RUN_OPENROUTER_PROBE=1 npm test -- connectivity.integration`

---

## 9. Files added / changed in QA pass

- `src/middleware.ts` — API 401 JSON
- `src/services/ai.service.ts` — delete hardening
- `src/app/layout.tsx` — overflow
- `tests/api/security-static.test.ts`
- `tests/services/ai-plan-isolation.integration.test.ts`
- `tests/services/user-journey.integration.test.ts`
- `e2e/public-and-security.spec.ts`
- `e2e/responsive.spec.ts`
- `playwright.config.ts` — webServer + conditional auth projects
- `e2e/global-setup.ts`, `e2e/auth.setup.ts`, `e2e/authenticated/*` — Clerk Playwright harness
- `prisma/migrations/20251126180000_meal_planning` — `PlannedMeal` calendar
- `src/services/account.service.ts`, `src/components/delete-account-card.tsx` — self-serve deletion
- `src/app/privacy/page.tsx` — deletion + retention policy aligned with product