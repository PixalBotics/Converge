import { isRecord, pickStr, unwrapApiData } from "@/lib/utils";
import type { WidgetDraft, WidgetKind } from "./widgetDraft";

export type HeaderTitleAlign = "Center" | "Left";
export type ButtonShape = "circle" | "rounded" | "square";
export type ButtonPosition = "left" | "center" | "right";

/** Admin-editable widget configuration (draft / published payload shape). */
export interface WidgetAdminConfig {
  widgetId: string;
  type: WidgetKind;
  completed: boolean;
  headerTitle: string;
  headerTitleAlign: HeaderTitleAlign;
  /** Public URL after logo upload (server). */
  logoUrl: string;
  /** Local preview (data URL); cleared after successful upload when `logoUrl` is set. */
  logoDataUrl: string;
  buttonColor: string;
  buttonHoverColor: string;
  iconColor: string;
  textColor: string;
  buttonShape: ButtonShape;
  buttonPosition: ButtonPosition;
  /** Launcher icon as data URL or remote URL. */
  iconDataUrl: string;
  greetingMessage: string;
  startChatLabel: string;
  sendPlaceholder: string;
  bannerOn: boolean;
  bannerTitle: string;
  bannerDescription: string;
  bannerDataUrl: string;
  boxWidth: number;
  boxHeight: number;
  /** JSON string for operating hours (backend-defined schema). */
  operatingHoursJson: string;
  botEnabled: boolean;
  privacyNotice: string;
  /** One domain per line (or comma-separated pasted list). */
  allowedDomainsText: string;
  prechatNameEnabled: boolean;
  prechatEmailEnabled: boolean;
  prechatPhoneEnabled: boolean;
  prechatMessageEnabled: boolean;
  prechatMessageRequired: boolean;
}

export const defaultWidgetAdminConfig = (widgetId: string): WidgetAdminConfig => ({
  widgetId,
  type: "chat",
  completed: false,
  headerTitle: "AI Sales Assistant",
  headerTitleAlign: "Center",
  logoUrl: "",
  logoDataUrl: "",
  buttonColor: "#1E63D5",
  buttonHoverColor: "#164EB0",
  iconColor: "#FFFFFF",
  textColor: "#FFFFFF",
  buttonShape: "circle",
  buttonPosition: "right",
  iconDataUrl: "",
  greetingMessage:
    "Welcome. Tell us your budget, location, and what you are looking for—we are here to help.",
  startChatLabel: "Send",
  sendPlaceholder: "Type your message…",
  bannerOn: true,
  bannerTitle: "Special offer",
  bannerDescription: "Ask about current promotions.",
  bannerDataUrl: "",
  boxWidth: 350,
  boxHeight: 430,
  operatingHoursJson: JSON.stringify(
    {
      timezone: "Asia/Dubai",
      schedule: [
        { day: "Mon", open: "09:00", close: "18:00" },
        { day: "Tue", open: "09:00", close: "18:00" },
        { day: "Wed", open: "09:00", close: "18:00" },
        { day: "Thu", open: "09:00", close: "18:00" },
        { day: "Fri", open: "09:00", close: "18:00" },
      ],
    },
    null,
    2,
  ),
  botEnabled: true,
  privacyNotice:
    "We process your messages to provide support. Do not share passwords or payment card numbers in chat.",
  allowedDomainsText: "localhost\n127.0.0.1",
  prechatNameEnabled: true,
  prechatEmailEnabled: true,
  prechatPhoneEnabled: true,
  prechatMessageEnabled: true,
  prechatMessageRequired: true,
});

/** Build admin config from local `WidgetDraft` (offline / API-fallback). */
export function widgetAdminConfigFromWidgetDraft(d: WidgetDraft): WidgetAdminConfig {
  const base = defaultWidgetAdminConfig(d.widgetId);
  return {
    ...base,
    widgetId: d.widgetId,
    type: d.type,
    completed: d.completed,
    headerTitle: d.headerTitle,
    headerTitleAlign: d.headerTitleAlign,
    logoUrl: d.logoUrl ?? "",
    logoDataUrl: "",
    buttonColor: d.buttonColor,
    buttonHoverColor: d.buttonHoverColor,
    iconColor: d.iconColor,
    textColor: d.textColor,
    buttonShape: d.buttonShape,
    buttonPosition: d.buttonPosition,
    iconDataUrl: d.iconDataUrl,
    greetingMessage: d.greetingMessage,
    startChatLabel: d.startChatLabel,
    sendPlaceholder: d.sendPlaceholder,
    bannerOn: d.bannerOn,
    bannerTitle: d.bannerTitle,
    bannerDescription: d.bannerDescription,
    bannerDataUrl: d.bannerDataUrl,
    boxWidth: d.boxWidth,
    boxHeight: d.boxHeight,
    operatingHoursJson: d.operatingHoursJson?.trim() ? d.operatingHoursJson : base.operatingHoursJson,
    botEnabled: d.botEnabled ?? base.botEnabled,
    privacyNotice: d.privacyNotice ?? base.privacyNotice,
    allowedDomainsText: d.allowedDomainsText ?? base.allowedDomainsText,
    prechatNameEnabled: d.prechatNameEnabled ?? base.prechatNameEnabled,
    prechatEmailEnabled: d.prechatEmailEnabled ?? base.prechatEmailEnabled,
    prechatPhoneEnabled: d.prechatPhoneEnabled ?? base.prechatPhoneEnabled,
    prechatMessageEnabled: d.prechatMessageEnabled ?? base.prechatMessageEnabled,
    prechatMessageRequired: d.prechatMessageRequired ?? base.prechatMessageRequired,
  };
}

function pickBool(o: Record<string, unknown>, keys: string[], fallback: boolean): boolean {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "boolean") return v;
    if (v === "true" || v === "1") return true;
    if (v === "false" || v === "0") return false;
  }
  return fallback;
}

function pickNumLoose(o: Record<string, unknown>, keys: string[], fallback: number): number {
  for (const k of keys) {
    const v = o[k];
    const n = typeof v === "number" ? v : Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function parseDomainsText(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return raw.map((x) => String(x).trim()).filter(Boolean).join("\n");
  return "";
}

/** Map API payload (possibly wrapped in `{ data }`) into `WidgetAdminConfig`. */
export function widgetAdminConfigFromApi(raw: unknown, fallbackWidgetId: string): WidgetAdminConfig {
  const data = unwrapApiData(raw);
  const o = isRecord(data) ? data : {};
  const pre = isRecord(o["prechatForm"]) ? (o["prechatForm"] as Record<string, unknown>) : {};
  const name = isRecord(pre["name"]) ? (pre["name"] as Record<string, unknown>) : {};
  const email = isRecord(pre["email"]) ? (pre["email"] as Record<string, unknown>) : {};
  const phone = isRecord(pre["phone"]) ? (pre["phone"] as Record<string, unknown>) : {};
  const message = isRecord(pre["message"]) ? (pre["message"] as Record<string, unknown>) : {};

  const wid = pickStr(o, ["widgetId", "id"]) || fallbackWidgetId;
  const base = defaultWidgetAdminConfig(wid);

  let hoursJson = "";
  const oh = o["operatingHours"];
  if (typeof oh === "string") hoursJson = oh;
  else if (oh !== undefined) {
    try {
      hoursJson = JSON.stringify(oh, null, 2);
    } catch {
      hoursJson = "";
    }
  }

  return {
    ...base,
    widgetId: wid,
    type: (pickStr(o, ["type"]) as WidgetKind) || base.type,
    completed: pickBool(o, ["completed"], base.completed),
    headerTitle: pickStr(o, ["headerTitle", "brandTitle", "title"]) || base.headerTitle,
    headerTitleAlign: (pickStr(o, ["headerTitleAlign"]) as HeaderTitleAlign) || base.headerTitleAlign,
    logoUrl: pickStr(o, ["logoUrl", "brandLogoUrl", "logo"]) || base.logoUrl,
    logoDataUrl: pickStr(o, ["logoDataUrl"]) || base.logoDataUrl,
    buttonColor: pickStr(o, ["buttonColor", "primaryColor"]) || base.buttonColor,
    buttonHoverColor: pickStr(o, ["buttonHoverColor", "primaryHoverColor"]) || base.buttonHoverColor,
    iconColor: pickStr(o, ["iconColor"]) || base.iconColor,
    textColor: pickStr(o, ["textColor", "headerTextColor"]) || base.textColor,
    buttonShape: (pickStr(o, ["buttonShape"]) as ButtonShape) || base.buttonShape,
    buttonPosition: (pickStr(o, ["buttonPosition"]) as ButtonPosition) || base.buttonPosition,
    iconDataUrl: pickStr(o, ["iconDataUrl", "launcherIconUrl"]) || base.iconDataUrl,
    greetingMessage: pickStr(o, ["greetingMessage", "welcomeText", "welcomeMessage"]) || base.greetingMessage,
    startChatLabel: pickStr(o, ["startChatLabel", "sendLabel"]) || base.startChatLabel,
    sendPlaceholder: pickStr(o, ["sendPlaceholder", "composerPlaceholder"]) || base.sendPlaceholder,
    bannerOn: pickBool(o, ["bannerOn", "bannerEnabled"], base.bannerOn),
    bannerTitle: pickStr(o, ["bannerTitle"]) || base.bannerTitle,
    bannerDescription: pickStr(o, ["bannerDescription"]) || base.bannerDescription,
    bannerDataUrl: pickStr(o, ["bannerDataUrl"]) || base.bannerDataUrl,
    boxWidth: pickNumLoose(o, ["boxWidth", "width"], base.boxWidth),
    boxHeight: pickNumLoose(o, ["boxHeight", "height"], base.boxHeight),
    operatingHoursJson: hoursJson || base.operatingHoursJson,
    botEnabled: pickBool(o, ["botEnabled", "aiEnabled", "botOn"], base.botEnabled),
    privacyNotice: pickStr(o, ["privacyNotice", "privacyPolicy", "privacyText"]) || base.privacyNotice,
    allowedDomainsText: parseDomainsText(o["allowedDomains"]) || base.allowedDomainsText,
    prechatNameEnabled: pickBool(name, ["enabled", "show"], base.prechatNameEnabled),
    prechatEmailEnabled: pickBool(email, ["enabled", "show"], base.prechatEmailEnabled),
    prechatPhoneEnabled: pickBool(phone, ["enabled", "show"], base.prechatPhoneEnabled),
    prechatMessageEnabled: pickBool(message, ["enabled", "show"], base.prechatMessageEnabled),
    prechatMessageRequired: pickBool(message, ["required"], base.prechatMessageRequired),
  };
}

/** Resolve logo URL from typical upload API envelopes. */
export function logoUrlFromUploadResponse(raw: unknown): string {
  const data = unwrapApiData(raw);
  const o = isRecord(data) ? data : {};
  return (
    pickStr(o, ["url", "logoUrl", "publicUrl", "href"]) ||
    pickStr(isRecord(o["data"]) ? (o["data"] as Record<string, unknown>) : null, ["url", "logoUrl"]) ||
    ""
  );
}

export function allowedDomainsToList(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Persist admin fields into local `WidgetDraft` cache (embed preview / script builder). */
export function adminConfigToWidgetDraftPartial(c: WidgetAdminConfig): Partial<WidgetDraft> {
  return {
    widgetId: c.widgetId,
    type: c.type,
    completed: c.completed,
    headerTitle: c.headerTitle,
    headerTitleAlign: c.headerTitleAlign,
    buttonColor: c.buttonColor,
    buttonHoverColor: c.buttonHoverColor,
    iconColor: c.iconColor,
    textColor: c.textColor,
    buttonShape: c.buttonShape,
    buttonPosition: c.buttonPosition,
    iconDataUrl: c.iconDataUrl,
    greetingMessage: c.greetingMessage,
    startChatLabel: c.startChatLabel,
    sendPlaceholder: c.sendPlaceholder,
    bannerOn: c.bannerOn,
    bannerTitle: c.bannerTitle,
    bannerDescription: c.bannerDescription,
    bannerDataUrl: c.bannerDataUrl,
    boxWidth: c.boxWidth,
    boxHeight: c.boxHeight,
    logoUrl: c.logoUrl,
    operatingHoursJson: c.operatingHoursJson,
    botEnabled: c.botEnabled,
    privacyNotice: c.privacyNotice,
    allowedDomainsText: c.allowedDomainsText,
    prechatNameEnabled: c.prechatNameEnabled,
    prechatEmailEnabled: c.prechatEmailEnabled,
    prechatPhoneEnabled: c.prechatPhoneEnabled,
    prechatMessageEnabled: c.prechatMessageEnabled,
    prechatMessageRequired: c.prechatMessageRequired,
  };
}

export function widgetAdminConfigToApiBody(c: WidgetAdminConfig): Record<string, unknown> {
  let operatingHours: unknown = c.operatingHoursJson.trim();
  if (typeof operatingHours === "string" && operatingHours) {
    try {
      operatingHours = JSON.parse(operatingHours) as unknown;
    } catch {
      operatingHours = { raw: c.operatingHoursJson };
    }
  }

  return {
    widgetId: c.widgetId,
    type: c.type,
    completed: c.completed,
    headerTitle: c.headerTitle,
    headerTitleAlign: c.headerTitleAlign,
    logoUrl: c.logoUrl || undefined,
    buttonColor: c.buttonColor,
    buttonHoverColor: c.buttonHoverColor,
    iconColor: c.iconColor,
    textColor: c.textColor,
    buttonShape: c.buttonShape,
    buttonPosition: c.buttonPosition,
    iconDataUrl: c.iconDataUrl || undefined,
    greetingMessage: c.greetingMessage,
    startChatLabel: c.startChatLabel,
    sendPlaceholder: c.sendPlaceholder,
    bannerOn: c.bannerOn,
    bannerTitle: c.bannerTitle,
    bannerDescription: c.bannerDescription,
    bannerDataUrl: c.bannerDataUrl || undefined,
    boxWidth: c.boxWidth,
    boxHeight: c.boxHeight,
    operatingHours,
    botEnabled: c.botEnabled,
    privacyNotice: c.privacyNotice,
    allowedDomains: allowedDomainsToList(c.allowedDomainsText),
    prechatForm: {
      name: { enabled: c.prechatNameEnabled, required: false },
      email: { enabled: c.prechatEmailEnabled, required: false },
      phone: { enabled: c.prechatPhoneEnabled, required: false },
      message: { enabled: c.prechatMessageEnabled, required: c.prechatMessageRequired },
    },
  };
}
