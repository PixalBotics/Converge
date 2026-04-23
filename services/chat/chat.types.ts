export type ChatParticipantRole = "visitor" | "agent" | "system";

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

export interface VisitorCreateConversationPayload {
  name?: string;
  email?: string;
  phone?: string;
  message: string;
  websiteId?: string;
  metadata?: Record<string, unknown>;
}

export interface VisitorCreateConversationResponse {
  conversationId: string;
  visitorId?: string;
  assigned?: boolean;
  [key: string]: unknown;
}

export interface SendMessagePayload {
  content: string;
  metadata?: Record<string, unknown>;
}

export interface AgentMessagePayload extends SendMessagePayload {
  agentId?: string;
}

export interface ConversationSummary {
  id: string;
  status?: "active" | "waiting" | "closed" | string;
  visitorId?: string;
  assignedAgentId?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  [key: string]: unknown;
}

export interface ConversationHistoryResponse {
  conversationId: string;
  messages: ChatMessage[];
  [key: string]: unknown;
}

export interface TypingPayload {
  conversationId: string;
  actorId?: string;
  role?: ChatParticipantRole;
}

export interface JoinLeaveRoomPayload {
  conversationId: string;
  userId?: string;
  role?: ChatParticipantRole;
}
