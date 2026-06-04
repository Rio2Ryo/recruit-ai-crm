-- Additive RBAC/scheduling foundation. Apply to production only after approval and backup confirmation.
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
