"use client";

import type { AuthTokenPair } from "@/api";
import type { ImpersonationUserSnapshot } from "./impersonation-user";

const IMPERSONATION_STORAGE_KEY = "converge_impersonation_session";

export type ImpersonationSession = {
  originalTokenPair: AuthTokenPair;
  impersonatedUserId: string;
  impersonatedLicenseKey: string;
  startedAt: string;
  /** Target account (shown in header/banner while impersonating). */
  impersonatedUser?: ImpersonationUserSnapshot;
  /** Admin who started login-as (for banner context). */
  actorUser?: ImpersonationUserSnapshot;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getImpersonationSession(): ImpersonationSession | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(IMPERSONATION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ImpersonationSession;
    if (!parsed?.originalTokenPair?.accessToken || !parsed?.originalTokenPair?.refreshToken) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setImpersonationSession(session: ImpersonationSession): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(IMPERSONATION_STORAGE_KEY, JSON.stringify(session));
}

export function clearImpersonationSession(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(IMPERSONATION_STORAGE_KEY);
}

export function isImpersonatingSessionActive(): boolean {
  return !!getImpersonationSession();
}
