type InboxRefreshListener = () => void;

const listeners = new Set<InboxRefreshListener>();

export function subscribeAgentInboxRefresh(listener: InboxRefreshListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function publishAgentInboxRefresh(): void {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      /* ignore listener errors */
    }
  });
}

/** Re-fetch inbox shortly after handover — API may lag the alerts socket. */
export function publishAgentInboxRefreshSoon(followUpDelaysMs: number[] = [800, 2000]): void {
  publishAgentInboxRefresh();
  if (typeof window === "undefined") return;
  for (const delay of followUpDelaysMs) {
    window.setTimeout(() => {
      publishAgentInboxRefresh();
    }, delay);
  }
}
