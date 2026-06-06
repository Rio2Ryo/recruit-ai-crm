import { timingSafeEqual } from "node:crypto";

function clean(value: string | undefined) {
  return value?.trim() ?? "";
}

function parseCodes(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getConfiguredInviteCodes() {
  const multi = clean(process.env.RECRUIT_ADMIN_INVITE_CODES);
  const single = clean(process.env.RECRUIT_ADMIN_INVITE_CODE) || clean(process.env.RECRUIT_INVITE_CODE);
  const codes = multi ? parseCodes(multi) : single ? [single] : [];
  return Array.from(new Set(codes));
}

export function hasInviteCodeConfigured() {
  return getConfiguredInviteCodes().length > 0;
}

function safeEquals(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function isValidInviteCode(input: string) {
  const code = input.trim();
  if (!code) return false;
  return getConfiguredInviteCodes().some((candidate) => safeEquals(candidate, code));
}
