import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getRoleDefinition, type RecruitingRoleId } from "@/lib/rbac";

export type RecruitingMemberRole = {
  id: string;
  name: string | null;
  email: string;
  roleId: RecruitingRoleId;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type MemberRow = {
  id: string;
  name: string | null;
  email: string;
  roleId: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeRoleId(roleId: string | null | undefined): RecruitingRoleId {
  return getRoleDefinition(roleId).id;
}

function toMember(row: MemberRow): RecruitingMemberRole {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    roleId: normalizeRoleId(row.roleId),
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function ensureRecruitingMemberRoleTable() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "RecruitingMemberRole" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT,
      "email" TEXT NOT NULL UNIQUE,
      "roleId" TEXT NOT NULL DEFAULT 'interviewer',
      "active" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS "RecruitingMemberRole_roleId_idx"
    ON "RecruitingMemberRole"("roleId")
  `;
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS "RecruitingMemberRole_active_idx"
    ON "RecruitingMemberRole"("active")
  `;
}

export async function listRecruitingMemberRoles() {
  await ensureRecruitingMemberRoleTable();
  const rows = await prisma.$queryRaw<MemberRow[]>`
    SELECT "id", "name", "email", "roleId", "active", "createdAt", "updatedAt"
    FROM "RecruitingMemberRole"
    ORDER BY "updatedAt" DESC, "createdAt" DESC
  `;
  return rows.map(toMember);
}

export async function getRecruitingMemberRoleByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;
  await ensureRecruitingMemberRoleTable();
  const rows = await prisma.$queryRaw<MemberRow[]>`
    SELECT "id", "name", "email", "roleId", "active", "createdAt", "updatedAt"
    FROM "RecruitingMemberRole"
    WHERE "email" = ${normalizedEmail}
    LIMIT 1
  `;
  return rows[0] ? toMember(rows[0]) : null;
}

export async function upsertRecruitingMemberRole(input: { id?: string; name?: string | null; email: string; roleId: string; active?: boolean }) {
  const email = normalizeEmail(input.email);
  if (!email) throw new Error("email is required");
  const roleId = normalizeRoleId(input.roleId);
  const name = input.name?.trim() || null;
  const active = input.active ?? true;
  await ensureRecruitingMemberRoleTable();
  const rows = await prisma.$queryRaw<MemberRow[]>`
    INSERT INTO "RecruitingMemberRole" ("id", "name", "email", "roleId", "active", "createdAt", "updatedAt")
    VALUES (${input.id || randomUUID()}, ${name}, ${email}, ${roleId}, ${active}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT ("email") DO UPDATE SET
      "name" = EXCLUDED."name",
      "roleId" = EXCLUDED."roleId",
      "active" = EXCLUDED."active",
      "updatedAt" = CURRENT_TIMESTAMP
    RETURNING "id", "name", "email", "roleId", "active", "createdAt", "updatedAt"
  `;
  return toMember(rows[0]);
}

export async function updateRecruitingMemberRole(input: { id: string; name?: string | null; roleId?: string; active?: boolean }) {
  if (!input.id) throw new Error("id is required");
  await ensureRecruitingMemberRoleTable();

  const currentRows = await prisma.$queryRaw<MemberRow[]>`
    SELECT "id", "name", "email", "roleId", "active", "createdAt", "updatedAt"
    FROM "RecruitingMemberRole"
    WHERE "id" = ${input.id}
    LIMIT 1
  `;
  const current = currentRows[0];
  if (!current) throw new Error("member not found");

  const nextName = input.name === undefined ? current.name : input.name?.trim() || null;
  const nextRoleId = input.roleId === undefined ? normalizeRoleId(current.roleId) : normalizeRoleId(input.roleId);
  const nextActive = input.active === undefined ? current.active : input.active;

  const rows = await prisma.$queryRaw<MemberRow[]>`
    UPDATE "RecruitingMemberRole"
    SET "name" = ${nextName}, "roleId" = ${nextRoleId}, "active" = ${nextActive}, "updatedAt" = CURRENT_TIMESTAMP
    WHERE "id" = ${input.id}
    RETURNING "id", "name", "email", "roleId", "active", "createdAt", "updatedAt"
  `;
  return toMember(rows[0]);
}

export async function deleteRecruitingMemberRole(id: string) {
  if (!id) throw new Error("id is required");
  await ensureRecruitingMemberRoleTable();
  await prisma.$executeRaw`DELETE FROM "RecruitingMemberRole" WHERE "id" = ${id}`;
}
