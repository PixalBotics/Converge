/** Minimal message shape sent to AI endpoints (trimmed history). */
export type AiChatMessageSnippet = {
  role: string;
  content: string;
};

export type AgentAiSuggestedRepliesRequest = {
  conversationId: string;
  messages: AiChatMessageSnippet[];
  /** Optional extra system context from CRM / widget. */
  context?: string;
};

export type AgentAiSummarizeRequest = {
  conversationId: string;
  messages: AiChatMessageSnippet[];
};

export type AgentAiRewriteRequest = {
  conversationId: string;
  text: string;
  tone?: "professional" | "friendly" | "concise";
};

export type AgentAiKnowledgeLookupRequest = {
  conversationId: string;
  query: string;
};

export type VisitorAiAnalyticsParams = {
  from?: string;
  to?: string;
};

export type KnowledgeHit = {
  title: string;
  snippet: string;
  url?: string;
  score?: number;
};
