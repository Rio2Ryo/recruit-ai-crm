# Preview readiness notes

## LINE settings persistence

Current safe choice: Prisma/PostgreSQL.

The repository already has `prisma/schema.prisma` with a PostgreSQL datasource and company-owned recruiting models. Supabase helpers exist, but they are currently auth/client wrappers only; the app does not have a Supabase table access layer for operational settings. `src/lib/prisma.ts` is still a placeholder, so enabling live DB writes now would risk breaking Preview without `DATABASE_URL`/`DIRECT_URL`.

Implemented minimum DB design:

- `LineIntegrationSettings`
- one row per `Company`
- non-secret operational settings only
- secret values stay in Vercel env

Preview behavior:

- `/settings/line` saves non-secret LINE/Harness settings to server-memory fallback.
- The UI explicitly labels this as Preview-only.
- The migration path is to wire Prisma client, run migration, then switch `src/lib/line-settings-store.ts` from memory fallback to Prisma reads/writes.

## Harness env requirements

Required for useful Harness operation:

- `NEXT_PUBLIC_APP_URL`
- `LINE_HARNESS_API_URL`
- `LINE_HARNESS_API_KEY`
- `LINE_HARNESS_WEBHOOK_SECRET`

Optional:

- `LINE_HARNESS_APPLIED_TAG_ID`
- `LINE_HARNESS_TIMEOUT_MS`

Legacy/direct LINE fallback envs still exist, but the recommended Preview path is Harness:

- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_CHANNEL_SECRET`

Admin/write/test envs:

- `LINE_SETTINGS_ADMIN_KEY` or `LINE_CLI_ADMIN_KEY`
- `VERCEL_API_TOKEN` or `VERCEL_TOKEN`
- `VERCEL_PROJECT_ID`
- `VERCEL_TEAM_ID` or `VERCEL_ORG_ID`

## DEPLOY_BLOCKERS

- Vercel token is currently unavailable/invalid for Preview deploy from this session.
- Required Vercel deploy capability:
  - valid `VERCEL_TOKEN` or logged-in Vercel CLI session
  - access to the target Vercel project
  - project id/team id if using REST/env write APIs
- Required runtime env for LINE Harness Preview:
  - `NEXT_PUBLIC_APP_URL`
  - `LINE_HARNESS_API_URL`
  - `LINE_HARNESS_API_KEY`
  - `LINE_HARNESS_WEBHOOK_SECRET`
- Required DB env before enabling Prisma persistence:
  - `DATABASE_URL`
  - `DIRECT_URL`
- Production/Preview deploy, external LINE sends, and deletion remain blocked until explicitly approved.

## Diff grouping for handoff

LINE settings/admin:

- `src/app/(dashboard)/settings/line/page.tsx`
- `src/app/api/settings/line/config/route.ts`
- `src/app/api/settings/line/env/route.ts`
- `src/app/api/settings/line/status/route.ts`
- `src/app/api/settings/line/test/route.ts`
- `src/components/settings/line-harness-settings-console.tsx`
- `src/components/settings/line-settings-console.tsx`
- `src/components/settings/line-env-status.tsx`
- `src/components/settings/line-health-check.tsx`
- `src/lib/line-settings-store.ts`
- `prisma/schema.prisma`

LINE workflow:

- `src/app/api/integrations/line-harness/submission/route.ts`
- `src/app/api/line/applicants/route.ts`
- `src/app/api/line/applicants/[id]/route.ts`
- `src/app/api/line/applicants/[id]/message/route.ts`
- `src/app/api/line/apply/route.ts`
- `src/app/api/line/webhook/route.ts`
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/students/page.tsx`
- `src/app/(dashboard)/resumes/page.tsx`
- `src/components/line/line-candidate-actions.tsx`
- `src/lib/line-applicant-store.ts`
- `src/lib/line-recruiting.ts`

Shared/navigation:

- `src/components/layout/sidebar.tsx`
- `src/middleware.ts`
