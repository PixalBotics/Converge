"use client";

export type WidgetKind = "chat" | "text";

/** Phosphor-style chat icons (`react-icons/pi` duotone), see https://phosphoricons.com/?q=chat */
export type LauncherIconPresetId =
  | ""
  | "phosphor-chat-circle"
  | "phosphor-chats-circle"
  | "phosphor-chat-dots"
  | "phosphor-chat-teardrop";

export type WidgetInstallChatMode = "AI_ONLY" | "AGENT_ONLY" | "HYBRID";

export interface TextUsFormFieldDraft {
  key: string;
  label: string;
  fieldType: string;
  required?: boolean;
}

export interface WidgetDraft {
  type: WidgetKind;
  /** Target site for `POST /widgets/installations`. */
  websiteId?: string;
  /** Persisted tenant path on Add Widget (website list scoped by child company). */
  tenantResellerId?: string;
  tenantParentCompanyId?: string;
  tenantChildCompanyId?: string;
  /** Backend `widgetKey` after `POST /widgets/installations` (draft create) or PATCH. */
  remoteWidgetKey?: string;
  /** Backend flag when draft saved without deploy key (`publishNow: false`). */
  requiresPublishBeforeEmbed?: boolean;
  /** Chat routing mode stored as WidgetWebsiteConfig.mode. */
  chatMode?: WidgetInstallChatMode;
  /** Allowed embedding domains (hostname strings). */
  allowedDomains?: string[];
  widgetId: string;
  completed: boolean;
  buttonShape: "circle" | "rounded" | "square";
  buttonPosition: "left" | "center" | "right";
  /** Launcher FAB distance from viewport bottom (px); larger moves the button upward. */
  launcherInsetBottomPx: number;
  /** Distance from left/right screen edge matching `buttonPosition`; from bottom center when `center` (horizontal shift, px). */
  launcherInsetSidePx: number;
  buttonColor: string;
  buttonHoverColor: string;
  iconColor: string;
  iconDataUrl: string;
  /** When set and `iconDataUrl` is empty, FAB uses preset Phosphor-style icon */
  launcherIconPreset: LauncherIconPresetId;
  headerTitleAlign: "Center" | "Left";
  headerTitle: string;
  textColor: string;
  greetingMessage: string;
  sendPlaceholder: string;
  bannerOn: boolean;
  bannerTitle: string;
  bannerDescription: string;
  bannerDataUrl: string;
  bannerMediaType: "image" | "video";
  boxWidth: number;
  boxHeight: number;
  /** Text Us surface (dashboard builder). */
  textUsButtonColor?: string;
  textUsPosition?: string;
  textUsHeaderTitle?: string;
  textUsWelcomeMessage?: string;
  textUsFormFields?: TextUsFormFieldDraft[];
  /** Brand theme (PATCH `config.theme`) — optional; sensible fallbacks in patch builders. */
  themeName?: string;
  themePrimaryColor?: string;
  themeSecondaryColor?: string;
  themeFontFamily?: string;
  themeBubbleStyle?: string;
  themeBorderRadiusPx?: number;
  themeWelcomeFontSizePx?: number;
  themeBodyFontSizePx?: number;
  themeInputFontSizePx?: number;
  themeCtaFontSizePx?: number;
  themeConsentFontSizePx?: number;
  themeLineHeightPx?: number;
  themeDesignJsonAccent?: string;
  themeDesignJsonDensity?: string;
  /** Step 2 PATCH `config.ui` */
  buttonLabel?: string;
  firstMessage?: string;
  messagePlaceholder?: string;
  backgroundColor?: string;
  popupEnabled?: boolean;
  /** `theme.designJson.chat.colors` — embed UI tokens (step 2). */
  chatBodyText?: string;
  chatMutedText?: string;
  incomingMessageBg?: string;
  incomingMessageText?: string;
  outgoingMessageBg?: string;
  outgoingMessageText?: string;
  greetingBubbleBg?: string;
  greetingBubbleText?: string;
  inputBackground?: string;
  inputText?: string;
  inputBorderColor?: string;
  inputPlaceholderColor?: string;
  labelColor?: string;
  inquiryPillBg?: string;
  inquiryPillText?: string;
  inquiryPillBorder?: string;
  inquiryPillSelectedBg?: string;
  inquiryPillSelectedText?: string;
  handoverButtonBg?: string;
  handoverButtonText?: string;
  handoverButtonBorder?: string;
  /** Step 3 PATCH `config.behavior` */
  botEnabled?: boolean;
  notificationEnabled?: boolean;
  browserNotification?: boolean;
  soundNotification?: boolean;
  fallbackNotificationText?: string;
  videoWelcomeOn?: boolean;
  /** When false, inquiry topic pills are hidden (step 2 toggle). */
  inquiryOn?: boolean;
  inquiryOptions?: string[];
  welcomeMessageBehavior?: string;
  autoOpenEnabled?: boolean;
  autoOpenDelaySeconds?: number;
  fileUploadEnabled?: boolean;
  emojiEnabled?: boolean;
  consentRequired?: boolean;
  consentText?: string;
  privacyPolicyUrl?: string;
  privacyNotice?: string;
  allowedDomainsText?: string;
  /** Step 3 PATCH `config.session` */
  persistVisitorSession?: boolean;
  sessionTtlMinutes?: number;
  /** Step 3 PATCH `config.form` */
  formEnabled?: boolean;
  formTitle?: string;
  formSubtitle?: string;
  formSubmitLabel?: string;
  prechatNameEnabled?: boolean;
  prechatEmailEnabled?: boolean;
  prechatPhoneEnabled?: boolean;
  prechatMessageEnabled?: boolean;
  prechatMessageRequired?: boolean;
  /** Step 3 PATCH `config.response` */
  responseWelcomeMessage?: string;
  responseOfflineMessage?: string;
  responseGreetingMessage?: string;
  responseSendPlaceholder?: string;
  responseAiPromptHint?: string;
  responseAgentHandoverEnabled?: boolean;
  responseHandoverTriggerText?: string;
}

const STORAGE_KEY = "chat_widget_draft_v1";

export const defaultWidgetDraft: WidgetDraft = {
  type: "chat",
  websiteId: undefined,
  chatMode: "HYBRID",
  allowedDomains: undefined,
  widgetId: "12345",
  completed: false,
  buttonShape: "circle",
  buttonPosition: "right",
  launcherInsetBottomPx: 28,
  launcherInsetSidePx: 28,
  buttonColor: "#1E63D5",
  buttonHoverColor: "#164EB0",
  iconColor: "#FFFFFF",
  iconDataUrl: "",
  launcherIconPreset: "phosphor-chat-circle",
  headerTitleAlign: "Center",
  headerTitle: "AI Sales Assistant",
  textColor: "#FFFFFF",
  greetingMessage: "Welcome to Florida Luxurious. Tell me your budget, location, and property type preference.",
  sendPlaceholder: "Ask about location, budget, or options...",
  bannerOn: true,
  bannerTitle: "Special Offer",
  bannerDescription: "Get 20% off all premium plans today.",
  bannerDataUrl: "",
  bannerMediaType: "image",
  boxWidth: 350,
  boxHeight: 430,
  textUsButtonColor: "#da9b2f",
  textUsPosition: "center",
  textUsHeaderTitle: "Special Offer",
  textUsWelcomeMessage: "Get 20% off all premium plans today.",
  themeName: "Brand Default",
  themeSecondaryColor: "#64748b",
  themeFontFamily: "Inter, system-ui, sans-serif",
  themeBubbleStyle: "rounded",
  themeBorderRadiusPx: 12,
  themeWelcomeFontSizePx: 18,
  themeBodyFontSizePx: 14,
  themeInputFontSizePx: 14,
  themeCtaFontSizePx: 15,
  themeConsentFontSizePx: 12,
  themeLineHeightPx: 22,
  themeDesignJsonAccent: "blue",
  themeDesignJsonDensity: "comfortable",
  buttonLabel: "Chat with us",
  firstMessage: "Hi! How can we help today?",
  messagePlaceholder: "Write here…",
  backgroundColor: "#f8fafc",
  popupEnabled: false,
  botEnabled: true,
  notificationEnabled: true,
  browserNotification: true,
  soundNotification: false,
  fallbackNotificationText: "You have a new message from support.",
  videoWelcomeOn: false,
  welcomeMessageBehavior: "Thanks for reaching out.",
  autoOpenEnabled: false,
  autoOpenDelaySeconds: 10,
  fileUploadEnabled: true,
  emojiEnabled: true,
  consentRequired: true,
  consentText: "I agree to the chat terms and privacy policy.",
  privacyPolicyUrl: "https://www.example.com/privacy",
  privacyNotice: "We process messages per our privacy policy.",
  allowedDomainsText: "Only use this widget on approved domains.",
  persistVisitorSession: true,
  sessionTtlMinutes: 120,
  formEnabled: true,
  formTitle: "Before we start",
  formSubtitle: "Tell us who you are",
  formSubmitLabel: "Start chat",
  prechatNameEnabled: true,
  prechatEmailEnabled: true,
  prechatPhoneEnabled: false,
  prechatMessageEnabled: true,
  prechatMessageRequired: false,
  responseWelcomeMessage: "Hello! A teammate will join shortly.",
  responseOfflineMessage: "We are offline; leave a message and we will reply.",
  responseGreetingMessage: "Good day!",
  responseSendPlaceholder: "Ask us anything…",
  responseAiPromptHint: "Be concise and helpful.",
  responseAgentHandoverEnabled: true,
  responseHandoverTriggerText: "talk to human",
  inquiryOn: false,
  inquiryOptions: ["Billing", "Technical", "Sales"],
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

const LAUNCHER_PRESET_IDS = new Set<string>([
  "",
  "phosphor-chat-circle",
  "phosphor-chats-circle",
  "phosphor-chat-dots",
  "phosphor-chat-teardrop",
]);

function normalizeLauncherIconPreset(value: unknown): LauncherIconPresetId {
  if (value === "") return "";
  if (typeof value === "string" && LAUNCHER_PRESET_IDS.has(value)) {
    return value as LauncherIconPresetId;
  }
  return defaultWidgetDraft.launcherIconPreset;
}

function clampLauncherInsetPx(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number.parseInt(value, 10) : Number.NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(240, Math.max(0, Math.round(n)));
}

const CHAT_MODES = new Set<string>(["AI_ONLY", "AGENT_ONLY", "HYBRID"]);

function normalizeChatMode(value: unknown): WidgetInstallChatMode | undefined {
  if (typeof value !== "string") return undefined;
  const up = value.toUpperCase();
  return CHAT_MODES.has(up) ? (up as WidgetInstallChatMode) : undefined;
}

/** Merge defaults + partial stored JSON with the same coercion as `readWidgetDraft`. */
export function mergePartialWidgetDraft(parsed: Partial<WidgetDraft>): WidgetDraft {
  return {
    ...defaultWidgetDraft,
    ...parsed,
    chatMode: normalizeChatMode(parsed.chatMode) ?? defaultWidgetDraft.chatMode,
    launcherIconPreset: normalizeLauncherIconPreset(parsed.launcherIconPreset),
    launcherInsetBottomPx: clampLauncherInsetPx(
      parsed.launcherInsetBottomPx,
      defaultWidgetDraft.launcherInsetBottomPx,
    ),
    launcherInsetSidePx: clampLauncherInsetPx(
      parsed.launcherInsetSidePx,
      defaultWidgetDraft.launcherInsetSidePx,
    ),
  };
}

export function readWidgetDraft(): WidgetDraft {
  if (!canUseStorage()) return defaultWidgetDraft;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultWidgetDraft;
    const parsed = JSON.parse(raw) as Partial<WidgetDraft>;
    return mergePartialWidgetDraft(parsed);
  } catch {
    return defaultWidgetDraft;
  }
}

export function saveWidgetDraft(update: Partial<WidgetDraft>) {
  if (!canUseStorage()) return;
  const current = readWidgetDraft();
  const next: WidgetDraft = { ...current, ...update };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return;
  } catch {
    // Fallback for large base64 uploads (especially videos) that exceed localStorage quota.
    const withoutBannerMedia: WidgetDraft = {
      ...next,
      bannerDataUrl: "",
      bannerMediaType: "image",
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withoutBannerMedia));
      return;
    } catch {
      const withoutAnyMedia: WidgetDraft = {
        ...withoutBannerMedia,
        iconDataUrl: "",
      };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withoutAnyMedia));
      } catch {
        // Ignore persistence failure to avoid runtime crash.
      }
    }
  }
}

function resolveWidgetEmbedOrigin(): string {
  const originRaw =
    (typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : null) ??
    process.env.NEXT_PUBLIC_WIDGET_EMBED_ORIGIN ??
    "";

  return typeof originRaw === "string" && originRaw.length > 0
    ? originRaw.replace(/\/+$/, "")
    : "https://your-app.example";
}

/** Unified loader tag used after install (`GET .../embed-snippet` may return fuller HTML). */
export function buildUnifiedWidgetEmbedScript(input: {
  widgetKey: string;
  appOrigin?: string;
}) {
  const origin = (input.appOrigin ?? resolveWidgetEmbedOrigin()).replace(
    /\/+$/,
    "",
  );
  return `<!-- Unified widget loader (session JWT fetched at runtime via POST /widget/session) -->
<script src="${origin}/widget.js" data-widget-key="${input.widgetKey}" data-app-origin="${origin}" defer></script>`;
}

export function buildWidgetScript(
  draft: WidgetDraft,
  options?: { appOrigin?: string },
) {
  const origin = options?.appOrigin ?? resolveWidgetEmbedOrigin();
  return buildUnifiedWidgetEmbedScript({
    widgetKey: draft.widgetId || "YOUR_WIDGET_KEY",
    appOrigin: origin,
  });
}
