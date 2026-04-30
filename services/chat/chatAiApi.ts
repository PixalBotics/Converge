import { apiClient } from "@/api";
import type {
  AgentAiKnowledgeLookupRequest,
  AgentAiRewriteRequest,
  AgentAiSummarizeRequest,
  AgentAiSuggestedRepliesRequest,
  VisitorAiAnalyticsParams,
} from "./chatAi.types";

function withBearer(token?: string): Record<string, string> | undefined {
  if (!token) return undefined;
  return { Authorization: `Bearer ${token}` };
}

/** Suggested quick replies for the agent (short strings). */
export async function postAgentAiSuggestedReplies(
  body: AgentAiSuggestedRepliesRequest,
  token?: string,
): Promise<unknown> {
  const { data } = await apiClient.post("/chat/ai/agent/suggested-replies", body, {
    headers: withBearer(token),
  });
  return data;
}

/** Conversation summary for the agent. */
export async function postAgentAiSummarize(body: AgentAiSummarizeRequest, token?: string): Promise<unknown> {
  const { data } = await apiClient.post("/chat/ai/agent/summarize", body, {
    headers: withBearer(token),
  });
  return data;
}

/** Rewrite `text` in the given tone. */
export async function postAgentAiRewrite(body: AgentAiRewriteRequest, token?: string): Promise<unknown> {
  const { data } = await apiClient.post("/chat/ai/agent/rewrite", body, {
    headers: withBearer(token),
  });
  return data;
}

/** Knowledge base / RAG lookup. */
export async function postAgentAiKnowledgeLookup(
  body: AgentAiKnowledgeLookupRequest,
  token?: string,
): Promise<unknown> {
  const { data } = await apiClient.post("/chat/ai/agent/knowledge-lookup", body, {
    headers: withBearer(token),
  });
  return data;
}

/** Visitor-facing AI usage metrics (deflection, sessions, satisfaction — backend-defined). */
export async function getVisitorAiAnalytics(params: VisitorAiAnalyticsParams | undefined, token?: string): Promise<unknown> {
  const { data } = await apiClient.get("/chat/ai/analytics/visitors", {
    params: params as Record<string, string | undefined>,
    headers: withBearer(token),
  });
  return data;
}
