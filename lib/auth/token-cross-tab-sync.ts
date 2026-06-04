const TOKEN_SYNC_STORAGE_KEY = "converge.auth.tokens.v1";
const REFRESH_LOCK_STORAGE_KEY = "converge.auth.refresh.lock";
const REFRESH_LOCK_TTL_MS = 20_000;

type StoredTokenSyncPayload = {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn?: string | null;
  refreshExpiresIn?: string | null;
  at: number;
};

type RefreshLockPayload = {
  tabId: string;
  at: number;
};

let tabId: string | null = null;
let applyingRemoteTokens = false;

function browserTabId(): string {
  if (tabId) return tabId;
  tabId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return tabId;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readRefreshLock(): RefreshLockPayload | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(REFRESH_LOCK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RefreshLockPayload;
    if (!parsed?.tabId || typeof parsed.at !== "number") return null;
    if (Date.now() - parsed.at > REFRESH_LOCK_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function broadcastTokenPairUpdate(payload: StoredTokenSyncPayload): void {
  if (!isBrowser() || applyingRemoteTokens) return;
  try {
    localStorage.setItem(TOKEN_SYNC_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* storage full / private mode */
  }
}

export function tryAcquireCrossTabRefreshLock(): boolean {
  if (!isBrowser()) return true;
  const existing = readRefreshLock();
  const id = browserTabId();
  if (existing && existing.tabId !== id) return false;
  try {
    localStorage.setItem(
      REFRESH_LOCK_STORAGE_KEY,
      JSON.stringify({ tabId: id, at: Date.now() } satisfies RefreshLockPayload),
    );
    return true;
  } catch {
    return true;
  }
}

export function releaseCrossTabRefreshLock(): void {
  if (!isBrowser()) return;
  const existing = readRefreshLock();
  if (existing?.tabId !== browserTabId()) return;
  try {
    localStorage.removeItem(REFRESH_LOCK_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function waitForCrossTabTokenUpdate(timeoutMs = 15_000): Promise<StoredTokenSyncPayload | null> {
  if (!isBrowser()) return Promise.resolve(null);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: StoredTokenSyncPayload | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      window.removeEventListener("storage", onStorage);
      resolve(value);
    };

    const readLatest = (): StoredTokenSyncPayload | null => {
      try {
        const raw = localStorage.getItem(TOKEN_SYNC_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as StoredTokenSyncPayload;
        if (!parsed?.accessToken?.trim() || !parsed?.refreshToken?.trim()) return null;
        return parsed;
      } catch {
        return null;
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== TOKEN_SYNC_STORAGE_KEY || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue) as StoredTokenSyncPayload;
        if (parsed?.accessToken?.trim() && parsed?.refreshToken?.trim()) {
          finish(parsed);
        }
      } catch {
        /* ignore */
      }
    };

    const existing = readLatest();
    if (existing && Date.now() - existing.at < REFRESH_LOCK_TTL_MS) {
      finish(existing);
      return;
    }

    window.addEventListener("storage", onStorage);
    const timer = window.setTimeout(() => finish(null), timeoutMs);
  });
}

export type CrossTabTokenListener = (payload: StoredTokenSyncPayload) => void;

let tokenListener: CrossTabTokenListener | null = null;

export function registerCrossTabTokenListener(listener: CrossTabTokenListener | null): void {
  tokenListener = listener;
}

export function initTokenCrossTabSync(): () => void {
  if (!isBrowser()) return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key !== TOKEN_SYNC_STORAGE_KEY || !event.newValue) return;
    try {
      const parsed = JSON.parse(event.newValue) as StoredTokenSyncPayload;
      if (!parsed?.accessToken?.trim() || !parsed?.refreshToken?.trim()) return;
      applyingRemoteTokens = true;
      tokenListener?.(parsed);
    } catch {
      /* ignore */
    } finally {
      applyingRemoteTokens = false;
    }
  };

  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

export type { StoredTokenSyncPayload };
