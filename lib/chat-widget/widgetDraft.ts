"use client";

export type WidgetKind = "chat" | "text";

export interface WidgetDraft {
  type: WidgetKind;
  widgetId: string;
  completed: boolean;
  buttonShape: "circle" | "rounded" | "square";
  buttonPosition: "left" | "center" | "right";
  buttonColor: string;
  buttonHoverColor: string;
  iconColor: string;
  iconDataUrl: string;
  headerTitleAlign: "Center" | "Left";
  headerTitle: string;
  textColor: string;
  greetingMessage: string;
  startChatLabel: string;
  sendPlaceholder: string;
  bannerOn: boolean;
  bannerTitle: string;
  bannerDescription: string;
  bannerDataUrl: string;
  boxWidth: number;
  boxHeight: number;
  /** Brand logo URL (CDN) when configured via admin. */
  logoUrl?: string;
  operatingHoursJson?: string;
  botEnabled?: boolean;
  privacyNotice?: string;
  allowedDomainsText?: string;
  prechatNameEnabled?: boolean;
  prechatEmailEnabled?: boolean;
  prechatPhoneEnabled?: boolean;
  prechatMessageEnabled?: boolean;
  prechatMessageRequired?: boolean;
}

const STORAGE_KEY = "chat_widget_draft_v1";

export const defaultWidgetDraft: WidgetDraft = {
  type: "chat",
  widgetId: "12345",
  completed: false,
  buttonShape: "circle",
  buttonPosition: "right",
  buttonColor: "#1E63D5",
  buttonHoverColor: "#164EB0",
  iconColor: "#FFFFFF",
  iconDataUrl: "",
  headerTitleAlign: "Center",
  headerTitle: "AI Sales Assistant",
  textColor: "#FFFFFF",
  greetingMessage: "Welcome to Florida Luxurious. Tell me your budget, location, and property type preference.",
  startChatLabel: "Send",
  sendPlaceholder: "Ask about location, budget, or options...",
  bannerOn: true,
  bannerTitle: "Special Offer",
  bannerDescription: "Get 20% off all premium plans today.",
  bannerDataUrl: "",
  boxWidth: 350,
  boxHeight: 430,
  logoUrl: "",
  operatingHoursJson: "",
  botEnabled: true,
  privacyNotice: "",
  allowedDomainsText: "",
  prechatNameEnabled: true,
  prechatEmailEnabled: true,
  prechatPhoneEnabled: true,
  prechatMessageEnabled: true,
  prechatMessageRequired: true,
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readWidgetDraft(): WidgetDraft {
  if (!canUseStorage()) return defaultWidgetDraft;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultWidgetDraft;
    const parsed = JSON.parse(raw) as Partial<WidgetDraft>;
    return { ...defaultWidgetDraft, ...parsed };
  } catch {
    return defaultWidgetDraft;
  }
}

export function saveWidgetDraft(update: Partial<WidgetDraft>) {
  if (!canUseStorage()) return;
  const current = readWidgetDraft();
  const next: WidgetDraft = { ...current, ...update };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/\r?\n/g, " ");
}

export type BuildWidgetScriptOptions = {
  /** Absolute origin of this Next app (e.g. https://app.example.com). Used for the loader script src. */
  scriptOrigin?: string;
};

export function buildWidgetScript(draft: WidgetDraft, options?: BuildWidgetScriptOptions) {
  if (draft.type !== "chat") {
    return `<script src="https://widget.company.com/text-widget.js" data-id="${escapeHtmlAttr(draft.widgetId)}" defer></script>`;
  }

  const origin = (options?.scriptOrigin ?? "https://YOUR_APP_ORIGIN").replace(/\/+$/, "");
  const attrs = [
    `src="${origin}/embed/loader.js"`,
    `data-widget-id="${escapeHtmlAttr(draft.widgetId)}"`,
    `data-brand-title="${escapeHtmlAttr(draft.headerTitle)}"`,
    `data-greeting="${escapeHtmlAttr(draft.greetingMessage)}"`,
    `data-accent="${escapeHtmlAttr(draft.buttonColor)}"`,
    `data-mode="iframe"`,
    `defer`,
  ];
  return `<script ${attrs.join(" ")}></script>`;
}
