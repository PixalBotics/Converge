export type ChatParticipantRole = "visitor" | "agent" | "system";

/** Unified client chat message shape (REST + realtime). */
export interface ChatMessage {
  id?: string;
  conversationId: string;
  content: string;
  senderId?: string;
  senderName?: string;
  role: ChatParticipantRole;
  createdAt?: string;
  metadata?: Record<string, unknown>;
}

/** POST /chat/widget/conversations — request body */
export interface WidgetVisitorPayload {
  name?: string;
  email?: string;
  phone?: string;
  /** Client-side persisted visitor session identifier */
  sessionId: string;
}

export interface VisitorCreateConversationPayload {
  websiteId: string;
  visitor: WidgetVisitorPayload;
  firstMessage: string;
  currentPageUrl: string;
  referrerUrl?: string;
  /** Attached from topic / inquiry selection (stored in conversation metadata server-side when supported). */
  topic?: string;
}

/** POST /chat/widget/conversations — response */
export interface VisitorCreateConversationResponse {
  conversationId: string;
  visitorId: string;
  status: "assigned" | "waiting" | string;
  assignedAgentId: string | null;
  assignedRank: "Primary" | "Secondary" | "Backup" | null;
}

/** POST .../widget/conversations/:id/messages */
export interface VisitorSendMessagePayload {
  message: string;
  currentPageUrl: string;
}

/** POST .../agent/conversations/:id/messages */
export interface AgentSendMessagePayload {
  message: string;
}

export interface ConversationSummary {
  /** Normalized id (always `conversationId` when present on API). */
  id: string;
  conversationId?: string;
  websiteId?: string;
  status?: "assigned" | "waiting" | "active" | "closed" | string;
  visitorId?: string;
  assignedAgentId?: string | null;
  assignedRank?: string | null;
  lastMessageAt?: string;
  unreadCount?: number;
  visitor?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ConversationHistoryResponse {
  conversationId: string;
  messages: ChatMessage[];
  visitor?: Record<string, unknown>;
  /** Allow rich history envelopes from backend */
  [key: string]: unknown;
}

/** POST /chat/agent/conversations/:id/close */
export interface ChatCloseResponse {
  conversationId: string;
  closedBy?: string;
  reassigned?: {
    conversationId: string;
    agentId: string;
    rank: string;
  } | null;
}

/** Socket: server → client typing */
export interface TypingPayload {
  conversationId: string;
  userType?: "agent" | "visitor" | string;
}

/** Socket: client → server join/leave (backend contract: conversationId only). */
export interface JoinLeaveRoomPayload {
  conversationId: string;
}

/** Socket: client → server visitor_message */
export interface SocketVisitorMessagePayload {
  conversationId: string;
  message: string;
  currentPageUrl: string;
}

/** Socket: client → server agent_message */
export interface SocketAgentMessagePayload {
  conversationId: string;
  message: string;
}
