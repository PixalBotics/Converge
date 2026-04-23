import { io, type Socket } from "socket.io-client";
import { getStableSocketDefaults, type StableSocketOptions } from "./socketCommon";

export interface SocketConnectionConfig {
  url: string;
  authToken?: string;
  forceNew?: boolean;
  options?: StableSocketOptions;
}

export class SocketConnection {
  private socket: Socket | null = null;
  private readonly url: string;
  private readonly options?: StableSocketOptions;
  private authToken?: string;

  constructor(url: string, options?: StableSocketOptions) {
    this.url = url;
    this.options = options;
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
        auth: this.authToken ? { token: this.authToken } : undefined,
      });
    } else if (!this.socket.connected) {
      this.socket.auth = this.authToken ? { token: this.authToken } : {};
      this.socket.connect();
    }

    return this.socket;
  }

  disconnect(clearListeners = true): void {
    if (!this.socket) return;
    if (clearListeners) {
      this.socket.removeAllListeners();
    }
    this.socket.disconnect();
    this.socket = null;
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
    this.socket?.on(event, listener);
    return () => this.socket?.off(event, listener);
  }
}
