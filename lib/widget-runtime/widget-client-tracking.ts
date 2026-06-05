export function readClientTimezone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

export function readClientLocale(): string | undefined {
  if (typeof navigator === "undefined") return undefined;
  return navigator.language || undefined;
}

export function readScreenResolution(): string | undefined {
  if (typeof screen === "undefined") return undefined;
  return `${screen.width}x${screen.height}`;
}

export function buildWidgetTrackingPayload(params: {
  websiteId: string;
  eventType: "page_view" | "widget_open" | "chat_started" | "lead_captured";
  sessionId?: string;
  pageUrl?: string;
  referrerUrl?: string;
  name?: string;
  email?: string;
  phone?: string;
  consentGiven?: boolean;
}) {
  return {
    websiteId: params.websiteId,
    eventType: params.eventType,
    sessionId: params.sessionId,
    pageUrl: params.pageUrl,
    referrerUrl: params.referrerUrl,
    timezone: readClientTimezone(),
    locale: readClientLocale(),
    screenResolution: readScreenResolution(),
    consentGiven: params.consentGiven,
    name: params.name,
    email: params.email,
    phone: params.phone,
  };
}
