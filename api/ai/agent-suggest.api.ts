import { apiClient } from "../http/axios-instance";

export type AgentAiAction =
  | "suggested_reply"
  | "summarize"
  | "rewrite_tone"
  | "knowledge_lookup"
  | "coach_reply";

export interface AiAgentSuggestRequest {
  action: AgentAiAction;
  input: string;
  /** KB grounding — omit when empty; not required for `summarize`. */
  websiteId?: string;
  conversationId?: string;
  tone?: string;
}

function unwrapSuccessEnvelope(payload: unknown): unknown {
  if (
    payload !== null &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    "success" in payload &&
    (payload as { success?: unknown }).success === true &&
    "data" in payload
  ) {
    return (payload as { data: unknown }).data;
  }
  return payload;
}

/**
 * Prefer a human-readable assistant string from `/ai/agent/suggest-reply` payloads
 * (envelope or flat; several possible field names).
 */
export function formatAgentSuggestResponse(payload: unknown): string {
  const data = unwrapSuccessEnvelope(payload);
  if (typeof data === "string" && data.trim()) return data.trim();
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
  }
  const o = data as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const text =
    str(o.output) ||
    str(o.reply) ||
    str(o.response) ||
    str(o.text) ||
    str(o.message) ||
    str(o.suggestedReply) ||
    str(o.suggested_reply) ||
    str(o.content) ||
    str(o.body);
  if (text) return text;
  return JSON.stringify(data, null, 2);
}

export async function postAgentAiSuggestion(
  body: AiAgentSuggestRequest,
): Promise<unknown> {
  const payload: Record<string, unknown> = {
    action: body.action,
    input: body.input,
  };
  const wid = body.websiteId?.trim();
  if (wid) payload.websiteId = wid;
  const cid = body.conversationId?.trim();
  if (cid) payload.conversationId = cid;
  const tone = body.tone?.trim();
  if (tone) payload.tone = tone;

  const { data } = await apiClient.post<unknown>("/ai/agent/suggest-reply", payload);
  return data;
}
