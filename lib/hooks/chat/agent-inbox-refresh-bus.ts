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
