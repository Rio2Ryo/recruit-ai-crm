-- Additive LINE recruiting persistence foundation. Apply to production only after approval and backup confirmation.
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
