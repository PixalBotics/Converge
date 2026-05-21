import {
  buildSocketUrl,
  resolveSocketEndpoint,
  SocketConnection,
} from "@/services/socket";
import type { NotificationSocketEvent } from "./notifications.types";

const notificationsSocketEndpoint = resolveSocketEndpoint({
  envBaseUrl: process.env.NEXT_PUBLIC_NOTIFICATIONS_SOCKET_BASE_URL,
  envFallbackBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  envNamespace: process.env.NEXT_PUBLIC_NOTIFICATIONS_SOCKET_NAMESPACE,
  defaultNamespace: "/notifications",
});

export class NotificationsSocketClient {
  private connection = new SocketConnection(buildSocketUrl(notificationsSocketEndpoint));

  connect(authToken: string, forceNew = false): void {
    this.connection.connect({ authToken, forceNew });
  }

  disconnect(): void {
    this.connection.disconnect(true);
  }

  isConnected(): boolean {
    return this.connection.isConnected();
  }

  onNotification(listener: (payload: NotificationSocketEvent) => void): () => void {
    return this.connection.on<NotificationSocketEvent>("notification", listener);
  }

  onSocketConnect(listener: () => void): () => void {
    return this.connection.on("connect", listener);
  }

  onSocketDisconnect(listener: () => void): () => void {
    return this.connection.on("disconnect", listener);
  }
}

let sharedNotificationsSocket: NotificationsSocketClient | null = null;

export function getSharedNotificationsSocket(): NotificationsSocketClient {
  if (!sharedNotificationsSocket) {
    sharedNotificationsSocket = new NotificationsSocketClient();
  }
  return sharedNotificationsSocket;
}
