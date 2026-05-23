import { createChatSocketClient, type ChatSocketClient } from "./chatSocket";

let sharedAgentChatSocket: ChatSocketClient | null = null;

/** One `/chat` connection per browser tab for agent + monitor sessions. */
export function getSharedAgentChatSocket(): ChatSocketClient {
  if (!sharedAgentChatSocket) {
    sharedAgentChatSocket = createChatSocketClient();
  }
  return sharedAgentChatSocket;
}
