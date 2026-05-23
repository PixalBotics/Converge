import type { ChatGuestLinkPermissions } from "@/services/chat/guest.types";

const STORAGE_KEY = "converge_chat_guest_session_v1";

export type StoredGuestSession = {
  accessToken: string;
  expiresAt: string;
  conversationId: string;
  websiteId: string;
  departmentId: string;
  departmentName?: string;
  websiteLabel?: string;
  permissions: ChatGuestLinkPermissions;
  urlStrictSingleOpen?: boolean;
};

function isExpired(iso: string): boolean {
  const t = Date.parse(iso);
  return Number.isNaN(t) || t <= Date.now();
}

export function loadGuestSession(): StoredGuestSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredGuestSession;
    if (!parsed?.accessToken || !parsed.conversationId || isExpired(parsed.expiresAt)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveGuestSession(session: StoredGuestSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearGuestSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function guestSessionFromExchange(
  data: import("@/services/chat/guest.types").GuestSessionExchangeResponse,
): StoredGuestSession {
  return {
    accessToken: data.accessToken,
    expiresAt: data.expiresAt,
    conversationId: data.conversationId,
    websiteId: data.websiteId,
    departmentId: data.departmentId,
    departmentName: data.departmentName,
    websiteLabel: data.websiteLabel,
    permissions: data.permissions,
    urlStrictSingleOpen: data.urlStrictSingleOpen,
  };
}
