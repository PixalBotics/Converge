import { isRecord } from "@/lib/utils";
import type { JsonRecord } from "@/api/types/common.types";
import { widgetResponseData } from "@/api/widgets/widgets.api";
import type { WidgetDraft, WidgetInstallChatMode } from "./widgetDraft";
import { defaultWidgetDraft } from "./widgetDraft";
import { mapApiChatColorsToDraft, widgetChatColorsDraftToPatch } from "./widget-colors-draft";
import { normalizeWidgetAiType, parseAiTypeFromConfigRoot } from "./widget-ai-type";

function pickStr(obj: unknown, keys: string[]): string {
  if (!isRecord(obj)) return "";
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function pickNum(obj: unknown, keys: string[]): number | undefined {
  if (!isRecord(obj)) return undefined;
  for (const k of keys) {
    const v = obj[k];
    const n = typeof v === "number" ? v : typeof v === "string" ? Number.parseFloat(v) : NaN;
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function pickBool(obj: unknown, keys: string[]): boolean | undefined {
  if (!isRecord(obj)) return undefined;
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "boolean") return v;
  }
  return undefined;
}

const LAUNCHER_PRESET_IDS = new Set<string>([
  "",
  "phosphor-chat-circle",
  "phosphor-chats-circle",
  "phosphor-chat-dots",
  "phosphor-chat-teardrop",
]);

function normalizeLauncherIconPresetFromApi(value: string): WidgetDraft["launcherIconPreset"] {
  if (LAUNCHER_PRESET_IDS.has(value)) return value as WidgetDraft["launcherIconPreset"];
  return defaultWidgetDraft.launcherIconPreset;
}

function normalizeHeaderAlign(raw: string): "Center" | "Left" {
  const s = raw.trim().toLowerCase();
  if (s === "left") return "Left";
  return "Center";
}

function normalizeChatMode(raw: string): WidgetInstallChatMode | undefined {
  const u = raw.toUpperCase();
  if (u === "AI_ONLY" || u === "AGENT_ONLY" || u === "HYBRID") return u as WidgetInstallChatMode;
  return undefined;
}

function shapeToButtonShape(shape: string): WidgetDraft["buttonShape"] {
  const s = shape.toLowerCase();
  if (s === "square") return "square";
  if (s === "rounded" || s === "pill") return "rounded";
  return "circle";
}

function pickRecord(obj: unknown, keys: string[]): JsonRecord | null {
  if (!isRecord(obj)) return null;
  for (const k of keys) {
    const v = obj[k];
    if (isRecord(v)) return v as JsonRecord;
  }
  return null;
}

function firstRecord(...values: Array<JsonRecord | null | undefined>): JsonRecord | null {
  for (const v of values) {
    if (isRecord(v)) return v;
  }
  return null;
}

/**
 * Maps `GET /widgets/:widgetKey` (admin) payload into `WidgetDraft` fields used by the 3-step CHAT wizard + PATCH builders.
 */
export function mapAdminWidgetResponseToWidgetDraft(
  payload: unknown,
  widgetKey: string,
): Partial<WidgetDraft> {
  const root = widgetResponseData<JsonRecord>(payload as never);
  if (!isRecord(root)) return { remoteWidgetKey: widgetKey, widgetId: widgetKey };

  const config = isRecord(root.config) ? root.config : null;
  const theme = config && isRecord(config.theme) ? config.theme : null;
  const settingsJson =
    config && isRecord(config.settingsJson) ? (config.settingsJson as JsonRecord) : null;
  const dj =
    theme && isRecord(theme.designJson) ? (theme.designJson as JsonRecord) : null;
  const djUi = pickRecord(dj, ["ui"]);
  const djForm = pickRecord(dj, ["form"]);
  const djBehavior = pickRecord(dj, ["behavior"]);
  const djSession = pickRecord(dj, ["session"]);
  const djResponse = pickRecord(dj, ["response"]);
  const djTheme = pickRecord(dj, ["theme"]);
  const chat = dj && isRecord(dj.chat) ? (dj.chat as JsonRecord) : null;
  const launcher = chat && isRecord(chat.launcher) ? (chat.launcher as JsonRecord) : null;
  const chatBox = chat && isRecord(chat.chatBox) ? (chat.chatBox as JsonRecord) : null;
  const colors = chat && isRecord(chat.colors) ? (chat.colors as JsonRecord) : null;

  const ui = firstRecord(pickRecord(config, ["ui"]), pickRecord(settingsJson, ["ui"]), djUi);
  const behavior = firstRecord(
    pickRecord(config, ["behavior"]),
    pickRecord(settingsJson, ["behavior"]),
    djBehavior,
  );
  const session = firstRecord(
    pickRecord(config, ["session"]),
    pickRecord(settingsJson, ["session"]),
    djSession,
  );
  const form = firstRecord(pickRecord(config, ["form"]), pickRecord(settingsJson, ["form"]), djForm);
  const response = firstRecord(
    pickRecord(config, ["response"]),
    pickRecord(settingsJson, ["response"]),
    djResponse,
  );

  const websiteId = pickStr(root, ["websiteId", "website_id"]);
  const chatModeRaw =
    pickStr(config ?? {}, ["chatMode", "chat_mode", "mode"]) ||
    pickStr(root, ["chatMode", "chat_mode", "mode"]);
  const allowedDomainsRaw = config?.allowedDomains ?? root.allowedDomains;
  const allowedDomains = Array.isArray(allowedDomainsRaw)
    ? allowedDomainsRaw.filter((x): x is string => typeof x === "string" && x.trim().length > 0).map((s) => s.trim())
    : undefined;

  const inquiryRaw = behavior?.inquiryOptions;
  const inquiryOptions = Array.isArray(inquiryRaw)
    ? inquiryRaw.filter((x): x is string => typeof x === "string").map((s) => s.trim())
    : defaultWidgetDraft.inquiryOptions;

  const headerAlignRaw =
    pickStr(chatBox ?? {}, ["headerAlign", "headerTitleAlign"]) ||
    pickStr(ui ?? {}, ["headerTitleAlign"]) ||
    "Center";

  const patch: Partial<WidgetDraft> = {
    type: "chat",
    remoteWidgetKey: widgetKey,
    widgetId: widgetKey,
    websiteId: websiteId || undefined,
    completed: false,
    chatMode: normalizeChatMode(chatModeRaw) ?? defaultWidgetDraft.chatMode,
    aiType: parseAiTypeFromConfigRoot({
      ...(config ?? {}),
      ...(root as Record<string, unknown>),
    }),
    allowedDomains: allowedDomains?.length ? allowedDomains : undefined,
    themeName: pickStr(theme ?? {}, ["name"]) || defaultWidgetDraft.themeName,
    themePrimaryColor: pickStr(theme ?? {}, ["primaryColor", "primary_color"]) || undefined,
    themeSecondaryColor:
      pickStr(theme ?? {}, ["secondaryColor", "secondary_color"]) ||
      defaultWidgetDraft.themeSecondaryColor,
    themeFontFamily: pickStr(theme ?? {}, ["fontFamily", "font_family"]) || defaultWidgetDraft.themeFontFamily,
    themeBubbleStyle: pickStr(theme ?? {}, ["bubbleStyle", "bubble_style"]) || defaultWidgetDraft.themeBubbleStyle,
    themeBorderRadiusPx:
      pickNum(theme ?? {}, ["borderRadiusPx", "border_radius_px"]) ?? defaultWidgetDraft.themeBorderRadiusPx,
    themeWelcomeFontSizePx:
      pickNum(theme ?? {}, ["welcomeFontSizePx", "welcome_font_size_px"]) ??
      defaultWidgetDraft.themeWelcomeFontSizePx,
    themeBodyFontSizePx:
      pickNum(theme ?? {}, ["bodyFontSizePx", "body_font_size_px"]) ?? defaultWidgetDraft.themeBodyFontSizePx,
    themeInputFontSizePx:
      pickNum(theme ?? {}, ["inputFontSizePx", "input_font_size_px"]) ?? defaultWidgetDraft.themeInputFontSizePx,
    themeCtaFontSizePx:
      pickNum(theme ?? {}, ["ctaFontSizePx", "cta_font_size_px"]) ?? defaultWidgetDraft.themeCtaFontSizePx,
    themeConsentFontSizePx:
      pickNum(theme ?? {}, ["consentFontSizePx", "consent_font_size_px"]) ??
      defaultWidgetDraft.themeConsentFontSizePx,
    themeLineHeightPx:
      pickNum(theme ?? {}, ["lineHeightPx", "line_height_px"]) ?? defaultWidgetDraft.themeLineHeightPx,
    themeDesignJsonAccent:
      isRecord(dj) && typeof dj.accent === "string" ? dj.accent : defaultWidgetDraft.themeDesignJsonAccent,
    themeDesignJsonDensity:
      isRecord(dj) && typeof dj.density === "string" ? dj.density : defaultWidgetDraft.themeDesignJsonDensity,
    buttonShape: launcher ? shapeToButtonShape(pickStr(launcher, ["shape"]) || "circle") : defaultWidgetDraft.buttonShape,
    buttonPosition:
      (pickStr(launcher ?? ui ?? theme ?? {}, ["position", "buttonPosition"]) as WidgetDraft["buttonPosition"]) ||
      defaultWidgetDraft.buttonPosition,
    launcherInsetBottomPx:
      pickNum(launcher ?? ui ?? {}, ["insetBottomPx", "launcherInsetBottomPx"]) ??
      defaultWidgetDraft.launcherInsetBottomPx,
    launcherInsetSidePx:
      pickNum(launcher ?? ui ?? {}, ["insetSidePx", "launcherInsetSidePx"]) ??
      defaultWidgetDraft.launcherInsetSidePx,
    buttonColor: pickStr(colors ?? {}, ["button"]) || pickStr(theme ?? {}, ["primaryColor"]) || defaultWidgetDraft.buttonColor,
    buttonHoverColor:
      pickStr(colors ?? {}, ["buttonHover", "button_hover"]) ||
      pickStr(ui ?? {}, ["buttonHoverColor", "button_hover_color"]) ||
      pickStr(theme ?? {}, ["buttonHoverColor", "button_hover_color"]) ||
      defaultWidgetDraft.buttonHoverColor,
    iconColor: pickStr(colors ?? {}, ["icon"]) || defaultWidgetDraft.iconColor,
    launcherIconPreset: normalizeLauncherIconPresetFromApi(
      pickStr(launcher ?? ui ?? {}, ["iconPreset", "launcherIconPreset"]),
    ),
    headerTitleAlign: normalizeHeaderAlign(headerAlignRaw),
    headerTitle:
      pickStr(chatBox ?? {}, ["headerTitle"]) ||
      pickStr(ui ?? {}, ["headerTitle"]) ||
      defaultWidgetDraft.headerTitle,
    textColor:
      pickStr(colors ?? {}, ["headerText", "header_text"]) ||
      pickStr(djTheme ?? {}, ["textColor", "text_color"]) ||
      pickStr(theme ?? {}, ["textColor", "text_color"]) ||
      defaultWidgetDraft.textColor,
    greetingMessage:
      pickStr(chatBox ?? {}, ["greetingMessage"]) ||
      pickStr(ui ?? {}, ["greetingMessage"]) ||
      pickStr(config ?? {}, ["greetingMessage"]) ||
      defaultWidgetDraft.greetingMessage,
    sendPlaceholder:
      pickStr(chatBox ?? {}, ["sendPlaceholder"]) ||
      pickStr(ui ?? {}, ["sendPlaceholder"]) ||
      pickStr(config ?? {}, ["messagePlaceholder"]) ||
      defaultWidgetDraft.sendPlaceholder,
    bannerOn:
      pickBool(chatBox ?? {}, ["bannerEnabled", "bannerOn"]) ??
      pickBool(ui ?? {}, ["bannerEnabled", "bannerOn"]) ??
      defaultWidgetDraft.bannerOn,
    bannerTitle: pickStr(chatBox ?? ui ?? {}, ["bannerTitle"]) || defaultWidgetDraft.bannerTitle,
    bannerDescription:
      pickStr(chatBox ?? ui ?? {}, ["bannerDescription"]) || defaultWidgetDraft.bannerDescription,
    bannerMediaType:
      (pickStr(chatBox ?? ui ?? {}, ["bannerMediaType"]) as WidgetDraft["bannerMediaType"]) ||
      defaultWidgetDraft.bannerMediaType,
    boxWidth: pickNum(chatBox ?? ui ?? {}, ["boxWidth", "width"]) ?? defaultWidgetDraft.boxWidth,
    boxHeight: pickNum(chatBox ?? ui ?? {}, ["boxHeight", "height"]) ?? defaultWidgetDraft.boxHeight,
    buttonLabel: pickStr(ui ?? {}, ["buttonLabel"]) || defaultWidgetDraft.buttonLabel,
    firstMessage: pickStr(ui ?? {}, ["firstMessage"]) || defaultWidgetDraft.firstMessage,
    messagePlaceholder: pickStr(ui ?? {}, ["messagePlaceholder"]) || defaultWidgetDraft.messagePlaceholder,
    backgroundColor:
      pickStr(colors ?? {}, ["panelBackground", "panel_background"]) ||
      pickStr(djTheme ?? {}, ["panelBackground", "panel_background"]) ||
      pickStr(djUi ?? {}, ["backgroundColor"]) ||
      pickStr(ui ?? {}, ["backgroundColor"]) ||
      defaultWidgetDraft.backgroundColor,
    popupEnabled: pickBool(ui ?? {}, ["popupEnabled"]) ?? defaultWidgetDraft.popupEnabled,
    botEnabled: pickBool(behavior ?? {}, ["botEnabled"]) ?? defaultWidgetDraft.botEnabled,
    notificationEnabled:
      pickBool(behavior ?? {}, ["notificationEnabled"]) ?? defaultWidgetDraft.notificationEnabled,
    browserNotification:
      pickBool(behavior ?? {}, ["browserNotification"]) ?? defaultWidgetDraft.browserNotification,
    soundNotification: pickBool(behavior ?? {}, ["soundNotification"]) ?? defaultWidgetDraft.soundNotification,
    fallbackNotificationText:
      pickStr(behavior ?? {}, ["fallbackNotificationText"]) || defaultWidgetDraft.fallbackNotificationText,
    videoWelcomeOn: pickBool(behavior ?? {}, ["videoWelcomeOn"]) ?? defaultWidgetDraft.videoWelcomeOn,
    welcomeMessageBehavior:
      pickStr(behavior ?? {}, ["welcomeMessage"]) || defaultWidgetDraft.welcomeMessageBehavior,
    autoOpenEnabled: pickBool(behavior ?? {}, ["autoOpenEnabled"]) ?? defaultWidgetDraft.autoOpenEnabled,
    autoOpenDelaySeconds:
      pickNum(behavior ?? {}, ["autoOpenDelaySeconds"]) ??
      pickNum(config ?? {}, ["autoPopupDelaySeconds"]) ??
      defaultWidgetDraft.autoOpenDelaySeconds,
    fileUploadEnabled:
      pickBool(behavior ?? {}, ["fileUploadEnabled"]) ??
      pickBool(config ?? {}, ["fileUploadEnabled"]) ??
      defaultWidgetDraft.fileUploadEnabled,
    emojiEnabled:
      pickBool(behavior ?? {}, ["emojiEnabled"]) ??
      pickBool(config ?? {}, ["emojiEnabled"]) ??
      defaultWidgetDraft.emojiEnabled,
    consentRequired: pickBool(behavior ?? {}, ["consentRequired"]) ?? defaultWidgetDraft.consentRequired,
    consentText:
      pickStr(behavior ?? {}, ["consentText"]) ||
      pickStr(config ?? {}, ["consentText"]) ||
      defaultWidgetDraft.consentText,
    privacyPolicyUrl:
      pickStr(behavior ?? {}, ["privacyPolicyUrl"]) ||
      pickStr(config ?? {}, ["privacyPolicyUrl"]) ||
      defaultWidgetDraft.privacyPolicyUrl,
    privacyNotice: pickStr(behavior ?? {}, ["privacyNotice"]) || defaultWidgetDraft.privacyNotice,
    allowedDomainsText:
      pickStr(behavior ?? {}, ["allowedDomainsText"]) || defaultWidgetDraft.allowedDomainsText,
    inquiryOn: inquiryOptions != null ? inquiryOptions.length > 0 : defaultWidgetDraft.inquiryOn,
    inquiryOptions: inquiryOptions?.length ? inquiryOptions : defaultWidgetDraft.inquiryOptions,
    persistVisitorSession:
      pickBool(session ?? {}, ["persistVisitorSession"]) ?? defaultWidgetDraft.persistVisitorSession,
    sessionTtlMinutes:
      pickNum(session ?? {}, ["sessionTtlMinutes", "session_ttl_minutes"]) ??
      pickNum(config ?? {}, ["expiresInMinutes"]) ??
      defaultWidgetDraft.sessionTtlMinutes,
    formEnabled:
      pickBool(form ?? {}, ["enabled"]) ??
      pickBool(config ?? {}, ["offlineFormEnabled"]) ??
      defaultWidgetDraft.formEnabled,
    formTitle:
      pickStr(form ?? {}, ["title"]) ||
      pickStr(config ?? {}, ["preChatFormText"]) ||
      defaultWidgetDraft.formTitle,
    formSubtitle: pickStr(form ?? {}, ["subtitle"]) || defaultWidgetDraft.formSubtitle,
    formSubmitLabel: pickStr(form ?? {}, ["submitLabel", "submit_label"]) || defaultWidgetDraft.formSubmitLabel,
    prechatNameEnabled:
      pickBool(form ?? {}, ["prechatNameEnabled"]) ??
      pickBool(config ?? {}, ["prechatNameEnabled"]) ??
      defaultWidgetDraft.prechatNameEnabled,
    prechatEmailEnabled:
      pickBool(form ?? {}, ["prechatEmailEnabled"]) ??
      pickBool(config ?? {}, ["prechatEmailEnabled"]) ??
      defaultWidgetDraft.prechatEmailEnabled,
    prechatPhoneEnabled:
      pickBool(form ?? {}, ["prechatPhoneEnabled"]) ??
      pickBool(config ?? {}, ["prechatPhoneEnabled"]) ??
      defaultWidgetDraft.prechatPhoneEnabled,
    prechatMessageEnabled:
      pickBool(form ?? {}, ["prechatMessageEnabled"]) ??
      pickBool(config ?? {}, ["prechatMessageEnabled"]) ??
      defaultWidgetDraft.prechatMessageEnabled,
    prechatMessageRequired:
      pickBool(form ?? {}, ["prechatMessageRequired"]) ??
      pickBool(config ?? {}, ["prechatMessageRequired"]) ??
      defaultWidgetDraft.prechatMessageRequired,
    responseWelcomeMessage:
      pickStr(response ?? {}, ["welcomeMessage"]) ||
      pickStr(config ?? {}, ["welcomeMessage"]) ||
      defaultWidgetDraft.responseWelcomeMessage,
    responseOfflineMessage:
      pickStr(response ?? {}, ["offlineMessage"]) ||
      pickStr(config ?? {}, ["offlineMessage"]) ||
      defaultWidgetDraft.responseOfflineMessage,
    responseGreetingMessage:
      pickStr(response ?? {}, ["greetingMessage"]) ||
      pickStr(config ?? {}, ["greetingMessage"]) ||
      defaultWidgetDraft.responseGreetingMessage,
    responseSendPlaceholder:
      pickStr(response ?? {}, ["sendPlaceholder"]) || defaultWidgetDraft.responseSendPlaceholder,
    responseAiPromptHint: pickStr(response ?? {}, ["aiPromptHint"]) || defaultWidgetDraft.responseAiPromptHint,
    responseAgentHandoverEnabled:
      pickBool(response ?? {}, ["agentHandoverEnabled"]) ??
      pickBool(config ?? {}, ["callHandoverEnabled"]) ??
      defaultWidgetDraft.responseAgentHandoverEnabled,
    responseHandoverTriggerText:
      pickStr(response ?? {}, ["handoverTriggerText"]) || defaultWidgetDraft.responseHandoverTriggerText,
  };

  if (colors) {
    const headerFallback =
      pickStr(colors, ["headerText", "header_text"]) || patch.textColor || defaultWidgetDraft.textColor;
    Object.assign(patch, widgetChatColorsDraftToPatch(mapApiChatColorsToDraft(colors, headerFallback)));
    const panelBg = pickStr(colors, ["panelBackground", "panel_background"]);
    if (panelBg) patch.backgroundColor = panelBg;
    const secondary = pickStr(colors, ["secondary"]);
    if (secondary) patch.themeSecondaryColor = secondary;
  }

  return patch;
}
