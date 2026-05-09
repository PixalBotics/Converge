import { apiClient } from "../http/axios-instance";

export type AgentAiAction =
  | "suggested_reply"
  | "summarize"
  | "rewrite_tone"
  | "knowledge_lookup";

export interface AiAgentSuggestRequest {
  action: AgentAiAction;
  input: string;
  websiteId: string;
  conversationId: string;
  tone?: string;
}

export async function postAgentAiSuggestion(
  body: AiAgentSuggestRequest,
): Promise<unknown> {
  const { data } = await apiClient.post("/ai/agent/suggest-reply", body);
  return data;
}
