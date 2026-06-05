"use client";

import { getRoleDefinition, hasPermission, type RecruitingPermission, type RecruitingRoleId } from "@/lib/rbac";

const STORAGE_KEY = "recruit-ai-active-role";
const ACTIVE_MEMBER_EMAIL_KEY = "recruit-ai-active-member-email";

export function getActiveRoleId(): RecruitingRoleId {
  if (typeof window === "undefined") return "executive";
  return (window.localStorage.getItem(STORAGE_KEY) as RecruitingRoleId | null) ?? "executive";
}

export function setActiveRoleId(roleId: RecruitingRoleId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, roleId);
}

export function getActiveMemberEmail() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(ACTIVE_MEMBER_EMAIL_KEY) ?? "";
}

export function setActiveMemberEmail(email: string) {
  if (typeof window === "undefined") return;
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail) window.localStorage.setItem(ACTIVE_MEMBER_EMAIL_KEY, normalizedEmail);
  else window.localStorage.removeItem(ACTIVE_MEMBER_EMAIL_KEY);
}

export function applyMemberRole(email: string, roleId: RecruitingRoleId) {
  setActiveMemberEmail(email);
  setActiveRoleId(roleId);
}

export function getActiveRoleDefinition() {
  return getRoleDefinition(getActiveRoleId());
}

export function activeRoleHasPermission(permission: RecruitingPermission) {
  return hasPermission(getActiveRoleId(), permission);
}

export function roleHas(permission: RecruitingPermission, roleId = getActiveRoleId()) {
  return hasPermission(roleId, permission);
}

export function fetchWithRole(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("x-rbac-role", getActiveRoleId());
  return fetch(input, { ...init, headers });
}
