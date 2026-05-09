import { widgetResponseData } from "@/api/widgets/widgets.api";
import type { JsonRecord } from "@/api/types/common.types";

export function unwrapWidgetInstallEnvelope(payload: unknown): JsonRecord {
  return widgetResponseData<JsonRecord>(payload);
}

/** Resolve widget key + plaintext deploy key from `POST /widgets/installations` response. */
export function pickInstallWidgetKeys(inner: JsonRecord): {
  widgetKey: string;
  deployKey: string;
} {
  let widgetKey = String(inner.widgetKey ?? inner.widget_key ?? "");
  let deployKey = String(
    inner.deployKey ??
      inner.deployKeyPlain ??
      inner.installToken ??
      inner.oneTimeDeployKey ??
      "",
  );

  const nested = inner.data;
  if (typeof nested === "object" && nested !== null && (!widgetKey || !deployKey)) {
    const n = nested as JsonRecord;
    if (!widgetKey) widgetKey = String(n.widgetKey ?? n.widget_key ?? "");
    if (!deployKey)
      deployKey = String(
        n.deployKey ?? n.deployKeyPlain ?? n.installToken ?? n.oneTimeDeployKey ?? "",
      );
  }

  return { widgetKey, deployKey };
}

export function pickRequiresPublishBeforeEmbed(inner: JsonRecord): boolean {
  const v =
    inner.requiresPublishBeforeEmbed ?? inner.requires_publish_before_embed;
  return v === true;
}

/** Draft-only PATCH/install responses sometimes return `{ status: "draft" }`. */
export function pickWidgetRemoteStatus(inner: JsonRecord): string | null {
  const s = inner.status ?? inner.widgetStatus;
  return typeof s === "string" && s.trim() ? s.trim() : null;
}

export function readEmbedSnippetMarkup(payload: unknown): string | null {
  const d = widgetResponseData<JsonRecord>(payload);
  if (typeof d.htmlSnippet === "string") return d.htmlSnippet;
  if (typeof d.snippet === "string") return d.snippet;
  if (typeof d.html === "string") return d.html;
  return null;
}

/** Deploy key from `GET .../embed-snippet` envelope or unified loader HTML. */
export function extractDeployKeyFromEmbedSnippetResponse(
  payload: unknown,
): string {
  const inner = widgetResponseData<JsonRecord>(payload);
  let deployKey = pickInstallWidgetKeys(inner).deployKey.trim();
  if (deployKey) return deployKey;
  const html = readEmbedSnippetMarkup(payload);
  if (html) {
    const dq = html.match(/data-deploy-key="([^"]+)"/i);
    if (dq?.[1]) return dq[1].trim();
    const sq = html.match(/data-deploy-key='([^']+)'/i);
    if (sq?.[1]) return sq[1].trim();
  }
  return "";
}
