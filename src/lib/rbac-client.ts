"use client";

import { getRoleDefinition, hasPermission, type RecruitingPermission, type RecruitingRoleId } from "@/lib/rbac";

const STORAGE_KEY = "recruit-ai-active-role";

export function getActiveRoleId(): RecruitingRoleId {
  if (typeof window === "undefined") return "executive";
  return (window.localStorage.getItem(STORAGE_KEY) as RecruitingRoleId | null) ?? "executive";
}

export function setActiveRoleId(roleId: RecruitingRoleId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, roleId);
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
