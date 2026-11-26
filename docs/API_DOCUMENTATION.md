# PeakFit V2 — API Documentation (Planned)

**Base URL:** `https://<render-service>/api/v1`  
**Auth:** Clerk session (web cookies) or `Authorization: Bearer <token>` (mobile, Phase 2)  
**Content-Type:** `application/json` unless noted  
**Last updated:** 2026-11-26 (design — not implemented)

---

## 1. Conventions

### Success response

```json
{
  "data": { },
  "meta": { "page": 1, "pageSize": 20, "total": 100 }
}
```

### Error response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": []
  }
}
```

### HTTP status codes

| Code | Use |
|------|-----|
| 200 | OK |
| 201 | Created |
| 204 | Deleted |
| 400 | Validation failed |
| 401 | Unauthenticated |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict |
| 429 | Rate limited |
| 500 | Server error |

---

## 2. Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Liveness; **200** when Clerk + DB OK, **503** when either is missing or DB unreachable |

**Response `data.checks` (no secrets):** `database`, `clerk`, `openRouter` (`keyPresent`, `modelConfigured`), `imageKit`. Overall `status` is `degraded` only when Clerk is unset or the database is not connected—optional integrations do not force degraded.

---

## 3. User profile

| Method | Path | Description |
|--------|------|-------------|
| GET | `/profile` | Get profile + preferences snapshot |
| PATCH | `/profile` | Update profile fields (Zod) |
| PATCH | `/profile/preferences` | Timezone, unit system |

---

## 4. Workout preferences

| Method | Path | Description |
|--------|------|-------------|
| GET | `/workouts/preferences` | Get workout preferences |
| PUT | `/workouts/preferences` | Upsert preferences |

**Body (PUT):** `workoutDays`, `restDays`, `intensity`, `durationMinutes`, `workoutType`, `muscleGroups`, `exercises`, `calorieBurnGoal`, `equipment`, flags (`remindersEnabled`, `progressiveOverload`, `warmUpCoolDown`).

---

## 5. Workout sessions & logging

| Method | Path | Description |
|--------|------|-------------|
| GET | `/workouts/sessions` | List sessions (paginated, date range query) |
| POST | `/workouts/sessions` | Create session with nested exercises/sets |
| GET | `/workouts/sessions/:id` | Detail |
| PATCH | `/workouts/sessions/:id` | Update session metadata |
| DELETE | `/workouts/sessions/:id` | Delete session (cascade sets) |
| POST | `/workouts/sessions/:id/exercises` | Add exercise log |
| PATCH | `/workouts/exercises/:id` | Update exercise log |
| DELETE | `/workouts/exercises/:id` | Remove exercise |
| POST | `/workouts/exercises/:id/sets` | Add set |
| PATCH | `/workouts/sets/:id` | Update set |
| DELETE | `/workouts/sets/:id` | Delete set |

---

## 6. Personal records

| Method | Path | Description |
|--------|------|-------------|
| GET | `/workouts/prs` | List PRs |
| GET | `/workouts/prs/history` | PR change history |
| POST | `/workouts/prs/recalculate` | Optional admin/self recalc from logs |

---

## 7. Diet preferences

| Method | Path | Description |
|--------|------|-------------|
| GET | `/diet/preferences` | Get diet preferences |
| PUT | `/diet/preferences` | Upsert |

---

## 8. Nutrition tracking

| Method | Path | Description |
|--------|------|-------------|
| GET | `/nutrition/calories` | List entries (`from`, `to`, `type`) |
| POST | `/nutrition/calories` | Add intake or expenditure |
| PATCH | `/nutrition/calories/:id` | Edit entry |
| DELETE | `/nutrition/calories/:id` | Delete entry |
| GET | `/nutrition/summary` | Daily/weekly aggregates |

---

## 9. AI generation

| Method | Path | Description |
|--------|------|-------------|
| POST | `/ai/workout-plan` | Generate workout (structured JSON) |
| POST | `/ai/diet-plan` | Generate diet/meals |
| POST | `/ai/daily-plan` | Combined daily plan (replaces legacy GET `/api/generate/plan`) |

**Rate limit:** 429 after threshold (per user / hour — exact limit in env).

**Request:** Uses current preferences + profile from DB; optional `dayIndex` for multi-day future.

**Response:** Parsed Zod-validated plan; `meta.model`, `meta.generatedAt`.

---

## 10. Progress — body composition

| Method | Path | Description |
|--------|------|-------------|
| GET | `/progress/weight` | History + chart buckets |
| POST | `/progress/weight` | Add entry |
| PATCH | `/progress/weight/:id` | Edit |
| DELETE | `/progress/weight/:id` | Delete |
| GET | `/progress/body-fat` | Same pattern |
| POST/PATCH/DELETE | `/progress/body-fat/...` | |

---

## 11. Progress — measurements

| Method | Path | Description |
|--------|------|-------------|
| GET | `/progress/measurements` | |
| POST | `/progress/measurements` | chest, waist, arm, thigh |
| PATCH/DELETE | `/progress/measurements/:id` | |

---

## 12. Progress — activity, hydration, recovery

| Method | Path | Description |
|--------|------|-------------|
| GET/POST/PATCH/DELETE | `/progress/steps` | Daily steps (`date` + `steps`) |
| GET/POST/PATCH/DELETE | `/progress/water` | |
| GET/POST/PATCH/DELETE | `/progress/sleep` | |

---

## 13. Progress — photos

| Method | Path | Description |
|--------|------|-------------|
| GET | `/progress/photos` | List |
| POST | `/progress/photos` | Create after upload (url + takenAt) |
| DELETE | `/progress/photos/:id` | Remove record (+ optional ImageKit delete) |

---

## 14. Goals

| Method | Path | Description |
|--------|------|-------------|
| GET | `/goals` | List goals |
| POST | `/goals` | Create |
| PATCH | `/goals/:id` | Update target/status |
| DELETE | `/goals/:id` | Remove |
| GET | `/goals/:id/progress` | Computed progress % |

---

## 15. Progress dashboard aggregates

| Method | Path | Description |
|--------|------|-------------|
| GET | `/progress/dashboard` | Summary cards for daily fitness view |
| GET | `/progress/charts/:metric` | Query `range=7d|30d|90d|1y` |

---

## 16. Media

| Method | Path | Description |
|--------|------|-------------|
| POST | `/media/upload` | Multipart or signed upload params |
| POST | `/media/sign` | Optional: return ImageKit authentication params for direct upload |

All routes require auth.

---

## 17. Account lifecycle (Clerk integration)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/webhooks/clerk` | Clerk events (user.deleted → cascade) |
| DELETE | `/account` | Initiate data purge (coordinates with Clerk) |

---

## 18. Legacy → V2 endpoint mapping

| Legacy (Flask) | V2 |
|----------------|-----|
| POST `/api/auth/*` | Clerk hosted UI + webhooks |
| GET/POST `/api/profile/*` | `/profile` |
| GET/POST `/api/workout/workout_plans` | `/workouts/preferences` + sessions API |
| POST `/api/diet/diet-plan` | PUT `/diet/preferences` |
| GET `/api/generate/plan` | POST `/ai/daily-plan` |
| POST `/api/upload/upload` | `/media/upload` |
| DELETE `/api/user/delete_account` | Clerk + `/account` + webhook |

---

## 19. Pagination query params

- `page` (default 1), `pageSize` (default 20, max 100)
- `from`, `to` ISO8601 for time-series endpoints

---

## 20. Implementation note

This document is the **contract** for Phase 2 mobile. Update when handlers ship; add OpenAPI export optional in Milestone 6.