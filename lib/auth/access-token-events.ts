export const ACCESS_TOKEN_CHANGED_EVENT = "converge:access-token-changed";

export function notifyAccessTokenChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ACCESS_TOKEN_CHANGED_EVENT));
}
