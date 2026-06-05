"use client";

import type { RecruitingRoleId } from "@/lib/rbac";

const STORAGE_KEY = "recruit-ai-active-role";

export function getActiveRoleId(): RecruitingRoleId {
  if (typeof window === "undefined") return "executive";
  return (window.localStorage.getItem(STORAGE_KEY) as RecruitingRoleId | null) ?? "executive";
}

export function setActiveRoleId(roleId: RecruitingRoleId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, roleId);
}

export function fetchWithRole(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("x-rbac-role", getActiveRoleId());
  return fetch(input, { ...init, headers });
}
