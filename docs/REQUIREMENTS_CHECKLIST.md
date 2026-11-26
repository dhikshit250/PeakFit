# PeakFit V2 — Requirements Checklist

**Audit date:** 2026-11-26  
Legend: ✅ Complete · 🟡 Partial · ❌ Missing · 🔧 Broken

## Authentication & account

| Requirement | Status | Workflow verified |
|-------------|--------|-------------------|
| Clerk sign-in/up | ✅ | UI loads; middleware protects app routes |
| Google / phone OTP | 🟡 | Google button in Clerk UI; phone depends on Clerk dashboard |
| Prisma user sync on first request | ✅ | `ensureUserByClerkId` on API/RSC |
| Settings & profile | 🟡 | Profile edit works; account delete not implemented |

## Onboarding & profile

| Requirement | Status | Workflow verified |
|-------------|--------|-------------------|
| Onboarding gate to dashboard | ✅ | Redirect when profile incomplete |
| Profile CRUD | ✅ | PATCH `/api/v1/profile` + UI |
| Workout preferences | ✅ | PUT + preferences page |
| Diet preferences + Indian cuisine | ✅ | `preferIndianCuisine` + UI |
| Timezone / units | ✅ | PATCH `/api/v1/profile/preferences` |

## Dashboard

| Requirement | Status | Workflow verified |
|-------------|--------|-------------------|
| Real DB statistics | ✅ | `getDashboardSummary` — no hardcoded stats |
| Charts | 🟡 | Weight 30d bar chart; other metrics API-only |

## Workouts

| Requirement | Status | Workflow verified |
|-------------|--------|-------------------|
| Exercise library | ✅ | Static library + GET API |
| Session create with sets | ✅ | POST session |
| Session list/detail/delete | ✅ | GET/PATCH/DELETE |
| Nested exercise/set APIs | 🟡→✅ | Being added this audit |
| Personal records | ✅ | Recompute on logged sets |
| Workout history UI | 🟡 | List on `/workouts`; session detail page partial |

## Nutrition

| Requirement | Status | Workflow verified |
|-------------|--------|-------------------|
| Meal logging + macros | ✅ | Calorie INTAKE with protein/carbs/fat |
| Expenditure logging | 🟡→✅ | API supports EXPENDITURE; UI being added |
| Indian diet in AI | ✅ | Context flag when preference set |
| Nutrition summary | ✅ | GET `/api/v1/nutrition/summary` |
| Saved AI meal plans | 🟡→✅ | `GeneratedPlan` list API + Today UI |

## Progress (12 categories)

| # | Category | API | UI edit/delete | Notes |
|---|----------|-----|----------------|-------|
| 1 | Weight | ✅ | 🟡→✅ | |
| 2 | Body fat | ✅ | 🟡→✅ | |
| 3 | Measurements | ✅ | 🟡→✅ | |
| 4 | Photos | ✅ | 🟡→✅ | ImageKit upload UI |
| 5 | Water | ✅ | 🟡→✅ | |
| 6 | Sleep | ✅ | 🟡→✅ | |
| 7 | Steps | ✅ | 🟡 | Upsert by date; PATCH added |
| 8 | Workouts/sessions | ✅ | 🟡 | `/workouts` |
| 9 | Personal records | ✅ | 🟡 | List on workouts page |
| 10 | Nutrition/calories | ✅ | 🟡 | `/diet` |
| 11 | Goals | ✅ | 🟡→✅ | Delete on goals UI |
| 12 | AI generated plans | 🟡→✅ | Stored + listable |

## AI (OpenRouter)

| Requirement | Status | Workflow verified |
|-------------|--------|-------------------|
| Workout plan generation | 🟡 | Works when `OPENROUTER_MODEL` set |
| Diet plan generation | 🟡 | Same |
| Daily combined plan | 🟡 | Same |
| Rate limiting | ✅ | 30/hour per user via DB count |
| Fitness assistant page | 🟡 | Same endpoints as Today |

## Media

| Requirement | Status | Workflow verified |
|-------------|--------|-------------------|
| ImageKit server upload | ✅ | POST `/api/v1/media/upload` |
| Client upload auth | ✅ | POST `/api/v1/media/sign` |
| Progress photo workflow | 🟡→✅ | Upload → create photo record |

## Production

| Requirement | Status |
|-------------|--------|
| Render blueprint | ✅ `render.yaml` |
| Migrations on Aiven | ✅ 2 applied |
| E2E Playwright | 🟡→✅ | Smoke tests (public routes) |
| API integration tests | 🟡→✅ | Service + isolation tests |