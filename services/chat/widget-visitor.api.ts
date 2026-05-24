import { getResolvedPublicApiBaseUrl } from "@/lib/public-api/resolved-base-url";

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

export type WidgetRequestHumanResult = {
  message: string;
  assignedAgentId: string | null;
  queuedForAgent: boolean;
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
      },
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Network error",
    };
  }
}
