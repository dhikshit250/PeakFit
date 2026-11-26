# Domain services (PeakFit V2)

Business logic lives here — **not** in route handlers or React components.

Planned modules (Milestone 3+):

- `profile.service.ts` — profile upsert, Clerk user sync
- `workout.service.ts` — preferences, sessions, sets, PRs
- `diet.service.ts` — preferences, calorie entries
- `ai.service.ts` — prompts, OpenRouter orchestration, plan persistence
- `progress/` — metrics, aggregates, chart buckets
- `goals.service.ts` — goal progress calculations
- `media.service.ts` — Cloudinary uploads

Route handlers in `src/app/api/v1/**` should only: authenticate, validate (Zod), call services, format responses.