import { getResolvedPublicApiBaseUrl } from "@/lib/public-api/resolved-base-url";
import { WIDGET_FETCH_CREDENTIALS } from "@/lib/widget-runtime/widget-fetch-credentials";
import type {
  VisitorCreateConversationPayload,
  VisitorCreateConversationResponse,
  VisitorSendMessagePayload,
} from "./chat.types";

function peelSuccessEnvelope(raw: unknown, maxDepth = 4): unknown {
  let cur: unknown = raw;
  for (let d = 0; d < maxDepth; d++) {
    if (cur === null || typeof cur !== "object" || Array.isArray(cur)) break;
    const o = cur as Record<string, unknown>;
    if (
      (o.success === true || o.success === "true") &&
      "data" in o &&
      o.data !== null &&
      typeof o.data === "object"
    ) {
      cur = o.data;
      continue;
    }
    break;
  }
  return cur;
}

async function widgetVisitorFetchJson<T>(
  path: string,
  init: RequestInit,
  widgetBearerToken?: string,
): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  const base = getResolvedPublicApiBaseUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const res = await fetch(url, {
      ...init,
      credentials: WIDGET_FETCH_CREDENTIALS,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
        ...(widgetBearerToken
          ? { Authorization: `Bearer ${widgetBearerToken}` }
          : {}),
      },
    });

    if (!res.ok) {
      let message = `${res.status} ${res.statusText}`;
      try {
        const maybe = await res.json();
        if (maybe?.message && typeof maybe.message === "string") {
          message = maybe.message;
        }
      } catch {
        /* ignore */
      }
      return { ok: false, message };
    }

    return { ok: true, data: peelSuccessEnvelope(await res.json()) as T };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Network error",
    };
  }
}

/**
 * Public widget chat REST — never uses dashboard `apiClient` (same-origin iframe shares cookies).
 */
export async function createWidgetConversation(
  payload: VisitorCreateConversationPayload,
  widgetBearerToken?: string,
): Promise<VisitorCreateConversationResponse> {
  const result = await widgetVisitorFetchJson<VisitorCreateConversationResponse>(
    "/chat/widget/conversations",
    { method: "POST", body: JSON.stringify(payload) },
    widgetBearerToken,
  );
  if (!result.ok) {
    throw new Error(result.message);
  }
  return result.data;
}

export async function sendWidgetVisitorMessage(
  conversationId: string,
  payload: VisitorSendMessagePayload,
  widgetBearerToken?: string,
): Promise<unknown> {
  const result = await widgetVisitorFetchJson<unknown>(
    `/chat/widget/conversations/${encodeURIComponent(conversationId)}/messages`,
    { method: "POST", body: JSON.stringify(payload) },
    widgetBearerToken,
  );
  if (!result.ok) {
    throw new Error(result.message);
  }
  return result.data;
}

export type WidgetTranscriptMessage = {
  id: string;
  senderType: string;
  content: string;
  messageType?: string;
  createdAt: string;
};

export type WidgetTranscriptResult = {
  id: string;
  status: string;
  chatCompleted: boolean;
  canSendMessages: boolean;
  handoverRequested?: boolean;
  queuedForAgent?: boolean;
  assignedAgentId?: string | null;
  visitor?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  messages: WidgetTranscriptMessage[];
};

export async function fetchWidgetTranscript(
  conversationId: string,
  websiteId: string,
  widgetBearerToken?: string,
): Promise<
  { ok: true; data: WidgetTranscriptResult } | { ok: false; message: string }
> {
  const base = getResolvedPublicApiBaseUrl();
  const url =
    `${base}/chat/widget/conversations/${encodeURIComponent(conversationId)}` +
    `/transcript?websiteId=${encodeURIComponent(websiteId)}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      credentials: WIDGET_FETCH_CREDENTIALS,
      headers: {
        Accept: "application/json",
        ...(widgetBearerToken
          ? { Authorization: `Bearer ${widgetBearerToken}` }
          : {}),
      },
    });

    if (!res.ok) {
      let message = `${res.status} ${res.statusText}`;
      try {
        const maybe = await res.json();
        if (maybe?.message && typeof maybe.message === "string") {
          message = maybe.message;
        }
      } catch {
        /* ignore */
      }
      return { ok: false, message };
    }

    const raw = peelSuccessEnvelope(await res.json());
    const o =
      raw !== null && typeof raw === "object" && !Array.isArray(raw)
        ? (raw as Record<string, unknown>)
        : {};

    const messagesRaw = Array.isArray(o.messages) ? o.messages : [];
    const messages: WidgetTranscriptMessage[] = [];
    for (const row of messagesRaw) {
      if (!row || typeof row !== "object") continue;
      const m = row as Record<string, unknown>;
      const id = typeof m.id === "string" ? m.id : "";
      const content =
        typeof m.content === "string"
          ? m.content
          : typeof m.message === "string"
            ? m.message
            : "";
      const senderType = typeof m.senderType === "string" ? m.senderType : "visitor";
      const createdAt =
        typeof m.createdAt === "string" ? m.createdAt : new Date().toISOString();
      if (!id || !content.trim()) continue;
      messages.push({
        id,
        content,
        senderType,
        messageType: typeof m.messageType === "string" ? m.messageType : undefined,
        createdAt,
      });
    }

    const visitor =
      o.visitor !== null && typeof o.visitor === "object" && !Array.isArray(o.visitor)
        ? (o.visitor as WidgetTranscriptResult["visitor"])
        : null;

    return {
      ok: true,
      data: {
        id: typeof o.id === "string" ? o.id : conversationId,
        status: typeof o.status === "string" ? o.status : "active",
        chatCompleted: o.chatCompleted === true,
        canSendMessages: o.canSendMessages !== false,
        handoverRequested: o.handoverRequested === true,
        queuedForAgent: o.queuedForAgent === true,
        assignedAgentId:
          typeof o.assignedAgentId === "string"
            ? o.assignedAgentId
            : typeof o.agentId === "string"
              ? o.agentId
              : null,
        visitor,
        messages,
      },
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Network error",
    };
  }
}

export type WidgetRequestHumanResult = {
  message: string;
  assignedAgentId: string | null;
  queuedForAgent: boolean;
  handoverRequested?: boolean;
  handoverPending?: boolean;
};

export async function postWidgetRequestHuman(
  conversationId: string,
  websiteId: string,
  widgetBearerToken?: string,
): Promise<
  { ok: true; data: WidgetRequestHumanResult } | { ok: false; message: string }
> {
  const base = getResolvedPublicApiBaseUrl();
  const url =
    `${base}/chat/widget/conversations/${encodeURIComponent(conversationId)}` +
    `/request-human?websiteId=${encodeURIComponent(websiteId)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      credentials: WIDGET_FETCH_CREDENTIALS,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(widgetBearerToken
          ? { Authorization: `Bearer ${widgetBearerToken}` }
          : {}),
      },
      body: "{}",
    });

    if (!res.ok) {
      let message = `${res.status} ${res.statusText}`;
      try {
        const maybe = await res.json();
        if (maybe?.message && typeof maybe.message === "string") {
          message = maybe.message;
        }
      } catch {
        /* ignore */
      }
      return { ok: false, message };
    }

    const raw = peelSuccessEnvelope(await res.json());
    const o =
      raw !== null && typeof raw === "object" && !Array.isArray(raw)
        ? (raw as Record<string, unknown>)
        : {};

    return {
      ok: true,
      data: {
        message:
          typeof o.message === "string"
            ? o.message
            : "Your request has been sent to our team.",
        assignedAgentId:
          typeof o.assignedAgentId === "string" ? o.assignedAgentId : null,
        queuedForAgent: o.queuedForAgent === true,
        handoverRequested: o.handoverRequested === true,
        handoverPending:
          o.handoverPending === true ||
          ("handoverPending" in o && o.handoverPending === true),
      },
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Network error",
    };
  }
}
