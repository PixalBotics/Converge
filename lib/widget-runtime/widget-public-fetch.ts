import { getResolvedPublicApiBaseUrl } from "@/lib/public-api/resolved-base-url";
import type {
  AiVisitorRespondRequest,
  AiVisitorRespondResponse,
  WidgetConfigEnvelope,
  WidgetSessionRequest,
  WidgetSessionResponse,
  WidgetSurfacesDto,
} from "./widget-types";

/**
 * Backend often wraps JSON as `{ success: true, data: ... }`; sometimes nested once.
 */
function peelSuccessEnvelope(raw: unknown, maxDepth = 4): unknown {
  let cur: unknown = raw;
  for (let d = 0; d < maxDepth; d++) {
    if (cur === null || typeof cur !== "object" || Array.isArray(cur)) break;
    const o = cur as Record<string, unknown>;
    const success = o.success;
    if (
      (success === true || success === "true") &&
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

function coerceSurfaces(input: unknown): WidgetSurfacesDto {
  return input !== null && typeof input === "object"
    ? (input as WidgetSurfacesDto)
    : {};
}

/** Normalize POST /widget/session body — token field names vary by API version. */
function parseWidgetSessionResponse(peeled: unknown): WidgetSessionResponse | null {
  if (!peeled || typeof peeled !== "object" || Array.isArray(peeled)) return null;
  const r = peeled as Record<string, unknown>;
  const tokenCandidates = [
    r.sessionToken,
    r.session_token,
    r.accessToken,
    r.access_token,
    r.token,
    r.jwt,
    r.bearerToken,
    r.bearer_token,
  ];
  let sessionToken = "";
  for (const c of tokenCandidates) {
    if (typeof c === "string" && c.trim()) {
      sessionToken = c.trim();
      break;
    }
  }
  if (!sessionToken) return null;

  return {
    tokenType: String(r.tokenType ?? r.token_type ?? "Bearer"),
    sessionToken,
    expiresIn: String(r.expiresIn ?? r.expires_in ?? ""),
    widgetKey: String(r.widgetKey ?? r.widget_key ?? ""),
    websiteId: String(r.websiteId ?? r.website_id ?? ""),
    widgetType: String(r.widgetType ?? r.widget_type ?? ""),
    surfaces: coerceSurfaces(r.surfaces),
  };
}

async function fetchJsonPublic<T>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; status: number; message: string }> {
  const base = getResolvedPublicApiBaseUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

    if (!res.ok) {
      let message = `${res.status} ${res.statusText}`;
      try {
        const maybe = await res.json();
        if (maybe?.message && typeof maybe.message === "string")
          message = maybe.message;
        if (maybe?.error && typeof maybe.error === "string")
          message = maybe.error;
      } catch {
        /* ignore parse */
      }
      return { ok: false, status: res.status, message };
    }

    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      message: e instanceof Error ? e.message : "Network error",
    };
  }
}

export async function getWidgetRuntimeConfig(widgetKey: string) {
  const result = await fetchJsonPublic<unknown>(
    `/widget/config/${encodeURIComponent(widgetKey)}`,
    { method: "GET" },
  );
  if (!result.ok) return result;
  const peeled = peelSuccessEnvelope(result.data) as WidgetConfigEnvelope;
  return { ok: true as const, data: peeled };
}

export async function postWidgetSession(body: WidgetSessionRequest) {
  const result = await fetchJsonPublic<unknown>(`/widget/session`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!result.ok) return result;
  const peeled = peelSuccessEnvelope(result.data);
  const parsed = parseWidgetSessionResponse(peeled);
  if (!parsed) {
    return {
      ok: false as const,
      status: 200,
      message: "Session token missing from server response.",
    };
  }
  return { ok: true as const, data: parsed };
}

/** Public AI reply for embedded widget visitor. Uses widget bearer when provided. */
export async function postAiVisitorRespond(
  body: AiVisitorRespondRequest,
  widgetBearerToken?: string,
) {
  const base = getResolvedPublicApiBaseUrl();
  const res = await fetch(`${base}/ai/visitor/respond`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(widgetBearerToken
        ? { Authorization: `Bearer ${widgetBearerToken}` }
        : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let msg = `${res.status}`;
    try {
      const maybe = await res.json();
      if (maybe?.message) msg = String(maybe.message);
    } catch {
      /* ignore */
    }
    return { ok: false as const, status: res.status, message: msg };
  }

  const data = (await res.json()) as AiVisitorRespondResponse;
  return { ok: true as const, data };
}
