import { io, type Socket } from "socket.io-client";
import { getStableSocketDefaults, type StableSocketOptions } from "./socketCommon";

export interface SocketConnectionConfig {
  url: string;
  authToken?: string;
  forceNew?: boolean;
  options?: StableSocketOptions;
}

type SocketListener = (...args: unknown[]) => void;

export class SocketConnection {
  private socket: Socket | null = null;
  private readonly url: string;
  private readonly options?: StableSocketOptions;
  private authToken?: string;
  /** Survives socket recreation (`forceNew`) so chat hooks keep receiving events. */
  private readonly listeners = new Map<string, Set<SocketListener>>();

  constructor(url: string, options?: StableSocketOptions) {
    this.url = url;
    this.options = options;
  }

  private attachStoredListeners(target: Socket): void {
    for (const [event, set] of this.listeners) {
      for (const listener of set) {
        target.off(event, listener);
        target.on(event, listener);
      }
    }
  }

  connect(config?: Omit<SocketConnectionConfig, "url">): Socket {
    if (config?.authToken !== undefined) {
      this.authToken = config.authToken;
    }

    const shouldRecreate = Boolean(config?.forceNew);
    if (this.socket?.connected && !shouldRecreate) {
      return this.socket;
    }

    if (!this.socket || shouldRecreate) {
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
      }

      this.socket = io(this.url, {
        ...getStableSocketDefaults(),
        ...(this.options || {}),
        ...(config?.options || {}),
        auth: this.authToken ? { token: this.authToken } : {},
      });
      this.attachStoredListeners(this.socket);
    } else if (!this.socket.connected) {
      if (this.authToken) {
        this.socket.auth = { token: this.authToken };
      }
      this.socket.connect();
    }

    return this.socket;
  }

  disconnect(clearListeners = true): void {
    if (!this.socket) return;
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
    if (clearListeners) {
      this.listeners.clear();
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return Boolean(this.socket?.connected);
  }

  emit<TPayload>(event: string, payload: TPayload): void {
    this.socket?.emit(event, payload);
  }

  on<TPayload>(event: string, listener: (payload: TPayload) => void): () => void {
    const wrapped = listener as SocketListener;
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(wrapped);
    this.socket?.on(event, wrapped);
    return () => {
      this.listeners.get(event)?.delete(wrapped);
      this.socket?.off(event, wrapped);
    };
  }
}
