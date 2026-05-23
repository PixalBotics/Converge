import { EMAIL_ROUTES, resellerOwnMailEditPath } from "./email.constants";

export const EMAIL_RESELLER_STORAGE_KEY = "converge:email-config-reseller-id";

export function readEmailResellerFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  const v = sessionStorage.getItem(EMAIL_RESELLER_STORAGE_KEY)?.trim();
  return v || null;
}

export function writeEmailResellerToStorage(resellerId: string | null): void {
  if (typeof window === "undefined") return;
  if (resellerId?.trim()) {
    sessionStorage.setItem(EMAIL_RESELLER_STORAGE_KEY, resellerId.trim());
  } else {
    sessionStorage.removeItem(EMAIL_RESELLER_STORAGE_KEY);
  }
}

export function buildEmailTabHref(path: string, resellerId: string | null): string {
  const id = resellerId?.trim();
  if (!id) return path;
  if (path === EMAIL_ROUTES.connection || path === EMAIL_ROUTES.resellerMail) {
    return resellerOwnMailEditPath(id);
  }
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}resellerId=${encodeURIComponent(id)}`;
}
