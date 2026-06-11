import { consumeAgentRealtimeTokenChange, resetAgentRealtimeToken } from "@/services/socket/sharedAgentRealtime";
import { createChatSocketClient, type ChatSocketClient } from "./chatSocket";

let sharedAgentChatSocket: ChatSocketClient | null = null;

/** One `/chat` namespace per browser tab for agent + monitor sessions. */
export function getSharedAgentChatSocket(): ChatSocketClient {
  if (!sharedAgentChatSocket) {
    sharedAgentChatSocket = createChatSocketClient();
  }
  return sharedAgentChatSocket;
}

/**
 * Idempotent agent connect — avoids duplicate `forceNew` when inbox + chat hooks mount together.
 */
export function connectSharedAgentChat(authToken: string): void {
  const token = authToken.trim();
  if (!token) return;
  getSharedAgentChatSocket().connect({
    authToken: token,
    forceNew: consumeAgentRealtimeTokenChange(token),
  });
}

export function disconnectSharedAgentChat(hard = false): void {
  resetAgentRealtimeToken();
  if (sharedAgentChatSocket) {
    sharedAgentChatSocket.disconnect(hard);
  }
}
