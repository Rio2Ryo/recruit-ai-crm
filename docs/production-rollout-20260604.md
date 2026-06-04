# Production rollout plan — 2026-06-04

Scope:
- Recruiting scheduling system
- RBAC/role permission matrix
- LINE recruiting persistence, documents, messaging workflow, settings console

## Current repo state

Latest pushed commit:
- `dd2dcae chore: add line persistence migration readiness`

Pushed feature commits include:
- `a2a1a5d` recruiting scheduling and role permissions
- `d13dddf` Prisma schema for scheduling permissions
- `a346628` Prisma foundation for LINE persistence
- `6fbb46d` LINE recruiting operations APIs
- `d5fb192` LINE applicant document persistence
- `db2b314` LINE scheduled messaging workflow
- `7a75705` LINE harness settings console
- `b6feb15` LINE application intake workflow
- `5cf8edb` LINE harness preview readiness docs
- `dd2dcae` LINE persistence migration readiness

Not included / intentionally held back:
- Demo-data removal / zero-state style dashboard changes
- Vercel env write API changes
- Vercel cron activation (`vercel.json`)
- Experimental/unreferenced Harness UI/API
- Old migration directories from stash

Safety stash retained locally:
- `stash@{0}: pre-push safety stash: excluded risky line harness and demo diffs 2026-06-04`

## Migration files to apply

Apply in this order:

1. `prisma/migrations/20260604120000_schedule_rbac_foundation/migration.sql`
   - Adds `CompanyMember.permissionRole`
   - Creates:
     - `ScheduleEventRecord`
     - `ScheduleSlotRecord`
     - `ScheduleBookingRecord`

2. `prisma/migrations/20260604124500_line_recruiting_persistence/migration.sql`
   - Creates:
     - `LineIntegrationSettings`
     - `ScheduledLineMessageRecord`
     - `LineApplicantRecord`
     - `LineMessageLogRecord`
     - `LineActionEventRecord`
     - `LineDocumentRecord`

Both migration files are additive and use `IF NOT EXISTS` where practical.

## Pre-migration checks

Run before touching production DB:

```sql
-- 1. Confirm current important table counts
SELECT 'CompanyMember' AS table_name, COUNT(*) FROM "CompanyMember"
UNION ALL SELECT 'Company', COUNT(*) FROM "Company"
UNION ALL SELECT 'Student', COUNT(*) FROM "Student"
UNION ALL SELECT 'Resume', COUNT(*) FROM "Resume";

-- 2. Confirm target columns/tables do not already conflict
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'CompanyMember'
  AND column_name = 'permissionRole';

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'ScheduleEventRecord',
    'ScheduleSlotRecord',
    'ScheduleBookingRecord',
    'LineIntegrationSettings',
    'ScheduledLineMessageRecord',
    'LineApplicantRecord',
    'LineMessageLogRecord',
    'LineActionEventRecord',
    'LineDocumentRecord'
  )
ORDER BY table_name;

-- 3. Confirm gen_random_uuid availability
SELECT gen_random_uuid();
```

Expected before migration:
- Existing table counts are non-zero/unchanged from prior known state.
- `CompanyMember.permissionRole` may be absent or already present.
- New schedule/LINE tables may be absent or already present.
- `gen_random_uuid()` works. If not, check `pgcrypto` extension permissions.

## Migration execution options

Preferred manual SQL path:

1. Confirm DB backup / restore point.
2. Run migration SQL #1 in Supabase SQL editor or `psql`.
3. Re-run pre-check counts and target table checks.
4. Run migration SQL #2.
5. Re-run post-checks below.

CLI path if production `DATABASE_URL` is available:

```bash
psql "$DATABASE_URL" -f prisma/migrations/20260604120000_schedule_rbac_foundation/migration.sql
psql "$DATABASE_URL" -f prisma/migrations/20260604124500_line_recruiting_persistence/migration.sql
```

Do not run `prisma migrate deploy` until migration history and pre-existing DB state are confirmed, because this project has had manual/temporary migration work previously.

## Post-migration checks

```sql
-- Existing data retained
SELECT 'CompanyMember' AS table_name, COUNT(*) FROM "CompanyMember"
UNION ALL SELECT 'Company', COUNT(*) FROM "Company"
UNION ALL SELECT 'Student', COUNT(*) FROM "Student"
UNION ALL SELECT 'Resume', COUNT(*) FROM "Resume";

-- New column/tables exist
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'CompanyMember'
  AND column_name = 'permissionRole';

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'ScheduleEventRecord',
    'ScheduleSlotRecord',
    'ScheduleBookingRecord',
    'LineIntegrationSettings',
    'ScheduledLineMessageRecord',
    'LineApplicantRecord',
    'LineMessageLogRecord',
    'LineActionEventRecord',
    'LineDocumentRecord'
  )
ORDER BY table_name;
```

## Deploy sequence

After DB migration is confirmed:

1. Trigger/confirm Vercel production deploy for latest `main` (`dd2dcae` or later).
2. Confirm endpoints:
   - `/dashboard` → 200
   - `/members` → 200
   - `/schedules` → 200
   - `/settings/line` → 200
   - `/api/rbac/roles` → 200
   - `/api/schedules/events` → 200
   - `/api/line/applicants` → 200
3. Confirm existing applicant/document counts are unchanged.
4. Create a test schedule event/slot in non-destructive mode if appropriate.

## Rollback notes

Code rollback:
- Revert Vercel deployment to previous stable deployment if runtime issues occur.

DB rollback:
- Migrations are additive. Prefer leaving new empty tables/columns in place during emergency rollback.
- Do not drop tables/columns unless a backup is confirmed and Ryo/Yamazaki explicitly approves.

## Local pre-check results

Completed locally before production migration:
- `npx prisma validate`: pass after `dd2dcae`
- `npx tsc --noEmit`: pass
- `npm run lint`: pass
- `npm run build`: pass

Production DB credentials were not available in the local OpenClaw environment at this checkpoint, so live DB pre-check SQL has not been executed yet.
