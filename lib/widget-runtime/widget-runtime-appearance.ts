import type { LauncherIconPresetId } from "@/lib/chat-widget/widgetDraft";
import {
  normalizeDesignAccent,
  normalizeDesignDensity,
  resolveAccentPalette,
  resolveDensityTokens,
  type AccentPalette,
  type DesignAccentId,
  type DesignDensityId,
  type DensityTokens,
} from "@/lib/chat-widget/design-accent-density";
import {
  resolveWidgetColorTokens,
  type ResolvedWidgetColors,
} from "./widget-color-tokens";
import {
  isPrechatFormEnabled,
  runtimeBoolFirst,
  runtimeBoolFlag,
  runtimeNumFlag,
} from "./widget-config-flags";
import {
  normalizeWidgetInquiryOptions,
  toRuntimeInquiryOptions,
  type RuntimeInquiryOption,
} from "@/lib/chat-widget/widget-inquiry.types";
import {
  configRecordFromEnvelope,
  inquiryFallbackFromExperience,
  inquiryOptionsFromExperience,
  parseWidgetExperienceV1,
} from "./widget-experience";
import type { WidgetConfigEnvelope } from "./widget-types";
import {
  normalizeLauncherBadgeMode,
  normalizeWidgetSoundId,
  type WidgetLauncherBadgeMode,
  type WidgetSoundId,
} from "./widget-notifications";
import {
  resolveProactiveTeaser,
  resolvePanelGreetingCopy,
  resolveChatWelcomeCopy,
} from "@/lib/chat-widget/widget-feature-toggles";
import type { ProactiveSecondaryCta } from "@/lib/chat-widget/proactive-teaser-types";

export interface RuntimeLauncherAppearance {
  /** `config.ctaButtonText` / `ui.buttonLabel` — FAB accessibility label. */
  buttonLabel: string;
  /** Invitation bubble above FAB when widget is closed (not unread preview). */
  proactiveTeaserActive: boolean;
  proactiveTeaser: string;
  proactiveTeaserAvatarUrl: string;
  proactiveSecondaryCta: ProactiveSecondaryCta;
  position: "left" | "center" | "right";
  shape: string;
  insetBottomPx: number;
  insetSidePx: number;
  iconPreset: LauncherIconPresetId;
  /** Published `ui.buttonIconUrl` — overrides preset when set. */
  iconUrl: string;
  buttonColor: string;
  buttonHoverColor: string;
  iconColor: string;
}

export interface RuntimeChatBoxAppearance {
  headerTitle: string;
  headerAlign: "left" | "center";
  headerBg: string;
  headerTextColor: string;
  greetingMessage: string;
  sendPlaceholder: string;
  backgroundColor: string;
  boxWidth: number;
  boxHeight: number;
  fontFamily: string;
}

export interface RuntimeFormAppearance {
  title: string;
  subtitle: string;
  submitLabel: string;
}

export interface RuntimeBannerAppearance {
  enabled: boolean;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  mediaType: string;
}

export interface RuntimeVideoWelcomeAppearance {
  enabled: boolean;
  url: string;
}

/** Greeting bubble shown before the pre-chat form in the embed widget. */
export function resolveEmbedGreetingMessage(
  appearance: RuntimeChatAppearance,
  fallbackWelcome?: string,
): string {
  return (
    appearance.panelGreetingMessage.trim() ||
    appearance.welcomeMessage.trim() ||
    appearance.chatBox.greetingMessage.trim() ||
    (fallbackWelcome ?? "").trim()
  );
}

export interface RuntimeChatAppearance {
  launcher: RuntimeLauncherAppearance;
  chatBox: RuntimeChatBoxAppearance;
  colors: ResolvedWidgetColors;
  /** Welcome / continue step copy (`config.welcomeMessage`, `response.welcomeMessage`). */
  welcomeMessage: string;
  /** Intro bubble in chat (`config.greetingMessage`, `chatBox`, `ui`). */
  panelGreetingMessage: string;
  /** First agent line after pre-chat (`ui.firstMessage`, `config.firstMessage`). */
  firstMessage: string;
  offlineMessage: string;
  bodyTextColor: string;
  mutedTextColor: string;
  borderRadiusPx: number;
  form: RuntimeFormAppearance;
  formEnabled: boolean;
  banner: RuntimeBannerAppearance;
  videoWelcome: RuntimeVideoWelcomeAppearance;
  inquiryOptions: RuntimeInquiryOption[];
  inquiryRequired: boolean;
  inquirySkipLabel: string;
  inquiryFallback: RuntimeInquiryOption | null;
  handoverTriggerText: string;
  agentHandoverEnabled: boolean;
  botEnabled: boolean;
  consentRequired: boolean;
  consentText: string;
  privacyPolicyUrl: string;
  privacyNotice: string;
  fileUploadEnabled: boolean;
  emojiEnabled: boolean;
  autoOpenEnabled: boolean;
  autoOpenDelaySeconds: number;
  /** When false, auto-open only on first site visit (localStorage marker). */
  autoOpenOnReturnVisit: boolean;
  notificationEnabled: boolean;
  soundNotification: boolean;
  notificationSoundId: WidgetSoundId;
  launcherBadgeMode: WidgetLauncherBadgeMode;
  fallbackNotificationText: string;
  motionEnabled: boolean;
  /** `theme.designJson.accent` / `density` — panel spacing + accent family. */
  designAccent: DesignAccentId;
  designDensity: DesignDensityId;
  accentPalette: AccentPalette;
  densityTokens: DensityTokens;
}

const LAUNCHER_PRESETS = new Set<string>([
  "",
  "phosphor-chat-circle",
  "phosphor-chats-circle",
  "phosphor-chat-dots",
  "phosphor-chat-teardrop",
]);

function isObj(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

function strFirst(...candidates: unknown[]): string {
  for (const c of candidates) {
    const s = str(c, "");
    if (s) return s;
  }
  return "";
}

function numFirst(...candidates: unknown[]): number | undefined {
  for (const c of candidates) {
    const n = typeof c === "number" ? c : typeof c === "string" ? Number.parseFloat(c) : NaN;
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function normalizePosition(raw: string): RuntimeLauncherAppearance["position"] {
  const s = raw.toLowerCase();
  if (s === "left") return "left";
  if (s === "center") return "center";
  return "right";
}

function normalizeHeaderAlign(raw: string): RuntimeChatBoxAppearance["headerAlign"] {
  return raw.toLowerCase() === "left" ? "left" : "center";
}

function normalizeIconPreset(raw: string): LauncherIconPresetId {
  if (LAUNCHER_PRESETS.has(raw)) return raw as LauncherIconPresetId;
  return "phosphor-chat-circle";
}

function readDesignJson(cfg: Record<string, unknown>): Record<string, unknown> | null {
  const theme = isObj(cfg.theme) ? cfg.theme : null;
  return theme && isObj(theme.designJson) ? theme.designJson : null;
}

/** Deep-merge `settingsJson` slices without replacing `theme` or wiping partial `ui`. */
function mergeSettingsJsonIntoConfig(
  cfg: Record<string, unknown>,
  settingsJson: Record<string, unknown>,
): void {
  for (const [key, value] of Object.entries(settingsJson)) {
    if (key === "settingsJson" || key === "theme") continue;
    if (isObj(value) && isObj(cfg[key])) {
      cfg[key] = { ...(cfg[key] as Record<string, unknown>), ...value };
    } else if (value !== undefined) {
      cfg[key] = value;
    }
  }
}

/** Hoist `theme.designJson.{ui,form,behavior,response}` onto config root for runtime mappers. */
function hoistDesignJsonSections(cfg: Record<string, unknown>): Record<string, unknown> {
  const dj = readDesignJson(cfg);
  if (!dj) return cfg;

  const out = { ...cfg };
  const hoist = (key: string) => {
    const fromDj = dj[key];
    const existing = out[key];
    if (isObj(fromDj)) {
      out[key] = isObj(existing) ? { ...fromDj, ...existing } : { ...fromDj };
    }
  };

  hoist("ui");
  hoist("form");
  hoist("behavior");
  hoist("response");
  hoist("session");

  if (isObj(dj.theme)) {
    out._designThemeTokens = dj.theme;
  }

  return out;
}

function parseInquiryOptions(
  behavior: Record<string, unknown> | null,
): RuntimeInquiryOption[] {
  return toRuntimeInquiryOptions(normalizeWidgetInquiryOptions(behavior?.inquiryOptions));
}

/** Merge config from public config / snapshot-like shapes into one record for appearance + prechat. */
export function resolveRuntimeConfigRecord(envelope: WidgetConfigEnvelope): Record<string, unknown> {
  const root: Record<string, unknown> = {
    widgetKey: envelope.widgetKey,
    websiteId: envelope.websiteId,
    widgetType: envelope.widgetType,
    chatMode: envelope.chatMode,
    allowedDomains: envelope.allowedDomains,
  };

  let cfg = configRecordFromEnvelope(envelope);

  const settingsJson = cfg.settingsJson;
  if (isObj(settingsJson)) {
    mergeSettingsJsonIntoConfig(cfg, settingsJson);
    delete cfg.settingsJson;
  }

  return hoistDesignJsonSections({ ...root, ...cfg });
}

/**
 * Read published widget config (`theme.designJson` + hoisted ui/form/behavior).
 */
export function extractRuntimeChatAppearance(
  configRecord: Record<string, unknown>,
): RuntimeChatAppearance {
  const theme = isObj(configRecord.theme) ? configRecord.theme : null;
  const ui = isObj(configRecord.ui) ? configRecord.ui : null;
  const behavior = isObj(configRecord.behavior) ? configRecord.behavior : null;
  const response = isObj(configRecord.response) ? configRecord.response : null;
  const formCfg = isObj(configRecord.form) ? configRecord.form : null;

  const dj = readDesignJson(configRecord);
  const designAccent = normalizeDesignAccent(typeof dj?.accent === "string" ? dj.accent : undefined);
  const designDensity = normalizeDesignDensity(typeof dj?.density === "string" ? dj.density : undefined);
  const accentPalette = resolveAccentPalette(designAccent);
  const densityTokens = resolveDensityTokens(designDensity);
  const djUi = dj && isObj(dj.ui) ? dj.ui : null;
  const chat = dj && isObj(dj.chat) ? dj.chat : null;
  const launcher = chat && isObj(chat.launcher) ? chat.launcher : null;
  const chatBox = chat && isObj(chat.chatBox) ? chat.chatBox : null;
  const colors = chat && isObj(chat.colors) ? chat.colors : null;
  const designTokens =
    (isObj(configRecord._designThemeTokens) ? configRecord._designThemeTokens : null) ??
    (dj && isObj(dj.theme) ? dj.theme : null);

  const resolvedColors = resolveWidgetColorTokens({
    theme,
    chatColors: colors,
    designTheme: designTokens,
    ui,
  });

  const buttonColor = resolvedColors.primary;
  const buttonHover = strFirst(
    colors?.buttonHover,
    colors?.button_hover,
    ui?.buttonHoverColor,
    theme?.buttonHoverColor,
    buttonColor,
  );
  const iconColor = strFirst(
    colors?.icon,
    theme?.textColor,
    designTokens?.iconColor,
    resolvedColors.outgoingBubbleText,
  );
  const headerTextColor = resolvedColors.headerText;
  const bodyTextColor = resolvedColors.bodyText;
  const mutedTextColor = resolvedColors.mutedText;

  const panelGreetingMessage = resolvePanelGreetingCopy(
    strFirst(
      configRecord.greetingMessage,
      chatBox?.greetingMessage,
      ui?.greetingMessage,
      behavior?.welcomeMessage,
      "How can we help?",
    ),
    { ...ui, ...djUi, panelGreetingEnabled: ui?.panelGreetingEnabled },
  );

  const welcomeMessage = strFirst(
    response?.welcomeMessage,
    configRecord.welcomeMessage,
    behavior?.welcomeMessage,
    panelGreetingMessage,
  );

  const borderRadiusPx = resolvedColors.borderRadiusPx;

  const agentHandoverEnabled = runtimeBoolFirst(
    true,
    response?.agentHandoverEnabled,
    response?.responseAgentHandoverEnabled,
    configRecord.callHandoverEnabled,
    configRecord.agentHandoverEnabled,
  );

  const autoOpenEnabled = runtimeBoolFirst(
    false,
    behavior?.autoOpenEnabled,
    ui?.popupEnabled,
    configRecord.autoPopupEnabled,
  );

  const autoOpenDelaySeconds = Math.min(
    300,
    Math.max(
      0,
      runtimeNumFlag(
        configRecord.autoPopupDelaySeconds,
        runtimeNumFlag(behavior?.autoOpenDelaySeconds, 10),
      ),
    ),
  );

  const notificationEnabled = runtimeBoolFirst(
    true,
    behavior?.notificationEnabled,
    behavior?.browserNotification,
  );
  const soundNotification = behavior?.soundNotification === true;
  const notificationSoundId = normalizeWidgetSoundId(
    behavior?.notificationSoundId ?? behavior?.soundId,
  );
  const launcherBadgeMode = normalizeLauncherBadgeMode(
    behavior?.launcherBadgeMode ?? behavior?.launcherBadge,
  );
  const fallbackNotificationText = strFirst(
    behavior?.fallbackNotificationText,
    behavior?.fallbackNotification,
    configRecord.fallbackNotificationText,
    "You have a new message from support.",
  );
  const autoOpenOnReturnVisit =
    behavior?.autoOpenOnReturnVisit === true || behavior?.autoOpenReturnVisit === true;

  return {
    colors: resolvedColors,
    welcomeMessage,
    panelGreetingMessage,
    firstMessage: resolveChatWelcomeCopy(
      strFirst(ui?.firstMessage, configRecord.firstMessage, chatBox?.firstMessage, ""),
      { ...ui, ...djUi },
    ),
    offlineMessage: strFirst(
      response?.offlineMessage,
      configRecord.offlineMessage,
      configRecord.offlineFormMessage,
      "",
    ),
    bodyTextColor,
    mutedTextColor,
    borderRadiusPx,
    formEnabled: isPrechatFormEnabled(configRecord),
    handoverTriggerText: strFirst(
      response?.handoverTriggerText,
      response?.handover_trigger_text,
      behavior?.handoverTriggerText,
      "Talk to agent",
    ),
    agentHandoverEnabled,
    botEnabled: runtimeBoolFlag(behavior?.botEnabled, true),
    consentRequired: runtimeBoolFirst(
      Boolean(strFirst(configRecord.consentText, behavior?.consentText, formCfg?.consentText)),
      behavior?.consentRequired,
      configRecord.consentRequired,
    ),
    consentText: strFirst(
      configRecord.consentText,
      behavior?.consentText,
      formCfg?.consentText,
      "I agree to the chat terms and privacy policy.",
    ),
    privacyPolicyUrl: strFirst(
      configRecord.privacyPolicyUrl,
      behavior?.privacyPolicyUrl,
      formCfg?.privacyPolicyUrl,
      "",
    ),
    privacyNotice: strFirst(behavior?.privacyNotice, configRecord.privacyNotice, ""),
    fileUploadEnabled: runtimeBoolFirst(
      true,
      configRecord.fileUploadEnabled,
      behavior?.fileUploadEnabled,
    ),
    emojiEnabled: runtimeBoolFirst(true, configRecord.emojiEnabled, behavior?.emojiEnabled),
    autoOpenEnabled,
    autoOpenDelaySeconds,
    autoOpenOnReturnVisit,
    notificationEnabled,
    soundNotification,
    notificationSoundId,
    launcherBadgeMode,
    fallbackNotificationText,
    motionEnabled: behavior?.motionEnabled !== false,
    designAccent,
    designDensity,
    accentPalette,
    densityTokens,
    inquiryOptions: (() => {
      const chatMode = String(configRecord.mode ?? configRecord.chatMode ?? "").toUpperCase();
      if (chatMode === "AI_ONLY") return [];
      const exp = parseWidgetExperienceV1(configRecord._experience);
      if (exp?.inquiry.enabled) return inquiryOptionsFromExperience(exp);
      return parseInquiryOptions(behavior);
    })(),
    inquiryRequired: (() => {
      const exp = parseWidgetExperienceV1(configRecord._experience);
      if (exp) return exp.inquiry.required;
      return behavior?.inquiryRequired === true;
    })(),
    inquirySkipLabel: strFirst(
      behavior?.inquirySkipLabel,
      "General question",
    ),
    inquiryFallback: (() => {
      const exp = parseWidgetExperienceV1(configRecord._experience);
      if (exp) return inquiryFallbackFromExperience(exp);
      const key = strFirst(behavior?.inquiryFallbackRoutingKey);
      const opts = parseInquiryOptions(behavior);
      if (key) {
        return opts.find((o) => o.routingKey === key) ?? opts[0] ?? null;
      }
      return (
        opts.find(
          (o) => o.internalDepartmentId?.trim() || o.externalDepartmentId?.trim(),
        ) ??
        opts[0] ??
        null
      );
    })(),
    form: {
      title: strFirst(formCfg?.title, configRecord.preChatFormText, "Before we start"),
      subtitle: strFirst(formCfg?.subtitle, "Tell us who you are"),
      submitLabel: strFirst(formCfg?.submitLabel, "Start chat"),
    },
    banner: {
      enabled:
        chatBox?.bannerEnabled === true ||
        ui?.bannerOn === true ||
        ui?.bannerEnabled === true ||
        configRecord.bannerOn === true ||
        chatBox?.bannerEnabled === "true" ||
        ui?.bannerOn === "true" ||
        configRecord.bannerOn === "true",
      title: strFirst(chatBox?.bannerTitle, ui?.bannerTitle, configRecord.bannerTitle),
      description: strFirst(chatBox?.bannerDescription, ui?.bannerDescription, configRecord.bannerDescription),
      imageUrl: strFirst(chatBox?.bannerImageUrl, ui?.bannerImageUrl, configRecord.bannerImageUrl),
      videoUrl: strFirst(
        ui?.bannerVideoUrl,
        chatBox?.bannerVideoUrl,
        configRecord.bannerVideoUrl,
      ),
      mediaType: strFirst(chatBox?.bannerMediaType, ui?.bannerMediaType, configRecord.bannerMediaType, "image"),
    },
    videoWelcome: {
      enabled:
        behavior?.videoWelcomeOn === true ||
        configRecord.videoWelcomeOn === true,
      url: strFirst(behavior?.videoWelcomeUrl, configRecord.videoWelcomeUrl),
    },
    launcher: (() => {
      const teaser = resolveProactiveTeaser({ ...djUi, ...ui });
      return {
      buttonLabel: strFirst(
        configRecord.ctaButtonText,
        ui?.buttonLabel,
        djUi?.buttonLabel,
        "Chat with us",
      ),
      proactiveTeaserActive: teaser.active,
      proactiveTeaser: teaser.text,
      proactiveTeaserAvatarUrl: teaser.avatarUrl,
      proactiveSecondaryCta: teaser.secondaryCta,
      position: normalizePosition(
        strFirst(ui?.buttonPosition, theme?.position, launcher?.position, "right"),
      ),
      shape: strFirst(ui?.buttonShape, theme?.buttonShape, launcher?.shape, "circle"),
      insetBottomPx: numFirst(
        launcher?.insetBottomPx,
        ui?.launcherInsetBottomPx,
        djUi?.launcherInsetBottomPx,
      ) ?? 28,
      insetSidePx:
        numFirst(launcher?.insetSidePx, ui?.launcherInsetSidePx, djUi?.launcherInsetSidePx) ?? 28,
      iconPreset: normalizeIconPreset(
        strFirst(
          launcher?.iconPreset,
          ui?.launcherIconPreset,
          ui?.iconPreset,
          djUi?.launcherIconPreset,
          "phosphor-chat-circle",
        ),
      ),
      iconUrl: strFirst(launcher?.iconUrl, ui?.buttonIconUrl),
      buttonColor,
      buttonHoverColor: buttonHover,
      iconColor,
    };
    })(),
    chatBox: {
      headerTitle: strFirst(chatBox?.headerTitle, ui?.headerTitle, "Live chat"),
      headerAlign: normalizeHeaderAlign(
        strFirst(chatBox?.headerAlign, chatBox?.headerTitleAlign, ui?.headerTitleAlign, "center"),
      ),
      headerBg: resolvedColors.headerBackground,
      headerTextColor,
      greetingMessage: panelGreetingMessage,
      sendPlaceholder: strFirst(
        chatBox?.sendPlaceholder,
        ui?.sendPlaceholder,
        djUi?.sendPlaceholder,
        response?.sendPlaceholder,
        ui?.messagePlaceholder,
        "Write a message…",
      ),
      backgroundColor: resolvedColors.panelBackground,
      boxWidth: Math.min(
        520,
        Math.max(280, numFirst(chatBox?.boxWidth, ui?.boxWidth, djUi?.boxWidth) ?? 360),
      ),
      boxHeight: Math.min(
        640,
        Math.max(320, numFirst(chatBox?.boxHeight, ui?.boxHeight, djUi?.boxHeight) ?? 480),
      ),
      fontFamily: resolvedColors.fontFamily,
    },
  };
}

export function launcherFabPositionSx(
  appearance: RuntimeLauncherAppearance,
): Record<string, string | number> {
  const { position, insetBottomPx, insetSidePx } = appearance;
  const base = { bottom: `${insetBottomPx}px` };
  if (position === "left") {
    return { ...base, left: `${insetSidePx}px`, right: "auto", transform: "none" };
  }
  if (position === "center") {
    return {
      ...base,
      left: "50%",
      right: "auto",
      transform: `translateX(calc(-50% + ${insetSidePx}px))`,
    };
  }
  return { ...base, right: `${insetSidePx}px`, left: "auto", transform: "none" };
}

export function launcherEmbedRootSx(
  position: RuntimeLauncherAppearance["position"],
): Record<string, string | number> {
  const base = { bottom: 0, top: "auto" as const };
  if (position === "left") {
    return { ...base, left: 0, right: "auto", transform: "none" };
  }
  if (position === "center") {
    return { ...base, left: "50%", right: "auto", transform: "translateX(-50%)" };
  }
  return { ...base, right: 0, left: "auto", transform: "none" };
}

export function launcherBorderRadius(shape: string): string {
  const s = shape.toLowerCase();
  if (s === "square") return "10px";
  if (s === "rounded") return "16px";
  return "50%";
}
