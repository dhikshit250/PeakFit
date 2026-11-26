# PeakFit V2 — Technology Stack

**Status:** Approved for implementation  
**Last updated:** 2026-11-26

---

## 1. Stack overview

| Layer | Technology | Role |
|-------|------------|------|
| Framework | **Next.js** (App Router) | UI, SSR/RSC, API |
| Language | **TypeScript** | End-to-end type safety |
| Styling | **Tailwind CSS** | Utility-first layout and theme |
| UI kit | **shadcn/ui** | Accessible components (Radix primitives) |
| Validation | **Zod** | Request/query/body schemas |
| Database | **PostgreSQL** | Primary data store |
| ORM | **Prisma** | Schema, migrations, queries |
| Auth | **Clerk** | Identity, sessions, social login |
| AI | **OpenRouter** | Workout/diet generation (server-only) |
| Media | **ImageKit** | Profile and progress photos |
| Charts | **Recharts** or **Chart.js** (via react wrapper) | Progress visualizations |
| Testing | **Vitest** + **Playwright** (or CRA-equivalent) | Unit/API + critical E2E |
| Hosting | **Render** (single web service) | Production |

**Phase 2 (out of scope until Phase 1 stable):** Expo + React Native, same APIs and Clerk.

---

## 2. Version and compatibility policy

- Pin **major** versions in `package.json`; use `npm install` with lockfile.
- Before upgrading: check Next.js + React + Clerk + Prisma compatibility matrix.
- Prefer **current stable** (not experimental canary) unless a feature requires otherwise.
- Run `prisma migrate` in CI/deploy pipeline review before production.

**Installed baseline (Milestone 2 — `web/package.json`):**

- Next.js **16.4.6**
- React **19.3.0**
- Tailwind CSS **4.3.3** + shadcn **4.23.1**
- Prisma **6.19.0** (client + CLI; pinned stable, not 8 RC)
- `@clerk/nextjs` **7.x**
- Vitest **2.1.9**
- Node.js **20 LTS** on Render (recommended)

---

## 3. Repository layout

```
peakfit/
├── README.md
├── package.json      # Next.js app (repo root)
├── prisma/
├── public/
├── src/
├── tests/
├── scripts/
├── docs/
└── mobile/           # Expo (Phase 2)
```

**Rationale:** Single Next.js app at repo root. Legacy CRA + Flask exists in Git history only (pre–V2 commits).

---

## 4. Environment variables (documented names only)

Never commit values. Use Render dashboard + local `.env.local` (gitignored).

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection (Prisma) |
| `DIRECT_URL` | Optional | Prisma direct URL for migrations (if using pooler) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk client |
| `CLERK_SECRET_KEY` | Yes | Clerk server |
| `CLERK_WEBHOOK_SECRET` | Recommended | User sync / delete webhooks |
| `OPENROUTER_API_KEY` | For AI features | Server-only AI |
| `OPENROUTER_MODEL` | For AI features | Primary model ID from OpenRouter |
| `OPENROUTER_MODEL_FALLBACK` | Optional | Fallback model ID |
| `IMAGEKIT_PUBLIC_KEY` | For media features | ImageKit server/client uploads |
| `IMAGEKIT_PRIVATE_KEY` | For media features | ImageKit server uploads |
| `IMAGEKIT_URL_ENDPOINT` | For media features | CDN base URL (`https://ik.imagekit.io/...`) |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | Optional | Expose URL endpoint to client uploads |
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical URL (Render) |
| `LEGACY_DATABASE_URL` | Migration only | Read-only old Postgres export source |

---

## 5. Explicitly excluded (V2)

- Flask, Django, separate API microservice
- Client-side AI keys
- Trainer/client roles and related schema
- Separate Render worker (unless later approved)
- Fake/demo data presented as user-generated plans

---

## 6. Legacy stack (reference only)

Historical legacy stack documented in `docs/PROJECT_AUDIT.md` (audit snapshot; not in working tree).