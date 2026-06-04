import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";

const scheduleSql = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
ALTER TABLE "CompanyMember"
  ADD COLUMN IF NOT EXISTS "permissionRole" TEXT;
CREATE TABLE IF NOT EXISTS "ScheduleEventRecord" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "location" TEXT,
  "onlineUrl" TEXT,
  "ownerName" TEXT,
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "deadlineAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "ScheduleSlotRecord" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "eventId" UUID NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "capacity" INTEGER NOT NULL DEFAULT 1,
  "bookedCount" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'open',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ScheduleSlotRecord_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "ScheduleEventRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "ScheduleBookingRecord" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "slotId" UUID NOT NULL,
  "applicantId" TEXT,
  "lineUserId" TEXT,
  "applicantName" TEXT,
  "status" TEXT NOT NULL DEFAULT 'booked',
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ScheduleBookingRecord_slotId_fkey"
    FOREIGN KEY ("slotId") REFERENCES "ScheduleSlotRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "ScheduleEventRecord_type_idx" ON "ScheduleEventRecord"("type");
CREATE INDEX IF NOT EXISTS "ScheduleEventRecord_isPublic_idx" ON "ScheduleEventRecord"("isPublic");
CREATE INDEX IF NOT EXISTS "ScheduleEventRecord_deadlineAt_idx" ON "ScheduleEventRecord"("deadlineAt");
CREATE INDEX IF NOT EXISTS "ScheduleSlotRecord_eventId_idx" ON "ScheduleSlotRecord"("eventId");
CREATE INDEX IF NOT EXISTS "ScheduleSlotRecord_startsAt_idx" ON "ScheduleSlotRecord"("startsAt");
CREATE INDEX IF NOT EXISTS "ScheduleSlotRecord_status_idx" ON "ScheduleSlotRecord"("status");
CREATE INDEX IF NOT EXISTS "ScheduleBookingRecord_slotId_idx" ON "ScheduleBookingRecord"("slotId");
CREATE INDEX IF NOT EXISTS "ScheduleBookingRecord_applicantId_idx" ON "ScheduleBookingRecord"("applicantId");
CREATE INDEX IF NOT EXISTS "ScheduleBookingRecord_lineUserId_idx" ON "ScheduleBookingRecord"("lineUserId");
CREATE INDEX IF NOT EXISTS "ScheduleBookingRecord_status_idx" ON "ScheduleBookingRecord"("status");
`;

const lineSql = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TABLE IF NOT EXISTS "LineIntegrationSettings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" UUID NOT NULL UNIQUE,
  "officialAccountName" TEXT NOT NULL DEFAULT '採用窓口',
  "officialAccountManagerUrl" TEXT NOT NULL DEFAULT 'https://manager.line.biz/',
  "addFriendUrl" TEXT,
  "richMenuApplyUrl" TEXT,
  "harnessDashboardUrl" TEXT,
  "harnessFormUrl" TEXT,
  "defaultApplyMessage" TEXT NOT NULL,
  "testFriendId" TEXT,
  "stageTagMapJson" TEXT,
  "messageTemplatesJson" TEXT,
  "scheduledMessageRulesJson" TEXT,
  "automationRulesJson" TEXT,
  "richMenuPlanJson" TEXT,
  "broadcastDraftsJson" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LineIntegrationSettings_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "ScheduledLineMessageRecord" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "applicantId" TEXT,
  "lineUserId" TEXT NOT NULL,
  "friendId" TEXT,
  "title" TEXT NOT NULL,
  "ruleId" TEXT,
  "stage" TEXT,
  "templateId" TEXT,
  "text" TEXT,
  "scheduledFor" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sentAt" TIMESTAMP(3),
  "error" TEXT
);
CREATE TABLE IF NOT EXISTS "LineApplicantRecord" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "lineUserId" TEXT NOT NULL,
  "friendId" TEXT,
  "name" TEXT,
  "school" TEXT,
  "department" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "jobId" TEXT,
  "jobTitle" TEXT,
  "selfPr" TEXT,
  "currentStage" TEXT NOT NULL,
  "interviewAt" TIMESTAMP(3),
  "feedback" TEXT,
  "lastMessage" TEXT,
  "payloadJson" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "LineMessageLogRecord" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "applicantId" TEXT,
  "lineUserId" TEXT NOT NULL,
  "friendId" TEXT,
  "kind" TEXT NOT NULL,
  "templateId" TEXT,
  "stage" TEXT,
  "text" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "resultJson" TEXT,
  "error" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "LineActionEventRecord" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "applicantId" TEXT,
  "lineUserId" TEXT NOT NULL,
  "friendId" TEXT,
  "type" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "detailJson" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "LineDocumentRecord" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "applicantId" TEXT,
  "lineUserId" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "fileName" TEXT,
  "mimeType" TEXT,
  "size" INTEGER,
  "storageKey" TEXT,
  "storageUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "LineIntegrationSettings_companyId_idx" ON "LineIntegrationSettings"("companyId");
CREATE INDEX IF NOT EXISTS "ScheduledLineMessageRecord_applicantId_idx" ON "ScheduledLineMessageRecord"("applicantId");
CREATE INDEX IF NOT EXISTS "ScheduledLineMessageRecord_lineUserId_idx" ON "ScheduledLineMessageRecord"("lineUserId");
CREATE INDEX IF NOT EXISTS "ScheduledLineMessageRecord_status_idx" ON "ScheduledLineMessageRecord"("status");
CREATE INDEX IF NOT EXISTS "ScheduledLineMessageRecord_scheduledFor_idx" ON "ScheduledLineMessageRecord"("scheduledFor");
CREATE INDEX IF NOT EXISTS "LineApplicantRecord_lineUserId_idx" ON "LineApplicantRecord"("lineUserId");
CREATE INDEX IF NOT EXISTS "LineApplicantRecord_friendId_idx" ON "LineApplicantRecord"("friendId");
CREATE INDEX IF NOT EXISTS "LineApplicantRecord_currentStage_idx" ON "LineApplicantRecord"("currentStage");
CREATE INDEX IF NOT EXISTS "LineMessageLogRecord_applicantId_idx" ON "LineMessageLogRecord"("applicantId");
CREATE INDEX IF NOT EXISTS "LineMessageLogRecord_lineUserId_idx" ON "LineMessageLogRecord"("lineUserId");
CREATE INDEX IF NOT EXISTS "LineMessageLogRecord_kind_idx" ON "LineMessageLogRecord"("kind");
CREATE INDEX IF NOT EXISTS "LineActionEventRecord_applicantId_idx" ON "LineActionEventRecord"("applicantId");
CREATE INDEX IF NOT EXISTS "LineActionEventRecord_lineUserId_idx" ON "LineActionEventRecord"("lineUserId");
CREATE INDEX IF NOT EXISTS "LineActionEventRecord_type_idx" ON "LineActionEventRecord"("type");
CREATE INDEX IF NOT EXISTS "LineDocumentRecord_applicantId_idx" ON "LineDocumentRecord"("applicantId");
CREATE INDEX IF NOT EXISTS "LineDocumentRecord_lineUserId_idx" ON "LineDocumentRecord"("lineUserId");
CREATE INDEX IF NOT EXISTS "LineDocumentRecord_messageId_idx" ON "LineDocumentRecord"("messageId");
`;

const targetTables = [
  "ScheduleEventRecord",
  "ScheduleSlotRecord",
  "ScheduleBookingRecord",
  "LineIntegrationSettings",
  "ScheduledLineMessageRecord",
  "LineApplicantRecord",
  "LineMessageLogRecord",
  "LineActionEventRecord",
  "LineDocumentRecord",
];

function assertAuthorized(request: NextRequest) {
  const expected = process.env.MIGRATION_ADMIN_KEY;
  const actual = request.headers.get("x-admin-key");
  return Boolean(expected && actual && expected === actual);
}

async function withClient<T>(fn: (client: Client) => Promise<T>) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is missing");
  const client = new Client({ connectionString, ssl: connectionString.includes("sslmode=") ? undefined : { rejectUnauthorized: false } });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

async function status(client: Client) {
  const counts = await client.query(`
    SELECT 'Company' AS name, COUNT(*)::int AS count FROM "Company"
    UNION ALL SELECT 'CompanyMember', COUNT(*)::int FROM "CompanyMember"
    UNION ALL SELECT 'Student', COUNT(*)::int FROM "Student"
    UNION ALL SELECT 'Resume', COUNT(*)::int FROM "Resume"
  `);
  const tables = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name = ANY($1) ORDER BY table_name`,
    [targetTables]
  );
  const permissionRole = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='CompanyMember' AND column_name='permissionRole'`);
  return {
    counts: Object.fromEntries(counts.rows.map((row) => [row.name, row.count])),
    permissionRole: (permissionRole.rowCount ?? 0) > 0,
    tables: tables.rows.map((row) => row.table_name),
  };
}

export async function GET(request: NextRequest) {
  if (!assertAuthorized(request)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  const result = await withClient(status);
  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: NextRequest) {
  if (!assertAuthorized(request)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  const result = await withClient(async (client) => {
    const before = await status(client);
    await client.query("BEGIN");
    try {
      await client.query(scheduleSql);
      await client.query(lineSql);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
    const after = await status(client);
    return { before, after };
  });
  return NextResponse.json({ ok: true, ...result });
}
