"use client";

import type { AuthTokenPair } from "@/api";
import type { ImpersonationUserSnapshot } from "./impersonation-user";

const IMPERSONATION_STORAGE_KEY = "converge_impersonation_session";
const IMPERSONATION_ACTIVE_FLAG_KEY = "converge_impersonation_active";

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

function setImpersonationActiveFlag(active: boolean): void {
  if (!isBrowser()) return;
  try {
    if (active) {
      window.sessionStorage.setItem(IMPERSONATION_ACTIVE_FLAG_KEY, "1");
    } else {
      window.sessionStorage.removeItem(IMPERSONATION_ACTIVE_FLAG_KEY);
    }
  } catch {
    /* private mode / quota */
  }
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
  setImpersonationActiveFlag(true);
}

export function clearImpersonationSession(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(IMPERSONATION_STORAGE_KEY);
  setImpersonationActiveFlag(false);
}

/** True when login-as metadata exists (localStorage) or the tab flag is still set after refresh. */
export function isImpersonatingSessionActive(): boolean {
  if (getImpersonationSession()) return true;
  if (!isBrowser()) return false;
  try {
    return window.sessionStorage.getItem(IMPERSONATION_ACTIVE_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}
