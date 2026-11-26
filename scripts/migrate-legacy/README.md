# Legacy data migration

Migrates rows from the **old** PeakFit PostgreSQL into V2 (Prisma + Clerk).

The CRA + Flask source tree is **not** in this branch; use Git history (`git show main:backend/...`, `git checkout main --` paths for read-only scripts) when you need legacy SQL or field reference.

## Rules

- `LEGACY_DATABASE_URL` — read-only connection to old DB only.
- No destructive operations on the legacy database.
- See [`docs/IMPLEMENTATION_PLAN.md`](../../docs/IMPLEMENTATION_PLAN.md) for Clerk identity mapping.

## Status

Not implemented — Milestone 3+.