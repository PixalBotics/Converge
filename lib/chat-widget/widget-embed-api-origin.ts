function originOf(url: string): string | null {
  const raw = url.trim();
  if (!raw) return null;
  try {
    return new URL(raw.includes("://") ? raw : `https://${raw}`).origin;
  } catch {
    return null;
  }
}

/** Browser-visible Nest API origin (no trailing slash). */
export function resolveWidgetApiOrigin(): string {
  const raw =
    (typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_API_BASE_URL?.trim()) ||
    "";

  if (raw) return raw.replace(/\/+$/, "");

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }

  return "https://your-api.example";
}

/** Dashboard origin for visitor iframe embed (matches admin preview). */
export function resolveWidgetEmbedAppOrigin(): string {
  const raw =
    (typeof process !== "undefined" &&
      (process.env.NEXT_PUBLIC_WIDGET_EMBED_ORIGIN?.trim() ||
        process.env.NEXT_PUBLIC_APP_URL?.trim())) ||
    "";

  if (raw) return raw.replace(/\/+$/, "");

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }

  return resolveWidgetApiOrigin();
}

export type WidgetEmbedArchitecture = {
  appOrigin: string;
  apiOrigin: string;
  scriptSrc: string;
  cdnOrigin: string | null;
};

/** Optional CDN host for widget.js only (Phase 1C). */
export function resolveWidgetCdnOrigin(): string | null {
  const raw =
    (typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_WIDGET_CDN_ORIGIN?.trim()) ||
    "";
  return raw ? raw.replace(/\/+$/, "") : null;
}

/** Loader script URL: CDN override, else app origin. */
export function resolveWidgetLoaderScriptUrl(): string {
  const cdn = resolveWidgetCdnOrigin();
  if (cdn) return `${cdn}/widget.js`;
  return `${resolveWidgetEmbedAppOrigin()}/widget.js`;
}

/** SaaS split: UI on app origin, data on API origin. */
export function resolveWidgetEmbedArchitecture(): WidgetEmbedArchitecture {
  const appOrigin = resolveWidgetEmbedAppOrigin();
  const apiOrigin = resolveWidgetApiOrigin();
  const cdnOrigin = resolveWidgetCdnOrigin();
  const scriptSrc = resolveWidgetLoaderScriptUrl();
  return { appOrigin, apiOrigin, scriptSrc, cdnOrigin };
}

/**
 * Customer-site embed: iframe loader on dashboard host (same UI as admin preview).
 * `/embed/widget` loads config/session from NEXT_PUBLIC_API_BASE_URL.
 */
export function buildVisitorWidgetEmbedScript(input: {
  widgetKey: string;
  appOrigin?: string;
}): string {
  const app = (input.appOrigin ?? resolveWidgetEmbedAppOrigin()).replace(
    /\/+$/,
    "",
  );
  const key = input.widgetKey.trim();
  const scriptSrc = resolveWidgetLoaderScriptUrl();
  return `<!-- Converge widget — iframe matches dashboard preview; API config via /embed/widget -->
<script src="${scriptSrc}" data-widget-key="${key}" data-app-origin="${app}" defer></script>`;
}

/** @deprecated Alias — use {@link buildVisitorWidgetEmbedScript}. */
export function buildApiWidgetEmbedScript(input: {
  widgetKey: string;
  apiOrigin?: string;
  appOrigin?: string;
}) {
  return buildVisitorWidgetEmbedScript({
    widgetKey: input.widgetKey,
    appOrigin: input.appOrigin ?? input.apiOrigin,
  });
}

/** Normalize saved snippets to current app-origin iframe embed. */
export function normalizeEmbedSnippetForApi(
  snippet: string,
  appOrigin: string,
): string {
  const app = appOrigin.trim().replace(/\/+$/, "");
  if (!app || !snippet.trim()) return snippet;

  const apiOrigin = resolveWidgetApiOrigin();
  const apiO = originOf(apiOrigin);
  const appO = originOf(app);

  let out = snippet;
  out = out.replace(/(\ssrc=")([^"]*\/widget\.js)(")/gi, (_m, p1, src, p3) => {
    const srcOrigin = originOf(String(src));
    if (apiO && srcOrigin === apiO && appO) {
      return `${p1}${app}/widget.js${p3}`;
    }
    return `${p1}${app}/widget.js${p3}`;
  });
  out = out.replace(/(data-app-origin=")([^"]*)(")/gi, `$1${app}$3`);
  out = out.replace(/\sdata-api-origin="[^"]*"/gi, "");
  return out;
}
